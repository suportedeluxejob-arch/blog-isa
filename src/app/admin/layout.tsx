"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        }
    }, [user, loading, router]);

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
