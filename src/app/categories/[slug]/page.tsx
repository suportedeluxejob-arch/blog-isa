import { getPosts as getFirestorePosts, getCategories } from "@/services/postService";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

export const revalidate = 60;

export async function generateStaticParams() {

    let firestoreCategories: string[] = [];
    try {
        const cats = await getCategories();
        firestoreCategories = cats.map(c => c.slug);
    } catch (error) {
        console.warn("Could not load Firestore categories for static params:", error);
    }

    const allSlugs = new Set([
        ...firestoreCategories,
    ]);

    return Array.from(allSlugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const pageObj = resolvedSearchParams.page;
    const pageNum = typeof pageObj === 'string' ? parseInt(pageObj, 10) : 1;
    
    // Get category name
    let categoryName = slug;
    try {
        const cats = await getCategories();
        const matchedCat = cats.find(c => c.slug === slug);
        if (matchedCat) categoryName = matchedCat.name;
    } catch { }

    const suffix = pageNum > 1 ? ` - Página ${pageNum}` : "";
    const title = `${categoryName} | Achados Vip da Isa${suffix}`;
    const description = `Confira todos os artigos, reviews e relatos sobre ${categoryName} no Achados Vip da Isa.${suffix}`;

    return {
        title,
        description,
        openGraph: { title, description }
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const slugify = (text: string) => text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

    // Get Firestore posts for this category
    let firestorePosts: any[] = [];
    try {
        const allPosts = await getFirestorePosts();
        firestorePosts = allPosts.filter(
            (post) => post.status === "published" && slugify(post.category || "") === slug
        );
    } catch (error) {
        console.warn("Could not load Firestore posts for category:", error);
    }

    // Get category name from Firestore categories or MDX
    let categoryName = slug;
    try {
        const cats = await getCategories();
        const matchedCat = cats.find(c => c.slug === slug);
        if (matchedCat) categoryName = matchedCat.name;
    } catch { }

    if (!categoryName || categoryName === slug) {
        // Fallback removed
    }

    // Combine all posts

    const formattedFirestore = firestorePosts.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
        date: post.createdAt?.toDate().toLocaleDateString("pt-BR"),
        origin: "firestore",
        linkPrefix: (slugify(post.category || "") === "minhas-experiencias" || slugify(post.category || "").includes("blindado")) ? "experiencias" : "achados"
    }));

    const allPosts = [...formattedFirestore];

    if (allPosts.length === 0) {
        return notFound();
    }

    const isExperienciaCategory = slug === "minhas-experiencias" || slug.includes("blindado");
    const themeColorTextUrl = isExperienciaCategory ? "text-purple-700" : "text-pink-700";
    const themeColorText = isExperienciaCategory ? "text-purple-600" : "text-pink-600";
    const themeGroupHoverText = isExperienciaCategory ? "group-hover:text-purple-600" : "group-hover:text-pink-600";
    const readText = isExperienciaCategory ? "Ler Relato" : "Ler Artigo";

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gray-50 font-sans pb-20">
                <header className="bg-white border-b border-gray-100 py-12 px-6 text-center">
                    <Link href="/" className={`inline-flex items-center ${themeColorTextUrl} font-medium mb-8 hover:underline`}>
                        <ChevronLeft size={16} className="mr-1" /> Voltar para Home
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Categoria: <span className={themeColorText}>{categoryName}</span>
                    </h1>
                    <p className="text-gray-600">{allPosts.length} artigo(s) encontrado(s)</p>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/${post.linkPrefix}/${post.slug}`}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                            >
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {post.coverImage && (
                                        <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                            style={{ backgroundImage: `url(${post.coverImage})` }} />
                                    )}
                                    <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold ${themeColorText} uppercase tracking-wide`}>
                                        {post.category}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className={`text-xl font-bold text-gray-900 ${themeGroupHoverText} transition-colors mb-3`}>
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                                        <span>{post.date}</span>
                                        <span className={`font-medium ${themeColorText}`}>{readText} &rarr;</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </PublicLayout>
    );
}
