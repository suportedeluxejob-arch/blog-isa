"use client";

import { useEffect, useState } from "react";
import PostEditor from "@/components/admin/PostEditor";
import { getPostById, updatePost, BlogPost } from "@/services/postService";
import { useRouter, useParams } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getPostById(id).then((data) => {
                setPost(data);
                setLoading(false);
            });
        }
    }, [id]);

    const handleSave = async (postData: any) => {
        await updatePost(id, {
            ...postData,
            updatedAt: Timestamp.now(),
            ...(postData.status === "published" && !post?.publishedAt
                ? { publishedAt: Timestamp.now() }
                : {}),
        });
        router.push("/admin");
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-pink-600" />
                    <p className="text-sm text-gray-500">Carregando artigo...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-gray-500">Artigo não encontrado</p>
            </div>
        );
    }

    return (
        <div className="py-4">
            <PostEditor initialPost={post} onSave={handleSave} />
        </div>
    );
}
