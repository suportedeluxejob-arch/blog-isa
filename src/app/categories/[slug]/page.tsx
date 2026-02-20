import { getAllReviews } from "@/lib/mdx";
import { getPosts as getFirestorePosts, getCategories } from "@/services/postService";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

export const revalidate = 60;

export async function generateStaticParams() {
    const reviews = await getAllReviews();
    const mdxCategories = Array.from(new Set(reviews.map((review) => review.frontmatter.category).filter(Boolean)));

    let firestoreCategories: string[] = [];
    try {
        const cats = await getCategories();
        firestoreCategories = cats.map(c => c.slug);
    } catch (error) {
        console.warn("Could not load Firestore categories for static params:", error);
    }

    const allSlugs = new Set([
        ...mdxCategories.map((cat) => cat.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")),
        ...firestoreCategories,
    ]);

    return Array.from(allSlugs).map((slug) => ({ slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const slugify = (text: string) => text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    // Get MDX reviews for this category
    const reviews = await getAllReviews();
    const categoryReviews = reviews.filter(
        (review) => slugify(review.frontmatter.category || "") === slug
    );

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
        if (categoryReviews.length > 0) {
            categoryName = categoryReviews[0].frontmatter.category;
        }
    }

    // Combine all posts
    const formattedMdx = categoryReviews.map((post) => ({
        slug: post.slug,
        title: post.frontmatter.title,
        excerpt: post.frontmatter.excerpt,
        coverImage: post.frontmatter.featuredImage,
        category: post.frontmatter.category,
        date: post.frontmatter.date,
        origin: "mdx",
    }));

    const formattedFirestore = firestorePosts.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        category: post.category,
        date: post.createdAt?.toDate().toLocaleDateString("pt-BR"),
        origin: "firestore",
    }));

    const allPosts = [...formattedFirestore, ...formattedMdx];

    if (allPosts.length === 0) {
        return notFound();
    }

    return (
        <PublicLayout>
            <div className="min-h-screen bg-gray-50 font-sans pb-20">
                <header className="bg-white border-b border-gray-100 py-12 px-6 text-center">
                    <Link href="/" className="inline-flex items-center text-pink-700 font-medium mb-8 hover:underline">
                        <ChevronLeft size={16} className="mr-1" /> Voltar para Home
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Categoria: <span className="text-pink-600">{categoryName}</span>
                    </h1>
                    <p className="text-gray-600">{allPosts.length} artigo(s) encontrado(s)</p>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/reviews/${post.slug}`}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                            >
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    {post.coverImage && (
                                        <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                            style={{ backgroundImage: `url(${post.coverImage})` }} />
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 uppercase tracking-wide">
                                        {post.category}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors mb-3">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                                        <span>{post.date}</span>
                                        <span className="font-medium text-pink-600">Ler Review &rarr;</span>
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
