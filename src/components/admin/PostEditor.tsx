"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { BlogPost, getCategories, Category } from "@/services/postService";
import {
    Loader2, Save, ArrowLeft,
    Bold, Italic, List, ListOrdered, Quote, Heading2, Link2, ImagePlus,
    Globe, Search, Target, AlertCircle, CheckCircle2, Info, LinkIcon
} from "lucide-react";
import Link from "next/link";

interface PostEditorProps {
    initialPost?: BlogPost;
    onSave: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export default function PostEditor({ initialPost, onSave }: PostEditorProps) {
    // Content Fields
    const [title, setTitle] = useState(initialPost?.title || "");
    const [slug, setSlug] = useState(initialPost?.slug || "");
    const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
    const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "");
    const [category, setCategory] = useState(initialPost?.category || "");
    const [articleType, setArticleType] = useState<"educational" | "sales">(initialPost?.articleType || "educational");
    const [status, setStatus] = useState<"draft" | "published">(initialPost?.status || "draft");
    const [author] = useState(initialPost?.author || "Isabelle");

    // SEO Fields
    const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle || "");
    const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription || "");
    const [seoKeywords, setSeoKeywords] = useState(initialPost?.seoKeywords || "");
    const [focusKeyword, setFocusKeyword] = useState(initialPost?.focusKeyword || "");
    const [canonicalUrl, setCanonicalUrl] = useState(initialPost?.canonicalUrl || "");
    const [ogTitle, setOgTitle] = useState(initialPost?.ogTitle || "");
    const [ogDescription, setOgDescription] = useState(initialPost?.ogDescription || "");

    // Product Fields (for sales articles)
    const [productName, setProductName] = useState(initialPost?.productName || "");
    const [productPrice, setProductPrice] = useState(initialPost?.productPrice || "");
    const [productRating, setProductRating] = useState(initialPost?.productRating || 0);
    const [affiliateLink, setAffiliateLink] = useState(initialPost?.affiliateLink || "");

    // State
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeSection, setActiveSection] = useState<"content" | "seo" | "product">("content");

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension,
            LinkExtension.configure({ openOnClick: false }),
        ],
        content: initialPost?.content || "",
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[400px] p-6",
            },
        },
    });

    const handleEditorImageInsert = () => {
        const url = prompt("Cole a URL da imagem:");
        if (url && editor) {
            editor.chain().focus().setImage({ src: url, alt: "imagem" }).run();
        }
    };

    const handleSave = async () => {
        if (!editor) return;
        if (!title.trim()) { alert("Título é obrigatório"); return; }
        if (!slug.trim()) { alert("Slug é obrigatório"); return; }

        setIsSaving(true);
        try {
            // IMPORTANT: Firestore does NOT accept undefined values!
            // Use empty strings instead of undefined
            const postData: any = {
                title,
                slug,
                excerpt: excerpt || "",
                coverImage: coverImage || "",
                content: editor.getHTML(),
                category: category || "",
                articleType,
                status,
                author,
                seoTitle: seoTitle || "",
                seoDescription: seoDescription || "",
                seoKeywords: seoKeywords || "",
                focusKeyword: focusKeyword || "",
                canonicalUrl: canonicalUrl || "",
                ogTitle: ogTitle || "",
                ogDescription: ogDescription || "",
                ogImage: coverImage || "",
                schemaType: articleType === "sales" ? "Product" : "Article",
                productName: articleType === "sales" ? (productName || "") : "",
                productPrice: articleType === "sales" ? (productPrice || "") : "",
                productRating: articleType === "sales" ? (productRating || 0) : 0,
                affiliateLink: articleType === "sales" ? (affiliateLink || "") : "",
            };

            await onSave(postData);
        } catch (error: any) {
            console.error("Save failed", error);
            alert(`Falha ao salvar: ${error?.message || "Erro desconhecido"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!initialPost && !slug) {
            setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
        }
    };

    // SEO Analysis
    const seoChecks = analyzeSeo();

    function analyzeSeo() {
        const checks: { label: string; status: "good" | "warning" | "bad"; tip: string }[] = [];
        const effectiveTitle = seoTitle || title;
        const effectiveDesc = seoDescription || excerpt;

        // Title
        if (effectiveTitle.length >= 30 && effectiveTitle.length <= 60) {
            checks.push({ label: "Meta Title", status: "good", tip: `${effectiveTitle.length} caracteres (ideal: 30-60)` });
        } else if (effectiveTitle.length > 0) {
            checks.push({ label: "Meta Title", status: "warning", tip: `${effectiveTitle.length} caracteres (ideal: 30-60)` });
        } else {
            checks.push({ label: "Meta Title", status: "bad", tip: "Adicione um título SEO" });
        }

        // Description
        if (effectiveDesc.length >= 120 && effectiveDesc.length <= 160) {
            checks.push({ label: "Meta Description", status: "good", tip: `${effectiveDesc.length} caracteres (ideal: 120-160)` });
        } else if (effectiveDesc.length > 0) {
            checks.push({ label: "Meta Description", status: "warning", tip: `${effectiveDesc.length} caracteres (ideal: 120-160)` });
        } else {
            checks.push({ label: "Meta Description", status: "bad", tip: "Adicione uma descrição" });
        }

        // Focus Keyword
        if (focusKeyword) {
            const titleHasKw = effectiveTitle.toLowerCase().includes(focusKeyword.toLowerCase());
            const descHasKw = effectiveDesc.toLowerCase().includes(focusKeyword.toLowerCase());
            const slugHasKw = slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, "-"));

            if (titleHasKw) checks.push({ label: "Keyword no Título", status: "good", tip: "Palavra-chave encontrada no título" });
            else checks.push({ label: "Keyword no Título", status: "bad", tip: "Adicione a palavra-chave ao título" });

            if (descHasKw) checks.push({ label: "Keyword na Descrição", status: "good", tip: "Palavra-chave encontrada na descrição" });
            else checks.push({ label: "Keyword na Descrição", status: "warning", tip: "Inclua a palavra-chave na descrição" });

            if (slugHasKw) checks.push({ label: "Keyword no Slug", status: "good", tip: "Palavra-chave encontrada na URL" });
            else checks.push({ label: "Keyword no Slug", status: "warning", tip: "Inclua a palavra-chave na URL" });
        } else {
            checks.push({ label: "Focus Keyword", status: "bad", tip: "Defina uma palavra-chave principal" });
        }

        // Cover Image
        if (coverImage) checks.push({ label: "Imagem de Capa", status: "good", tip: "Imagem definida" });
        else checks.push({ label: "Imagem de Capa", status: "warning", tip: "Adicione uma imagem de capa" });

        // Content length
        const contentText = editor?.getText() || "";
        if (contentText.length > 1000) checks.push({ label: "Tamanho Conteúdo", status: "good", tip: `${contentText.split(/\s+/).length} palavras` });
        else if (contentText.length > 300) checks.push({ label: "Tamanho Conteúdo", status: "warning", tip: `${contentText.split(/\s+/).length} palavras (ideal: +300)` });
        else checks.push({ label: "Tamanho Conteúdo", status: "bad", tip: "Conteúdo muito curto para SEO" });

        return checks;
    }

    const seoScore = Math.round((seoChecks.filter(c => c.status === "good").length / seoChecks.length) * 100);

    return (
        <div className="mx-auto max-w-6xl pb-20">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                    <ArrowLeft size={16} /> Voltar ao Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    {/* Status Toggle */}
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${status === "published"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                    >
                        <option value="draft">📝 Rascunho</option>
                        <option value="published">✅ Publicado</option>
                    </select>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section Tabs */}
                    <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                        <button onClick={() => setActiveSection("content")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeSection === "content" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                            📝 Conteúdo
                        </button>
                        <button onClick={() => setActiveSection("seo")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeSection === "seo" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                            🔍 SEO
                        </button>
                        {articleType === "sales" && (
                            <button onClick={() => setActiveSection("product")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeSection === "product" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                                💰 Produto
                            </button>
                        )}
                    </div>

                    {activeSection === "content" && (
                        <div className="space-y-6">
                            {/* Title */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    className="w-full border-0 text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-0"
                                    placeholder="Título do artigo..."
                                />
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                    <Globe size={12} />
                                    achadosvipdaisa.com.br/reviews/<span className="text-pink-600">{slug || "..."}</span>
                                </div>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="mt-1 w-full border-0 text-sm text-gray-500 placeholder-gray-300 focus:outline-none focus:ring-0"
                                    placeholder="slug-do-artigo"
                                />
                            </div>

                            {/* Cover Image - via URL */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Imagem de Capa (URL)</label>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon size={16} className="text-gray-400 flex-shrink-0" />
                                        <input
                                            type="url"
                                            value={coverImage}
                                            onChange={(e) => setCoverImage(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                            placeholder="https://exemplo.com/imagem.jpg"
                                        />
                                    </div>
                                    {coverImage && (
                                        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            <img src={coverImage} alt="Preview" className="h-full w-full object-contain" />
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400">Cole a URL de qualquer imagem da internet (Shopee, Amazon, etc.)</p>
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Resumo / Excerpt</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                    placeholder="Resumo breve do artigo que aparece na listagem..."
                                />
                            </div>

                            {/* Editor */}
                            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50/50 px-3 py-2">
                                    <ToolbarButton icon={<Bold size={16} />} onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} tooltip="Negrito" />
                                    <ToolbarButton icon={<Italic size={16} />} onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} tooltip="Itálico" />
                                    <div className="mx-1 h-5 w-px bg-gray-200" />
                                    <ToolbarButton icon={<Heading2 size={16} />} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} tooltip="Subtítulo" />
                                    <ToolbarButton icon={<List size={16} />} onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} tooltip="Lista" />
                                    <ToolbarButton icon={<ListOrdered size={16} />} onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} tooltip="Lista Numerada" />
                                    <ToolbarButton icon={<Quote size={16} />} onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} tooltip="Citação" />
                                    <div className="mx-1 h-5 w-px bg-gray-200" />
                                    <ToolbarButton icon={<Link2 size={16} />} onClick={() => {
                                        const url = prompt("URL do link:");
                                        if (url) editor?.chain().focus().setLink({ href: url }).run();
                                    }} active={editor?.isActive("link")} tooltip="Link" />
                                    <ToolbarButton icon={<ImagePlus size={16} />} onClick={handleEditorImageInsert} tooltip="Inserir Imagem (URL)" />
                                </div>
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    )}

                    {activeSection === "seo" && (
                        <div className="space-y-6">
                            {/* Google Preview */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Search size={16} /> Preview do Google
                                </h3>
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <p className="text-sm text-emerald-700 mb-0.5">achadosvipdaisa.com.br › reviews › {slug || "..."}</p>
                                    <h4 className="text-xl text-blue-800 hover:underline cursor-pointer mb-1">{seoTitle || title || "Título do Artigo"}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-2">{seoDescription || excerpt || "Descrição do artigo aparece aqui nos resultados de busca do Google..."}</p>
                                </div>
                            </div>

                            {/* SEO Fields */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Target size={16} /> Configurações SEO
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">🎯 Focus Keyword (Palavra-Chave Principal)</label>
                                    <input
                                        value={focusKeyword}
                                        onChange={(e) => setFocusKeyword(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Ex: mini processador de alho"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">A palavra-chave principal que você quer ranquear no Google</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                    <input
                                        value={seoTitle}
                                        onChange={(e) => setSeoTitle(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Título SEO (aparece no Google)"
                                    />
                                    <CharCounter current={(seoTitle || title).length} min={30} max={60} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                    <textarea
                                        value={seoDescription}
                                        onChange={(e) => setSeoDescription(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Descrição que aparece nos resultados do Google..."
                                    />
                                    <CharCounter current={(seoDescription || excerpt).length} min={120} max={160} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (separadas por vírgula)</label>
                                    <input
                                        value={seoKeywords}
                                        onChange={(e) => setSeoKeywords(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="mini processador, cozinha, gadgets, shopee"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL (opcional)</label>
                                    <input
                                        value={canonicalUrl}
                                        onChange={(e) => setCanonicalUrl(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="https://achadosvipdaisa.com.br/reviews/..."
                                    />
                                </div>
                            </div>

                            {/* Open Graph */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    📱 Open Graph (Redes Sociais)
                                </h3>
                                <p className="text-xs text-gray-400">Controla como o artigo aparece quando compartilhado no Facebook, WhatsApp, Twitter etc.</p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                                    <input
                                        value={ogTitle}
                                        onChange={(e) => setOgTitle(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder={title || "Título para redes sociais (usa o título do post por padrão)"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                                    <textarea
                                        value={ogDescription}
                                        onChange={(e) => setOgDescription(e.target.value)}
                                        rows={2}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder={excerpt || "Descrição para redes sociais (usa o excerpt por padrão)"}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "product" && articleType === "sales" && (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    🛍️ Informações do Produto
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                    <input
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Ex: Mini Processador Manual de Alimentos"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                                        <input
                                            value={productPrice}
                                            onChange={(e) => setProductPrice(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                            placeholder="25.90"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nota (0-5)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            value={productRating}
                                            onChange={(e) => setProductRating(parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link de Afiliado</label>
                                    <input
                                        value={affiliateLink}
                                        onChange={(e) => setAffiliateLink(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="https://s.shopee.com.br/..."
                                    />
                                    <p className="mt-1 text-xs text-gray-400">O Google indexa links rel=&quot;nofollow sponsored&quot; automaticamente</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Article Settings */}
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-gray-700">⚙️ Configurações</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo de Artigo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setArticleType("educational")}
                                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-all ${articleType === "educational"
                                            ? "border-purple-400 bg-purple-50 text-purple-700"
                                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        📚
                                        <span>Educacional</span>
                                        <span className="text-[10px] opacity-60">Ranking SEO</span>
                                    </button>
                                    <button
                                        onClick={() => setArticleType("sales")}
                                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-all ${articleType === "sales"
                                            ? "border-pink-400 bg-pink-50 text-pink-700"
                                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        💰
                                        <span>Vendas</span>
                                        <span className="text-[10px] opacity-60">Review / Afiliado</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SEO Score */}
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-700">
                            <span>📊 Score SEO</span>
                            <span className={`text-lg font-bold ${seoScore >= 70 ? "text-emerald-500" : seoScore >= 40 ? "text-amber-500" : "text-red-500"}`}>
                                {seoScore}%
                            </span>
                        </h3>

                        {/* Score Bar */}
                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${seoScore >= 70 ? "bg-emerald-500" : seoScore >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${seoScore}%` }}
                            />
                        </div>

                        <div className="space-y-2">
                            {seoChecks.map((check, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    {check.status === "good" && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                                    {check.status === "warning" && <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />}
                                    {check.status === "bad" && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                                    <div>
                                        <span className="font-medium text-gray-700">{check.label}</span>
                                        <span className="text-gray-400 ml-1">— {check.tip}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-800">
                            <Info size={16} /> Dicas SEO
                        </h3>
                        <ul className="space-y-2 text-xs text-blue-700">
                            <li>• Use a keyword no <strong>título, URL e 1º parágrafo</strong></li>
                            <li>• Meta description entre <strong>120-160 caracteres</strong></li>
                            <li>• Conteúdo com <strong>+1000 palavras</strong> ranqueia melhor</li>
                            <li>• Use <strong>subtítulos (H2)</strong> para organizar</li>
                            <li>• Adicione <strong>imagens com alt text</strong> descritivo</li>
                            <li>• Links internos para outros artigos do blog</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ Toolbar Button ============
function ToolbarButton({ icon, onClick, active, tooltip }: { icon: React.ReactNode; onClick?: () => void; active?: boolean; tooltip?: string }) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`rounded p-1.5 transition-colors ${active ? "bg-pink-100 text-pink-700" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
        >
            {icon}
        </button>
    );
}

// ============ Character Counter ============
function CharCounter({ current, min, max }: { current: number; min: number; max: number }) {
    const color = current >= min && current <= max ? "text-emerald-500" : current > 0 ? "text-amber-500" : "text-gray-400";
    return (
        <p className={`mt-1 text-xs ${color}`}>
            {current}/{max} caracteres {current >= min && current <= max ? "✓ Ideal" : current > max ? "⚠ Muito longo" : current > 0 ? `⚠ Mínimo ${min}` : ""}
        </p>
    );
}
