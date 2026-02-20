"use client";

import { useEffect, useState } from "react";
import { getPosts, BlogPost, deletePost } from "@/services/postService";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await getPosts();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            await deletePost(id);
            fetchPosts();
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    if (loading) return <div className="p-8">Loading posts...</div>;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800">Blog Posts</h2>
                <div className="flex gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                    <Link
                        href="/admin/posts/new"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <PlusCircle size={20} />
                        Create New Post
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs font-medium uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Slug</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    No posts found. Create one!
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {post.title}
                                    </td>
                                    <td className="px-6 py-4">{post.slug}</td>
                                    <td className="px-6 py-4">
                                        {post.createdAt?.toDate().toLocaleDateString()}
                                    </td>
                                    <td className="flex gap-3 px-6 py-4">
                                        <Link
                                            href={`/admin/posts/${post.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id!)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
