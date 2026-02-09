import { Star } from "lucide-react";
import { AffiliateLink } from "./affiliate-link";

interface ProductReviewBoxProps {
    productName: string;
    rating: number;
    verdict: string;
    image?: string;
    productKey: string;
}

export function ProductReviewBox({ productName, rating, verdict, image, productKey }: ProductReviewBoxProps) {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                REVIEW OFICIAL
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
                {image && (
                    <div className="w-32 h-32 flex-shrink-0 bg-white rounded-xl p-2 border border-slate-100 flex items-center justify-center">
                        {/* Replace with Next/Image in production if needed */}
                        <img src={image} alt={productName} className="max-w-full max-h-full object-contain" />
                    </div>
                )}

                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{productName}</h3>

                    <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                                    }`}
                            />
                        ))}
                        <span className="ml-2 font-bold text-slate-700">{rating}/5.0</span>
                    </div>

                    <p className="text-slate-600 italic mb-4">"{verdict}"</p>

                    <AffiliateLink productKey={productKey as any} className="w-full md:w-auto justify-center">
                        Ver Melhor Preço
                    </AffiliateLink>
                </div>
            </div>
        </div>
    );
}
