import { notFound } from "next/navigation";
import { getReviewBySlug as getMdxReviewBySlug, getAllReviews as getAllMdxReviews } from "@/lib/mdx";
import { getPostBySlug as getFirestorePostBySlug, getPosts as getFirestorePosts, BlogPost } from "@/services/postService";
import { MDXRemote } from "next-mdx-remote/rsc";
import { AffiliateLink } from "@/components/mdx/affiliate-link";
import { ProsConsList } from "@/components/mdx/pros-cons-list";
import { ProductReviewBox } from "@/components/mdx/product-review-box";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star, ExternalLink, CheckCircle2, XCircle, HelpCircle, ChevronDown, BarChart2, Camera, ShieldCheck, Award } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

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
        return <PublicLayout><FirestoreArticle post={firestorePost} /></PublicLayout>;
    }

    // 2. Fallback to MDX
    const mdxReview = await getMdxReviewBySlug(slug);

    if (!mdxReview) {
        notFound();
    }

    const { frontmatter, content } = mdxReview;

    return (
        <PublicLayout>
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
                                    "image": frontmatter.featuredImage
                                        ? [`https://achadosvipdaisa.com.br${frontmatter.featuredImage}`]
                                        : [],
                                    "description": frontmatter.excerpt,
                                    "review": {
                                        "@type": "Review",
                                        "reviewRating": {
                                            "@type": "Rating",
                                            "ratingValue": frontmatter.rating || 4.5,
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
                                    "image": frontmatter.featuredImage
                                        ? [`https://achadosvipdaisa.com.br${frontmatter.featuredImage}`]
                                        : [],
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
        </PublicLayout>
    );
}

// ======================================================
// FIRESTORE ARTICLE — Beautiful Structured Rendering
// ======================================================
function FirestoreArticle({ post }: { post: BlogPost }) {
    const isSalesArticle = post.articleType === "sales";
    const publishDate = post.publishedAt?.toDate?.()?.toISOString?.() ||
        post.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString();
    const updateDate = post.updatedAt?.toDate?.()?.toISOString?.() || publishDate;
    const displayDate = post.updatedAt?.toDate?.()?.toLocaleDateString("pt-BR") ||
        post.createdAt?.toDate?.()?.toLocaleDateString("pt-BR") || "";

    const pros = post.pros || [];
    const cons = post.cons || [];
    const faqItems = post.faqItems || [];
    const contentImages = post.contentImages || [];
    const ratingCriteria = post.ratingCriteria || [];
    const averageRating = ratingCriteria.length > 0
        ? (ratingCriteria.reduce((sum, r) => sum + r.score, 0) / ratingCriteria.length).toFixed(1)
        : null;

    return (
        <article className="min-h-screen bg-gray-50">
            {/* ======== HERO HEADER ======== */}
            <header className="relative bg-gradient-to-b from-pink-50 via-white to-gray-50 pt-20 pb-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-pink-700 font-medium mb-8 hover:underline text-sm">
                        <ChevronLeft size={16} className="mr-1" /> Voltar para Home
                    </Link>

                    {post.category && (
                        <div className="flex items-center justify-center gap-2 mb-5">
                            <span className="bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                {post.category}
                            </span>
                            {isSalesArticle && (
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                    ⭐ Review
                                </span>
                            )}
                        </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-3 text-gray-500 text-sm">
                        <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-700">
                                {(post.author || "I")[0]}
                            </div>
                            <span>Por <strong className="text-gray-900">{post.author || "Isabelle"}</strong></span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span>Atualizado em {displayDate}</span>
                    </div>
                </div>
            </header>

            {/* ======== COVER IMAGE ======== */}
            {post.coverImage && (
                <div className="max-w-4xl mx-auto px-6 mt-8 mb-12">
                    <div style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}>
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block', borderRadius: '1rem' }}
                        />
                    </div>
                </div>
            )}

            {/* ======== MAIN CONTENT AREA ======== */}
            <div className="max-w-3xl mx-auto px-6 pb-20">

                {/* Affiliate Disclaimer */}
                {isSalesArticle && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-10 text-sm text-amber-800">
                        <span className="text-lg mt-0.5">⚠️</span>
                        <p>
                            <strong>Aviso:</strong> Este artigo contém links de parceiros. Se você comprar através deles,
                            podemos ganhar uma comissão, sem custo extra para você.
                        </p>
                    </div>
                )}

                {/* ======== ARTICLE BODY ======== */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-10">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .article-content a {
                            color: #db2777 !important;
                            text-decoration: underline !important;
                            text-decoration-color: #f9a8d4 !important;
                            text-underline-offset: 3px !important;
                            font-weight: 600 !important;
                            transition: color 0.2s, text-decoration-color 0.2s;
                        }
                        .article-content a:hover {
                            color: #be185d !important;
                            text-decoration-color: #be185d !important;
                        }
                    `}} />
                    <div
                        className="article-content prose prose-lg prose-pink max-w-none
                            prose-headings:text-gray-900 prose-headings:font-bold
                            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5
                            prose-strong:text-gray-900
                            prose-ul:text-gray-700 prose-ul:space-y-2
                            prose-ol:text-gray-700 prose-ol:space-y-2
                            prose-li:pl-1
                            prose-blockquote:border-l-pink-400 prose-blockquote:bg-pink-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
                            prose-img:rounded-xl prose-img:shadow-md"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                {/* ======== PROS & CONS BLOCK ======== */}
                {(pros.length > 0 || cons.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4 mb-10">
                        {/* PROS */}
                        {pros.length > 0 && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-800 mb-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    Pontos Fortes
                                </h3>
                                <ul className="space-y-3">
                                    {pros.map((pro, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-emerald-900">
                                            <span className="mt-1 flex-shrink-0 w-5 h-5 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                                            <span className="text-sm leading-relaxed">{pro}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CONS */}
                        {cons.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-red-800 mb-4">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                    Pontos Fracos
                                </h3>
                                <ul className="space-y-3">
                                    {cons.map((con, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-red-900">
                                            <span className="mt-1 flex-shrink-0 w-5 h-5 bg-red-200 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">✗</span>
                                            <span className="text-sm leading-relaxed">{con}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* ======== RATING CRITERIA BLOCK ======== */}
                {ratingCriteria.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-pink-500" />
                            Avaliação Detalhada
                        </h3>
                        <div className="space-y-4">
                            {ratingCriteria.map((criteria, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700 w-40 flex-shrink-0">{criteria.label}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-700"
                                            style={{ width: `${(criteria.score / 5) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= criteria.score ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {averageRating && (
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-700">Nota Final</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-extrabold text-pink-600">{averageRating}</span>
                                        <span className="text-gray-400 text-sm">/5.0</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ======== CONTENT IMAGES GALLERY ======== */}
                {contentImages.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-pink-500" />
                            Fotos do Teste
                        </h3>
                        <div className={`grid gap-4 ${contentImages.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                            {contentImages.map((img, i) => (
                                <figure key={i} className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
                                    <div className="overflow-hidden">
                                        <img
                                            src={img.url}
                                            alt={img.caption || `Imagem ${i + 1}`}
                                            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    {img.caption && (
                                        <figcaption className="px-4 py-3 text-sm text-gray-600 text-center italic bg-gray-50">
                                            {img.caption}
                                        </figcaption>
                                    )}
                                </figure>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======== VERDICT BLOCK ======== */}
                {post.verdict && (
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-8 mb-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 text-8xl font-black text-pink-300 -mr-2 -mt-4">&ldquo;</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-pink-500" />
                            Veredito Final
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg italic relative z-10">
                            &ldquo;{post.verdict}&rdquo;
                        </p>
                    </div>
                )}

                {/* ======== PRODUCT REVIEW BOX ======== */}
                {isSalesArticle && post.productName && (
                    <div className="bg-white border-2 border-pink-200 rounded-2xl p-8 mb-10 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-pink-600 to-purple-500" />
                        <div className="absolute top-3 right-4 bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Review Oficial
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-center mt-4">
                            {/* Professional icon instead of cover photo */}
                            <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100 flex items-center justify-center">
                                <ShieldCheck className="w-14 h-14 text-pink-400" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{post.productName}</h3>

                                {/* Star Rating */}
                                {post.productRating && post.productRating > 0 && (
                                    <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-6 h-6 ${star <= (post.productRating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                            />
                                        ))}
                                        <span className="ml-2 font-bold text-lg text-gray-800">{post.productRating}/5</span>
                                    </div>
                                )}

                                {/* Price — only show if > 0 */}
                                {post.productPrice && Number(post.productPrice) > 0 && (
                                    <p className="text-2xl font-extrabold text-pink-600 mb-4">
                                        R$ {post.productPrice}
                                    </p>
                                )}

                                {/* Affiliate Button */}
                                {post.affiliateLink && (
                                    <a
                                        href={post.affiliateLink}
                                        target="_blank"
                                        rel="nofollow sponsored noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg no-underline"
                                    >
                                        Solicitar Orçamento Gratuito
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ======== FAQ BLOCK ======== */}
                {faqItems.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-10 overflow-hidden">
                        <div className="bg-purple-50 border-b border-purple-100 px-8 py-5">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-purple-500" />
                                Perguntas Frequentes
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Respostas rápidas às dúvidas mais comuns</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {faqItems.map((faq, i) => (
                                <div key={i} className="px-8 py-6 hover:bg-gray-50/50 transition-colors">
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                                        <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                            {i + 1}
                                        </span>
                                        {faq.question}
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed pl-10">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ======== FOOTER DISCLAIMER ======== */}
                {isSalesArticle && (
                    <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-8">
                        <p>
                            Este artigo contém links de afiliados. Ao comprar através deles, você apoia nosso trabalho sem custo adicional.
                            Todas as opiniões são honestas e baseadas em testes reais.
                        </p>
                    </div>
                )}
            </div>

            {/* ======== JSON-LD SCHEMA ======== */}
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
                                "brand": { "@type": "Brand", "name": "Genérico" },
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
                                    "author": { "@type": "Person", "name": post.author || "Isabelle" }
                                }
                            }
                            : {
                                "@context": "https://schema.org",
                                "@type": "BlogPosting",
                                "headline": post.seoTitle || post.title,
                                "image": post.coverImage ? [post.coverImage] : [],
                                "author": { "@type": "Person", "name": post.author || "Isabelle" },
                                "publisher": {
                                    "@type": "Organization",
                                    "name": "Achados Vip da Isa",
                                    "logo": { "@type": "ImageObject", "url": "https://achadosvipdaisa.com.br/logo.png" }
                                },
                                "datePublished": publishDate,
                                "dateModified": updateDate,
                                "description": post.seoDescription || post.excerpt,
                                ...(post.seoKeywords ? { "keywords": post.seoKeywords } : {})
                            }
                    )
                }}
            />

            {/* ======== FAQ SCHEMA (separate for rich results) ======== */}
            {faqItems.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": faqItems.map(faq => ({
                                "@type": "Question",
                                "name": faq.question,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": faq.answer
                                }
                            }))
                        })
                    }}
                />
            )}
        </article>
    );
}
