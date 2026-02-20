"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { BlogPost, getCategories, Category, FaqItem, ContentImage, RatingCriteria } from "@/services/postService";
import {
    Loader2, Save, ArrowLeft,
    Bold, Italic, List, ListOrdered, Quote, Heading2, Link2, ImagePlus,
    Globe, Search, Target, AlertCircle, CheckCircle2, Info, LinkIcon,
    Plus, Trash2, Star, GripVertical, HelpCircle, ImageIcon, ThumbsUp, ThumbsDown,
    ChevronDown, ChevronUp, MessageSquare, Award
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
    const [verdict, setVerdict] = useState(initialPost?.verdict || "");

    // Structured Content Blocks
    const [pros, setPros] = useState<string[]>(initialPost?.pros || []);
    const [cons, setCons] = useState<string[]>(initialPost?.cons || []);
    const [faqItems, setFaqItems] = useState<FaqItem[]>(initialPost?.faqItems || []);
    const [contentImages, setContentImages] = useState<ContentImage[]>(initialPost?.contentImages || []);
    const [ratingCriteria, setRatingCriteria] = useState<RatingCriteria[]>(initialPost?.ratingCriteria || []);

    // State
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeSection, setActiveSection] = useState<"content" | "blocks" | "seo" | "product">("content");

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
                verdict: verdict || "",
                // Structured blocks - arrays are OK in Firestore
                pros: pros.filter(p => p.trim()),
                cons: cons.filter(c => c.trim()),
                faqItems: faqItems.filter(f => f.question.trim() && f.answer.trim()),
                contentImages: contentImages.filter(img => img.url.trim()),
                ratingCriteria: ratingCriteria.filter(r => r.label.trim()),
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

        if (effectiveTitle.length >= 30 && effectiveTitle.length <= 60) {
            checks.push({ label: "Meta Title", status: "good", tip: `${effectiveTitle.length} caracteres` });
        } else if (effectiveTitle.length > 0) {
            checks.push({ label: "Meta Title", status: "warning", tip: `${effectiveTitle.length} (ideal: 30-60)` });
        } else {
            checks.push({ label: "Meta Title", status: "bad", tip: "Adicione um título SEO" });
        }

        if (effectiveDesc.length >= 120 && effectiveDesc.length <= 160) {
            checks.push({ label: "Meta Description", status: "good", tip: `${effectiveDesc.length} caracteres` });
        } else if (effectiveDesc.length > 0) {
            checks.push({ label: "Meta Description", status: "warning", tip: `${effectiveDesc.length} (ideal: 120-160)` });
        } else {
            checks.push({ label: "Meta Description", status: "bad", tip: "Adicione descrição" });
        }

        if (focusKeyword) {
            const titleHasKw = effectiveTitle.toLowerCase().includes(focusKeyword.toLowerCase());
            const descHasKw = effectiveDesc.toLowerCase().includes(focusKeyword.toLowerCase());
            if (titleHasKw) checks.push({ label: "Keyword no Título", status: "good", tip: "✓" });
            else checks.push({ label: "Keyword no Título", status: "bad", tip: "Adicione ao título" });
            if (descHasKw) checks.push({ label: "Keyword na Descrição", status: "good", tip: "✓" });
            else checks.push({ label: "Keyword na Descrição", status: "warning", tip: "Inclua na descrição" });
        } else {
            checks.push({ label: "Focus Keyword", status: "bad", tip: "Defina uma keyword" });
        }

        if (coverImage) checks.push({ label: "Imagem de Capa", status: "good", tip: "✓" });
        else checks.push({ label: "Imagem de Capa", status: "warning", tip: "Adicione imagem" });

        if (pros.length > 0 || cons.length > 0) checks.push({ label: "Prós/Contras", status: "good", tip: "Seção estruturada" });
        if (faqItems.length > 0) checks.push({ label: "FAQ Schema", status: "good", tip: `${faqItems.length} pergunta(s)` });

        const contentText = editor?.getText() || "";
        const wordCount = contentText.split(/\s+/).filter(w => w).length;
        if (wordCount > 300) checks.push({ label: "Conteúdo", status: "good", tip: `${wordCount} palavras` });
        else if (wordCount > 100) checks.push({ label: "Conteúdo", status: "warning", tip: `${wordCount} palavras (ideal: +300)` });
        else checks.push({ label: "Conteúdo", status: "bad", tip: "Muito curto" });

        return checks;
    }

    const seoScore = Math.round((seoChecks.filter(c => c.status === "good").length / Math.max(seoChecks.length, 1)) * 100);

    // ==================== BLOCK HELPERS ====================

    const addPro = () => setPros([...pros, ""]);
    const updatePro = (i: number, val: string) => { const n = [...pros]; n[i] = val; setPros(n); };
    const removePro = (i: number) => setPros(pros.filter((_, idx) => idx !== i));

    const addCon = () => setCons([...cons, ""]);
    const updateCon = (i: number, val: string) => { const n = [...cons]; n[i] = val; setCons(n); };
    const removeCon = (i: number) => setCons(cons.filter((_, idx) => idx !== i));

    const addFaq = () => setFaqItems([...faqItems, { question: "", answer: "" }]);
    const updateFaq = (i: number, field: "question" | "answer", val: string) => {
        const n = [...faqItems]; n[i] = { ...n[i], [field]: val }; setFaqItems(n);
    };
    const removeFaq = (i: number) => setFaqItems(faqItems.filter((_, idx) => idx !== i));

    const addContentImage = () => setContentImages([...contentImages, { url: "", caption: "" }]);
    const updateContentImage = (i: number, field: "url" | "caption", val: string) => {
        const n = [...contentImages]; n[i] = { ...n[i], [field]: val }; setContentImages(n);
    };
    const removeContentImage = (i: number) => setContentImages(contentImages.filter((_, idx) => idx !== i));

    const addRating = () => setRatingCriteria([...ratingCriteria, { label: "", score: 4 }]);
    const updateRating = (i: number, field: "label" | "score", val: any) => {
        const n = [...ratingCriteria]; n[i] = { ...n[i], [field]: field === "score" ? Number(val) : val }; setRatingCriteria(n);
    };
    const removeRating = (i: number) => setRatingCriteria(ratingCriteria.filter((_, idx) => idx !== i));

    return (
        <div className="mx-auto max-w-6xl pb-20">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                    <ArrowLeft size={16} /> Voltar ao Dashboard
                </Link>
                <div className="flex items-center gap-3">
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
                        <button onClick={() => setActiveSection("blocks")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeSection === "blocks" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                            🧱 Blocos
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

                    {/* ==================== CONTENT TAB ==================== */}
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

                    {/* ==================== BLOCKS TAB ==================== */}
                    {activeSection === "blocks" && (
                        <div className="space-y-6">
                            {/* INFO BANNER */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-start gap-3">
                                <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <strong>Blocos Estruturados</strong> são seções visuais que aparecem no artigo publicado. O Google valoriza conteúdo bem estruturado!
                                </div>
                            </div>

                            {/* PROS & CONS */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                                    <ThumbsUp size={16} className="text-emerald-500" />
                                    <ThumbsDown size={16} className="text-red-500" />
                                    Prós e Contras
                                </h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* PROS */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">
                                            <CheckCircle2 size={14} /> Pontos Fortes
                                        </label>
                                        <div className="space-y-2">
                                            {pros.map((pro, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        value={pro}
                                                        onChange={(e) => updatePro(i, e.target.value)}
                                                        className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50/30 p-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                                                        placeholder={`Ponto forte ${i + 1}...`}
                                                    />
                                                    <button onClick={() => removePro(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={addPro} className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-1">
                                                <Plus size={14} /> Adicionar ponto forte
                                            </button>
                                        </div>
                                    </div>

                                    {/* CONS */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
                                            <AlertCircle size={14} /> Pontos Fracos
                                        </label>
                                        <div className="space-y-2">
                                            {cons.map((con, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        value={con}
                                                        onChange={(e) => updateCon(i, e.target.value)}
                                                        className="flex-1 rounded-lg border border-red-200 bg-red-50/30 p-2.5 text-sm focus:border-red-400 focus:outline-none"
                                                        placeholder={`Ponto fraco ${i + 1}...`}
                                                    />
                                                    <button onClick={() => removeCon(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={addCon} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium mt-1">
                                                <Plus size={14} /> Adicionar ponto fraco
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                    <HelpCircle size={16} className="text-purple-500" />
                                    Perguntas Frequentes (FAQ)
                                </h3>
                                <p className="text-xs text-gray-400 mb-4">FAQs geram Rich Results no Google — pergunta e resposta direto na busca!</p>

                                <div className="space-y-4">
                                    {faqItems.map((faq, i) => (
                                        <div key={i} className="rounded-lg border border-purple-100 bg-purple-50/20 p-4">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="text-xs font-bold text-purple-400">PERGUNTA {i + 1}</span>
                                                <button onClick={() => removeFaq(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <input
                                                value={faq.question}
                                                onChange={(e) => updateFaq(i, "question", e.target.value)}
                                                className="w-full rounded-lg border border-purple-200 p-2.5 text-sm font-medium focus:border-purple-400 focus:outline-none mb-2"
                                                placeholder="Ex: Vale a pena comprar na Shopee?"
                                            />
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                                                rows={2}
                                                className="w-full rounded-lg border border-purple-200 p-2.5 text-sm focus:border-purple-400 focus:outline-none"
                                                placeholder="Resposta completa e útil..."
                                            />
                                        </div>
                                    ))}
                                    <button onClick={addFaq} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium">
                                        <Plus size={14} /> Adicionar pergunta
                                    </button>
                                </div>
                            </div>

                            {/* CONTENT IMAGES */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                    <ImageIcon size={16} className="text-blue-500" />
                                    Galeria de Imagens
                                </h3>
                                <p className="text-xs text-gray-400 mb-4">Imagens extras com legendas que aparecem no final do artigo.</p>

                                <div className="space-y-4">
                                    {contentImages.map((img, i) => (
                                        <div key={i} className="flex gap-3 items-start rounded-lg border border-gray-200 p-3">
                                            {img.url && (
                                                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    value={img.url}
                                                    onChange={(e) => updateContentImage(i, "url", e.target.value)}
                                                    className="w-full rounded border border-gray-200 p-2 text-sm focus:border-pink-400 focus:outline-none"
                                                    placeholder="URL da imagem..."
                                                />
                                                <input
                                                    value={img.caption}
                                                    onChange={(e) => updateContentImage(i, "caption", e.target.value)}
                                                    className="w-full rounded border border-gray-200 p-2 text-sm focus:border-pink-400 focus:outline-none"
                                                    placeholder="Legenda da imagem (ex: 'Testando o produto na cozinha')"
                                                />
                                            </div>
                                            <button onClick={() => removeContentImage(i)} className="text-gray-300 hover:text-red-500 transition-colors mt-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addContentImage} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        <Plus size={14} /> Adicionar imagem
                                    </button>
                                </div>
                            </div>

                            {/* RATING CRITERIA (for sales) */}
                            {articleType === "sales" && (
                                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                                        <Award size={16} className="text-amber-500" />
                                        Avaliação por Critério
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-4">Notas individuais por categoria (ex: Qualidade, Custo-Benefício, etc.)</p>

                                    <div className="space-y-3">
                                        {ratingCriteria.map((r, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <input
                                                    value={r.label}
                                                    onChange={(e) => updateRating(i, "label", e.target.value)}
                                                    className="flex-1 rounded border border-gray-200 p-2 text-sm focus:border-pink-400 focus:outline-none"
                                                    placeholder="Ex: Qualidade, Entrega, Custo-Benefício"
                                                />
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => updateRating(i, "score", star)}
                                                            className="transition-colors"
                                                        >
                                                            <Star size={18} className={star <= r.score ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <button onClick={() => removeRating(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={addRating} className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium">
                                            <Plus size={14} /> Adicionar critério
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* VERDICT */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                    <MessageSquare size={16} className="text-pink-500" />
                                    Veredito Final
                                </h3>
                                <textarea
                                    value={verdict}
                                    onChange={(e) => setVerdict(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                    placeholder='Ex: "Recomendo para quem cozinha todo dia. Pelo preço, é um ótimo investimento."'
                                />
                            </div>
                        </div>
                    )}

                    {/* ==================== SEO TAB ==================== */}
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
                                    <p className="text-sm text-gray-600 line-clamp-2">{seoDescription || excerpt || "Descrição do artigo..."}</p>
                                </div>
                            </div>

                            {/* SEO Fields */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Target size={16} /> Configurações SEO
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">🎯 Focus Keyword</label>
                                    <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Ex: mini processador de alho" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                    <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Título SEO (aparece no Google)" />
                                    <CharCounter current={(seoTitle || title).length} min={30} max={60} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                    <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Descrição que aparece nos resultados do Google..." />
                                    <CharCounter current={(seoDescription || excerpt).length} min={120} max={160} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (vírgula)</label>
                                    <input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="mini processador, cozinha, gadgets, shopee" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL (opcional)</label>
                                    <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="https://achadosvipdaisa.com.br/reviews/..." />
                                </div>
                            </div>

                            {/* Open Graph */}
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    📱 Open Graph (Redes Sociais)
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                                    <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder={title || "Título para redes sociais"} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                                    <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={2}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder={excerpt || "Descrição para redes sociais"} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== PRODUCT TAB ==================== */}
                    {activeSection === "product" && articleType === "sales" && (
                        <div className="space-y-6">
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    🛍️ Informações do Produto
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                    <input value={productName} onChange={(e) => setProductName(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="Ex: Mini Processador Manual de Alimentos" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                                        <input value={productPrice} onChange={(e) => setProductPrice(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                            placeholder="25.90" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nota (0-5)</label>
                                        <input type="number" min="0" max="5" step="0.1" value={productRating}
                                            onChange={(e) => setProductRating(parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link de Afiliado</label>
                                    <input value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                        placeholder="https://s.shopee.com.br/..." />
                                    <p className="mt-1 text-xs text-gray-400">rel=&quot;nofollow sponsored&quot; é adicionado automaticamente</p>
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
                                            : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                                    >
                                        📚
                                        <span>Educacional</span>
                                        <span className="text-[10px] opacity-60">Ranking SEO</span>
                                    </button>
                                    <button
                                        onClick={() => setArticleType("sales")}
                                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-medium transition-all ${articleType === "sales"
                                            ? "border-pink-400 bg-pink-50 text-pink-700"
                                            : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
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

                    {/* Blocks Summary */}
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">🧱 Blocos Adicionados</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <span>Prós</span>
                                <span className={pros.length > 0 ? "text-emerald-600 font-medium" : "text-gray-400"}>{pros.length} item(s)</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Contras</span>
                                <span className={cons.length > 0 ? "text-red-500 font-medium" : "text-gray-400"}>{cons.length} item(s)</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>FAQ</span>
                                <span className={faqItems.length > 0 ? "text-purple-600 font-medium" : "text-gray-400"}>{faqItems.length} pergunta(s)</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Imagens</span>
                                <span className={contentImages.length > 0 ? "text-blue-600 font-medium" : "text-gray-400"}>{contentImages.length} imagem(s)</span>
                            </div>
                            {articleType === "sales" && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Critérios</span>
                                    <span className={ratingCriteria.length > 0 ? "text-amber-600 font-medium" : "text-gray-400"}>{ratingCriteria.length} critério(s)</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Veredito</span>
                                <span className={verdict ? "text-pink-600 font-medium" : "text-gray-400"}>{verdict ? "✓" : "—"}</span>
                            </div>
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
                            <li>• Conteúdo com <strong>+300 palavras</strong> ranqueia melhor</li>
                            <li>• <strong>Prós/Contras</strong> aumentam tempo de leitura</li>
                            <li>• <strong>FAQ</strong> gera Rich Results no Google</li>
                            <li>• <strong>Imagens com legenda</strong> melhoram engajamento</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ Sub-components ============

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

function CharCounter({ current, min, max }: { current: number; min: number; max: number }) {
    const color = current >= min && current <= max ? "text-emerald-500" : current > 0 ? "text-amber-500" : "text-gray-400";
    return (
        <p className={`mt-1 text-xs ${color}`}>
            {current}/{max} caracteres {current >= min && current <= max ? "✓ Ideal" : current > max ? "⚠ Muito longo" : current > 0 ? `⚠ Mínimo ${min}` : ""}
        </p>
    );
}
