"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

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

    // Always render the login page, even if not authenticated
    if (isLoginPage) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <nav className="border-b bg-white px-4 py-3 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                    <div className="text-sm text-gray-600">{user.email}</div>
                </div>
            </nav>
            <main className="container mx-auto flex-1 p-4">{children}</main>
        </div>
    );
}
