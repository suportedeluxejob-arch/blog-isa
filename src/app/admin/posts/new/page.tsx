"use client";

import PostEditor from "@/components/admin/PostEditor";
import { createPost } from "@/services/postService";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

export default function NewPostPage() {
    const router = useRouter();

    const handleSave = async (postData: any) => {
        await createPost({
            ...postData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        router.push("/admin");
    };

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">Create New Post</h1>
            <PostEditor onSave={handleSave} />
        </div>
    );
}
