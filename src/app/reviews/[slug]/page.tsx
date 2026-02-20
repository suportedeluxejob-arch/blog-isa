import { notFound } from "next/navigation";
import { getReviewBySlug as getMdxReviewBySlug, getAllReviews as getAllMdxReviews } from "@/lib/mdx";
import { getPostBySlug as getFirestorePostBySlug, getPosts as getFirestorePosts } from "@/services/postService";
import { MDXRemote } from "next-mdx-remote/rsc";
import { AffiliateLink } from "@/components/mdx/affiliate-link";
import { ProsConsList } from "@/components/mdx/pros-cons-list";
import { ProductReviewBox } from "@/components/mdx/product-review-box";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

// Register MDX components
const components = {
    AffiliateLink,
    ProsConsList,
    ProductReviewBox,
    Image,
    h2: (props: any) => <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-6" {...props} />,
    p: (props: any) => <p className="text-gray-700 leading-relaxed mb-6" {...props} />,
    strong: (props: any) => <strong className="font-bold text-gray-900" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700" {...props} />,
    li: (props: any) => <li className="pl-2" {...props} />,
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const mdxReviews = await getAllMdxReviews();
    const firestorePosts = await getFirestorePosts();

    const allSlugs = new Set([
        ...mdxReviews.map((r) => r.slug),
        ...firestorePosts.map((p) => p.slug)
    ]);

    return Array.from(allSlugs).map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;

    // Try Firestore first
    const firestorePost = await getFirestorePostBySlug(slug);
    if (firestorePost) {
        return {
            title: firestorePost.seoTitle || `${firestorePost.title} | Achados Vip da Isa`,
            description: firestorePost.seoDescription || firestorePost.excerpt,
            keywords: firestorePost.seoKeywords,
        };
    }

    // Fallback to MDX
    const mdxReview = await getMdxReviewBySlug(slug);
    if (mdxReview) {
        return {
            title: `${mdxReview.frontmatter.title} | Achados Vip da Isa`,
            description: mdxReview.frontmatter.excerpt,
        };
    }

    return {};
}

export default async function ReviewPage({ params }: PageProps) {
    const { slug } = await params;

    // 1. Try Firestore
    const firestorePost = await getFirestorePostBySlug(slug);

    if (firestorePost) {
        return (
            <article className="min-h-screen bg-white pb-20">
                <header className="bg-brand-50 pt-20 pb-16 px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <Link href="/" className="inline-flex items-center text-pink-700 font-medium mb-8 hover:underline">
                            <ChevronLeft size={16} className="mr-1" /> Voltar para Home
                        </Link>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                            {firestorePost.title}
                        </h1>

                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                            <span>Atualizado em {firestorePost.updatedAt?.toDate().toLocaleDateString()}</span>
                        </div>
                    </div>
                </header>

                <div className="max-w-3xl mx-auto px-6 py-12">
                    <div
                        className="prose prose-lg prose-pink mx-auto"
                        dangerouslySetInnerHTML={{ __html: firestorePost.content }}
                    />
                </div>
            </article>
        );
    }

    // 2. Fallback to MDX
    const mdxReview = await getMdxReviewBySlug(slug);

    if (!mdxReview) {
        notFound();
    }

    const { frontmatter, content } = mdxReview;

    return (
        <article className="min-h-screen bg-white pb-20">
            {/* Header / Hero */}
            <header className="bg-brand-50 pt-20 pb-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-pink-700 font-medium mb-8 hover:underline">
                        <ChevronLeft size={16} className="mr-1" /> Voltar para Home
                    </Link>

                    <div className="inline-block bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                        {frontmatter.category}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {frontmatter.title}
                    </h1>

                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <span>Por <strong className="text-gray-900">{frontmatter.author}</strong></span>
                        <span>•</span>
                        <span>Atualizado em {frontmatter.updatedAt}</span>
                    </div>
                </div>
            </header>

            {/* MDX Content */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="prose prose-lg prose-pink mx-auto">
                    <MDXRemote source={content} components={components} />
                </div>
            </div>

            {/* JSON-LD Schema (Legacy support) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        frontmatter.isReview
                            ? {
                                "@context": "https://schema.org",
                                "@type": "Product",
                                "name": frontmatter.productName,
                                "image": frontmatter.featuredImage ? [`https://achadosvipdaisa.com.br${frontmatter.featuredImage}`] : [],
                                "description": frontmatter.excerpt,
                                "brand": {
                                    "@type": "Brand",
                                    "name": "Shopee/Generic"
                                },
                                "offers": {
                                    "@type": "Offer",
                                    "url": frontmatter.affiliateLink,
                                    "priceCurrency": "BRL",
                                    "price": frontmatter.productPrice,
                                    "availability": "https://schema.org/InStock"
                                },
                                "review": {
                                    "@type": "Review",
                                    "reviewRating": {
                                        "@type": "Rating",
                                        "ratingValue": frontmatter.rating,
                                        "bestRating": "5"
                                    },
                                    "author": {
                                        "@type": "Person",
                                        "name": frontmatter.author
                                    }
                                }
                            }
                            : {
                                "@context": "https://schema.org",
                                "@type": "BlogPosting",
                                "headline": frontmatter.title,
                                "image": frontmatter.featuredImage ? [`https://achadosvipdaisa.com.br${frontmatter.featuredImage}`] : [],
                                "author": {
                                    "@type": "Person",
                                    "name": frontmatter.author
                                },
                                "publisher": {
                                    "@type": "Organization",
                                    "name": "Achados Vip da Isa",
                                    "logo": {
                                        "@type": "ImageObject",
                                        "url": "https://achadosvipdaisa.com.br/logo.png"
                                    }
                                },
                                "datePublished": frontmatter.date,
                                "dateModified": frontmatter.updatedAt,
                                "description": frontmatter.excerpt
                            }
                    )
                }}
            />
        </article>
    );
}

