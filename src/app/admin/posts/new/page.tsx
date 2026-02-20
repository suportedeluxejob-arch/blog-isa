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
            publishedAt: postData.status === "published" ? Timestamp.now() : undefined,
        });
        router.push("/admin");
    };

    return (
        <div className="py-4">
            <PostEditor onSave={handleSave} />
        </div>
    );
}
