
import { getAllReviews } from "@/lib/mdx";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export async function generateStaticParams() {
    const reviews = await getAllReviews();
    const categories = Array.from(new Set(reviews.map((review) => review.frontmatter.category).filter(Boolean)));

    return categories.map((category) => ({
        slug: category.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
    }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const reviews = await getAllReviews();

    // Helper to slugify category for comparison
    const slugify = (text: string) => text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    // Filter reviews matching the category slug
    const categoryReviews = reviews.filter(
        (review) => slugify(review.frontmatter.category || "") === slug
    );

    if (categoryReviews.length === 0) {
        return notFound();
    }

    // Get the display name from the first matching review
    const categoryName = categoryReviews[0].frontmatter.category;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <header className="bg-white border-b border-gray-100 py-12 px-6 text-center">
                <Link href="/" className="inline-flex items-center text-pink-700 font-medium mb-8 hover:underline">
                    <ChevronLeft size={16} className="mr-1" /> Voltar para Home
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                    Categoria: <span className="text-pink-600">{categoryName}</span>
                </h1>
                <p className="text-gray-600">{categoryReviews.length} artigo(s) encontrado(s)</p>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryReviews.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/reviews/${post.slug}`}
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                        >
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {post.frontmatter.featuredImage && (
                                    <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                        style={{ backgroundImage: `url(${post.frontmatter.featuredImage})` }} />
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 uppercase tracking-wide">
                                    {post.frontmatter.category}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors mb-3">
                                    {post.frontmatter.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                                    {post.frontmatter.excerpt}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                                    <span>{post.frontmatter.date}</span>
                                    <span className="font-medium text-pink-600">Ler Review &rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
