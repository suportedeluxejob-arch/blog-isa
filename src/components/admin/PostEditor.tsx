"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { BlogPost } from "@/services/postService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface PostEditorProps {
    initialPost?: BlogPost;
    onSave: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export default function PostEditor({ initialPost, onSave }: PostEditorProps) {
    const [title, setTitle] = useState(initialPost?.title || "");
    const [slug, setSlug] = useState(initialPost?.slug || "");
    const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
    const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "");
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // SEO Fields
    const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || "");
    const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription || "");
    const [seoKeywords, setSeoKeywords] = useState(initialPost?.seoKeywords || "");

    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension,
            LinkExtension.configure({
                openOnClick: false,
            }),
        ],
        content: initialPost?.content || "<p>Start writing your amazing post...</p>",
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
            },
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `blog-images/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setCoverImage(url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!editor) return;
        setIsSaving(true);
        try {
            await onSave({
                title,
                slug,
                excerpt,
                coverImage,
                content: editor.getHTML(),
                seoTitle,
                seoDescription,
                seoKeywords,
            });
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save post");
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-generate slug from title if slug is empty
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!initialPost && !slug) {
            setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-20">
            {/* Main Content */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Content</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Post Title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="post-url-slug"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                        <div className="mt-2 flex items-center gap-4">
                            {coverImage && (
                                <div className="relative h-32 w-48 overflow-hidden rounded-lg border">
                                    <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
                                </div>
                            )}
                            <label className="cursor-pointer flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 hover:bg-gray-50">
                                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                                <span>{coverImage ? "Change Image" : "Upload Image"}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Brief summary of the post..."
                        />
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Body</label>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 min-h-[400px]">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Settings */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">SEO Settings</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                        <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300" placeholder="SEO Title (defaults to post title)" />
                        <p className="mt-1 text-xs text-gray-500">{seoTitle.length}/60 characters</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                        <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className="mt-1 block w-full rounded-lg border-gray-300" placeholder="SEO Description" />
                        <p className="mt-1 text-xs text-gray-500">{seoDescription.length}/160 characters</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Keywords</label>
                        <input type="text" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300" placeholder="comma, separated, keywords" />
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {isSaving ? <Loader2 className="animate-spin" /> : "Save Post"}
            </button>
        </div>
    );
}
