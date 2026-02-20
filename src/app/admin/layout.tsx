"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { LayoutDashboard, LogOut, FileText, FolderOpen } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (!loading && !user && !isLoginPage) {
            router.push("/admin/login");
        }
    }, [user, loading, router, isLoginPage]);

    // Always render the login page without auth check
    if (isLoginPage) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600"></div>
                    <p className="text-sm text-gray-500">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            {/* Top Nav */}
            <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl px-4 py-3 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600 text-white font-bold text-sm">
                                A
                            </div>
                            <span className="text-lg font-bold text-gray-800">Admin</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <NavLink href="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" active={pathname === "/admin"} />
                            <NavLink href="/admin/posts/new" icon={<FileText size={16} />} label="Novo Artigo" active={pathname === "/admin/posts/new"} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden md:flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Ver Site →
                        </Link>
                        <div className="text-xs text-gray-400">{user.email}</div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            <LogOut size={14} />
                            Sair
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto flex-1 p-4 md:p-6">{children}</main>
        </div>
    );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${active
                ? "bg-pink-50 text-pink-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
