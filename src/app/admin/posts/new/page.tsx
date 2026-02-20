"use client";

import PostEditor from "@/components/admin/PostEditor";
import { createPost } from "@/services/postService";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

export default function NewPostPage() {
    const router = useRouter();

    const handleSave = async (postData: any) => {
        const dataToSave: any = {
            ...postData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        if (postData.status === "published") {
            dataToSave.publishedAt = Timestamp.now();
        }
        await createPost(dataToSave);
        router.push("/admin");
    };

    return (
        <div className="py-4">
            <PostEditor onSave={handleSave} />
        </div>
    );
}
