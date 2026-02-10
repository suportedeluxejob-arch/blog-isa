import { notFound } from "next/navigation";
import { getReviewBySlug, getAllReviews } from "@/lib/mdx";
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
    const reviews = await getAllReviews();
    return reviews.map((review) => ({
        slug: review.slug,
    }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const review = await getReviewBySlug(slug);

    if (!review) return {};

    return {
        title: `${review.frontmatter.title} | Achados Vip da Isa`,
        description: review.frontmatter.excerpt,
    };
}

export default async function ReviewPage({ params }: PageProps) {
    const { slug } = await params;
    const review = await getReviewBySlug(slug);

    if (!review) {
        notFound();
    }

    const { frontmatter, content } = review;

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

            {/* JSON-LD Schema */}
            {/* JSON-LD Schema */}
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
