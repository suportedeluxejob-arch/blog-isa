"use client";

import { useEffect, useState } from "react";
import PostEditor from "@/components/admin/PostEditor";
import { getPostById, updatePost, BlogPost } from "@/services/postService";
import { useRouter, useParams } from "next/navigation";
import { Timestamp } from "firebase/firestore";

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
        });
        router.push("/admin");
    };

    if (loading) return <div>Loading...</div>;
    if (!post) return <div>Post not found</div>;

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">Edit Post</h1>
            <PostEditor initialPost={post} onSave={handleSave} />
        </div>
    );
}
