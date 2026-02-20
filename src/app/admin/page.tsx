"use client";

import { useEffect, useState } from "react";
import { getPosts, BlogPost, deletePost, getCategories, Category } from "@/services/postService";
import Link from "next/link";
import {
    PlusCircle, Edit, Trash2, LogOut, LayoutDashboard,
    FileText, FolderOpen, Search, Eye, GripVertical,
    BookOpen, ShoppingBag, Globe, TrendingUp
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "educational" | "sales">("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");
    const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [postsData, catsData] = await Promise.all([getPosts(), getCategories()]);
            setPosts(postsData);
            setCategories(catsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.")) {
            await deletePost(id);
            fetchData();
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || post.articleType === filterType;
        const matchesStatus = filterStatus === "all" || post.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === "published").length,
        drafts: posts.filter(p => p.status === "draft").length,
        educational: posts.filter(p => p.articleType === "educational").length,
        sales: posts.filter(p => p.articleType === "sales").length,
        categories: categories.length,
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600"></div>
                    <p className="text-sm text-gray-500">Carregando painel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                <StatsCard icon={<FileText size={20} />} label="Total Posts" value={stats.total} color="blue" />
                <StatsCard icon={<Globe size={20} />} label="Publicados" value={stats.published} color="green" />
                <StatsCard icon={<Edit size={20} />} label="Rascunhos" value={stats.drafts} color="yellow" />
                <StatsCard icon={<BookOpen size={20} />} label="Educacionais" value={stats.educational} color="purple" />
                <StatsCard icon={<ShoppingBag size={20} />} label="Vendas" value={stats.sales} color="pink" />
                <StatsCard icon={<FolderOpen size={20} />} label="Categorias" value={stats.categories} color="indigo" />
            </div>

            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "posts"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <FileText size={16} />
                    Artigos
                </button>
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === "categories"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <FolderOpen size={16} />
                    Categorias
                </button>
            </div>

            {activeTab === "posts" ? (
                <PostsTab
                    posts={filteredPosts}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onDelete={handleDelete}
                />
            ) : (
                <CategoriesTab categories={categories} onRefresh={fetchData} />
            )}
        </div>
    );
}

// ============ Stats Card ============
function StatsCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        yellow: "bg-amber-50 text-amber-600 border-amber-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        pink: "bg-pink-50 text-pink-600 border-pink-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };

    return (
        <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
            <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs font-medium opacity-80">{label}</span></div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

// ============ Posts Tab ============
function PostsTab({
    posts, searchQuery, setSearchQuery, filterType, setFilterType, filterStatus, setFilterStatus, onDelete
}: {
    posts: BlogPost[];
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    filterType: "all" | "educational" | "sales";
    setFilterType: (v: "all" | "educational" | "sales") => void;
    filterStatus: "all" | "draft" | "published";
    setFilterStatus: (v: "all" | "draft" | "published") => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div>
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar artigos..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                    />
                </div>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
                >
                    <option value="all">Todos os Tipos</option>
                    <option value="educational">📚 Educacional</option>
                    <option value="sales">💰 Vendas</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
                >
                    <option value="all">Todos os Status</option>
                    <option value="published">✅ Publicados</option>
                    <option value="draft">📝 Rascunhos</option>
                </select>

                <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 transition-colors"
                >
                    <PlusCircle size={18} />
                    Novo Artigo
                </Link>
            </div>

            {/* Posts List */}
            <div className="space-y-3">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
                        <FileText size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium mb-2">Nenhum artigo encontrado</p>
                        <p className="text-gray-400 text-sm mb-4">Crie seu primeiro artigo para começar</p>
                        <Link
                            href="/admin/posts/new"
                            className="flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
                        >
                            <PlusCircle size={18} />
                            Criar Artigo
                        </Link>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                            {/* Cover Image Thumbnail */}
                            <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {post.coverImage ? (
                                    <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                                        <FileText size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${post.status === "published"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                        }`}>
                                        {post.status === "published" ? "✅ Publicado" : "📝 Rascunho"}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${post.articleType === "educational"
                                        ? "bg-purple-50 text-purple-700"
                                        : "bg-pink-50 text-pink-700"
                                        }`}>
                                        {post.articleType === "educational" ? "📚 Educacional" : "💰 Vendas"}
                                    </span>
                                    {post.category && (
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                                            {post.category}
                                        </span>
                                    )}
                                    <span className="text-gray-400">
                                        /reviews/{post.slug}
                                    </span>
                                </div>
                            </div>

                            {/* SEO Score Indicator */}
                            <div className="hidden md:flex flex-col items-center gap-1">
                                <SeoIndicator post={post} />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/reviews/${post.slug}`}
                                    target="_blank"
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    title="Visualizar"
                                >
                                    <Eye size={18} />
                                </Link>
                                <Link
                                    href={`/admin/posts/${post.id}`}
                                    className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-600"
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </Link>
                                <button
                                    onClick={() => onDelete(post.id!)}
                                    className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                                    title="Deletar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ============ SEO Indicator ============
function SeoIndicator({ post }: { post: BlogPost }) {
    let score = 0;
    if (post.seoTitle && post.seoTitle.length >= 30 && post.seoTitle.length <= 60) score++;
    if (post.seoDescription && post.seoDescription.length >= 120 && post.seoDescription.length <= 160) score++;
    if (post.focusKeyword) score++;
    if (post.seoKeywords) score++;
    if (post.coverImage) score++;

    const color = score >= 4 ? "text-emerald-500" : score >= 2 ? "text-amber-500" : "text-red-400";
    const label = score >= 4 ? "Bom" : score >= 2 ? "Ok" : "Fraco";

    return (
        <div className={`flex flex-col items-center ${color}`}>
            <TrendingUp size={16} />
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </div>
    );
}

// ============ Categories Tab ============
function CategoriesTab({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [slug, setSlug] = useState("");

    const handleSave = async () => {
        const { createCategory, updateCategory } = await import("@/services/postService");
        const { Timestamp } = await import("firebase/firestore");

        const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        if (editingId) {
            await updateCategory(editingId, { name, slug: catSlug, description });
        } else {
            await createCategory({ name, slug: catSlug, description, createdAt: Timestamp.now() });
        }

        resetForm();
        onRefresh();
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id!);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || "");
        setShowForm(true);
    };

    const handleDeleteCat = async (id: string) => {
        if (confirm("Deletar esta categoria?")) {
            const { deleteCategory } = await import("@/services/postService");
            await deleteCategory(id);
            onRefresh();
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setName("");
        setSlug("");
        setDescription("");
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Gerenciar Categorias</h3>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 transition-colors"
                >
                    <PlusCircle size={18} />
                    Nova Categoria
                </button>
            </div>

            {showForm && (
                <div className="mb-6 rounded-xl border border-pink-100 bg-pink-50/30 p-6">
                    <h4 className="mb-4 font-semibold text-gray-800">{editingId ? "Editar" : "Nova"} Categoria</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
                                }}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                placeholder="Ex: Casa Inteligente"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                placeholder="casa-inteligente"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                                placeholder="Descrição da categoria para SEO..."
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={handleSave} className="rounded-lg bg-pink-600 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-700">
                            {editingId ? "Salvar" : "Criar"}
                        </button>
                        <button onClick={resetForm} className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12">
                        <FolderOpen size={40} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Nenhuma categoria criada</p>
                        <p className="text-gray-400 text-sm">Crie categorias para organizar seus artigos</p>
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                            <div>
                                <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                                <p className="text-xs text-gray-400">/categories/{cat.slug}</p>
                                {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(cat)} className="rounded-lg p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-600">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDeleteCat(cat.id!)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
