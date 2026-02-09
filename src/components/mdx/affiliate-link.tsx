import Link from "next/link";
import { ExternalLink } from "lucide-react";
import affiliateData from "@/data/affiliates.json";

interface AffiliateLinkProps {
  productKey?: keyof typeof affiliateData;
  customUrl?: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function AffiliateLink({ productKey, customUrl, children, className = "", showIcon = true }: AffiliateLinkProps) {
  const data = productKey ? affiliateData[productKey] : null;
  const href = data?.url || customUrl;
  const label = children || data?.label || "Ver Oferta";

  if (!href) return <span className="text-red-500">[Link Indisponível]</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={`btn-primary inline-flex items-center gap-2 px-4 py-2 bg-pink-600 !text-white font-bold rounded-lg hover:bg-pink-700 transition-colors no-underline ${className}`}
    >
      {label}
      {showIcon && <ExternalLink size={16} />}
    </a>
  );
}
