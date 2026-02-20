import { notFound } from "next/navigation";
import { getReviewBySlug as getMdxReviewBySlug, getAllReviews as getAllMdxReviews } from "@/lib/mdx";
import { getPostBySlug as getFirestorePostBySlug, getPosts as getFirestorePosts, BlogPost } from "@/services/postService";
import { MDXRemote } from "next-mdx-remote/rsc";
import { AffiliateLink } from "@/components/mdx/affiliate-link";
import { ProsConsList } from "@/components/mdx/pros-cons-list";
import { ProductReviewBox } from "@/components/mdx/product-review-box";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star, ExternalLink } from "lucide-react";

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

export const revalidate = 60;

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
        const effectiveTitle = firestorePost.seoTitle || firestorePost.title;
        const effectiveDesc = firestorePost.seoDescription || firestorePost.excerpt;
        const effectiveOgTitle = firestorePost.ogTitle || effectiveTitle;
        const effectiveOgDesc = firestorePost.ogDescription || effectiveDesc;

        return {
            title: `${effectiveTitle} | Achados Vip da Isa`,
            description: effectiveDesc,
            keywords: firestorePost.seoKeywords,
            ...(firestorePost.canonicalUrl ? { alternates: { canonical: firestorePost.canonicalUrl } } : {}),
            openGraph: {
                title: effectiveOgTitle,
                description: effectiveOgDesc,
                type: "article",
                images: firestorePost.coverImage ? [firestorePost.coverImage] : [],
                siteName: "Achados Vip da Isa",
                locale: "pt_BR",
            },
            twitter: {
                card: "summary_large_image",
                title: effectiveOgTitle,
                description: effectiveOgDesc,
                images: firestorePost.coverImage ? [firestorePost.coverImage] : [],
            },
        };
    }

    // Fallback to MDX
    const mdxReview = await getMdxReviewBySlug(slug);
    if (mdxReview) {
        return {
            title: `${mdxReview.frontmatter.title} | Achados Vip da Isa`,
            description: mdxReview.frontmatter.excerpt,
            openGraph: {
                title: mdxReview.frontmatter.title,
                description: mdxReview.frontmatter.excerpt,
                type: "article",
                images: mdxReview.frontmatter.featuredImage
                    ? [`https://achadosvipdaisa.com.br${mdxReview.frontmatter.featuredImage}`]
                    : [],
                locale: "pt_BR",
            },
        };
    }

    return {};
}

export default async function ReviewPage({ params }: PageProps) {
    const { slug } = await params;

    // 1. Try Firestore
    const firestorePost = await getFirestorePostBySlug(slug);

    if (firestorePost) {
        return <FirestoreArticle post={firestorePost} />;
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

// ========================
// FIRESTORE ARTICLE - Same quality as MDX
// ========================
function FirestoreArticle({ post }: { post: BlogPost }) {
    const isSalesArticle = post.articleType === "sales";
    const publishDate = post.publishedAt?.toDate().toLocaleDateString("pt-BR") ||
        post.createdAt?.toDate().toLocaleDateString("pt-BR");
    const updateDate = post.updatedAt?.toDate().toLocaleDateString("pt-BR");

    return (
        <article className="min-h-screen bg-white pb-20">
            {/* Header - Same style as MDX articles */}
            <header className="bg-brand-50 pt-20 pb-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-pink-700 font-medium mb-8 hover:underline">
                        <ChevronLeft size={16} className="mr-1" /> Voltar para Home
                    </Link>

                    {post.category && (
                        <div className="inline-block bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                            {post.category}
                        </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <span>Por <strong className="text-gray-900">{post.author || "Isabelle"}</strong></span>
                        <span>•</span>
                        <span>Atualizado em {updateDate}</span>
                    </div>
                </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
                <div className="max-w-4xl mx-auto px-6 -mt-8">
                    <div className="overflow-hidden rounded-2xl shadow-lg">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Affiliate Disclaimer for Sales Articles */}
                {isSalesArticle && (
                    <p className="text-gray-500 italic text-sm mb-8">
                        *Aviso: Este artigo contém links de parceiros. Isso significa que podemos ganhar uma comissão se você comprar,
                        sem custo extra para você. Isso nos ajuda a manter o blog e continuar trazendo reviews honestos!*
                    </p>
                )}

                {/* HTML Content from editor - styled same as MDX */}
                <div
                    className="prose prose-lg prose-pink mx-auto prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:pl-2"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Product Review Box - Same component as MDX articles use */}
                {isSalesArticle && post.productName && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            REVIEW OFICIAL
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            {post.coverImage && (
                                <div className="w-32 h-32 flex-shrink-0 bg-white rounded-xl p-2 border border-slate-100 flex items-center justify-center">
                                    <img src={post.coverImage} alt={post.productName} className="max-w-full max-h-full object-contain" />
                                </div>
                            )}

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{post.productName}</h3>

                                {/* Star Rating */}
                                {post.productRating && post.productRating > 0 && (
                                    <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-6 h-6 ${star <= (post.productRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                                            />
                                        ))}
                                        <span className="ml-2 font-bold text-slate-700">{post.productRating}/5.0</span>
                                    </div>
                                )}

                                {/* Price */}
                                {post.productPrice && (
                                    <p className="text-lg font-bold text-pink-600 mb-3">R$ {post.productPrice}</p>
                                )}

                                <p className="text-slate-600 italic mb-4">{post.excerpt}</p>

                                {/* Affiliate Button */}
                                {post.affiliateLink && (
                                    <a
                                        href={post.affiliateLink}
                                        target="_blank"
                                        rel="nofollow sponsored noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors no-underline"
                                    >
                                        Ver Melhor Preço
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* JSON-LD Schema - Same structure as MDX articles */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        isSalesArticle && post.productName
                            ? {
                                "@context": "https://schema.org",
                                "@type": "Product",
                                "name": post.productName,
                                "image": post.coverImage ? [post.coverImage] : [],
                                "description": post.seoDescription || post.excerpt,
                                "brand": {
                                    "@type": "Brand",
                                    "name": "Shopee/Generic"
                                },
                                "offers": {
                                    "@type": "Offer",
                                    "url": post.affiliateLink || `https://achadosvipdaisa.com.br/reviews/${post.slug}`,
                                    "priceCurrency": "BRL",
                                    "price": post.productPrice || "0",
                                    "availability": "https://schema.org/InStock"
                                },
                                "review": {
                                    "@type": "Review",
                                    "reviewRating": {
                                        "@type": "Rating",
                                        "ratingValue": post.productRating || 0,
                                        "bestRating": "5"
                                    },
                                    "author": {
                                        "@type": "Person",
                                        "name": post.author || "Isabelle"
                                    }
                                }
                            }
                            : {
                                "@context": "https://schema.org",
                                "@type": "BlogPosting",
                                "headline": post.seoTitle || post.title,
                                "image": post.coverImage ? [post.coverImage] : [],
                                "author": {
                                    "@type": "Person",
                                    "name": post.author || "Isabelle"
                                },
                                "publisher": {
                                    "@type": "Organization",
                                    "name": "Achados Vip da Isa",
                                    "logo": {
                                        "@type": "ImageObject",
                                        "url": "https://achadosvipdaisa.com.br/logo.png"
                                    }
                                },
                                "datePublished": publishDate,
                                "dateModified": updateDate,
                                "description": post.seoDescription || post.excerpt,
                                ...(post.seoKeywords ? { "keywords": post.seoKeywords } : {})
                            }
                    )
                }}
            />
        </article>
    );
}
