import Link from "next/link";
import { getCategories } from "@/services/postService";
import { getAllReviews } from "@/lib/mdx";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
    // Get categories from Firestore
    let firestoreCategories: { label: string; href: string }[] = [];
    try {
        const cats = await getCategories();
        firestoreCategories = cats.map((cat) => ({
            label: cat.name,
            href: `/categories/${cat.slug}`,
        }));
    } catch (error) {
        console.warn("Could not load Firestore categories:", error);
    }

    // Get categories from MDX articles (legacy)
    let mdxCategories: { label: string; href: string }[] = [];
    try {
        const reviews = await getAllReviews();
        const uniqueCats = Array.from(
            new Set(reviews.map((r) => r.frontmatter.category).filter(Boolean))
        );
        mdxCategories = uniqueCats.map((cat) => ({
            label: cat,
            href: `/categories/${cat.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")}`,
        }));
    } catch (error) {
        console.warn("Could not load MDX categories:", error);
    }

    // Merge categories, avoiding duplicates by href
    const seenHrefs = new Set<string>();
    const allLinks: { label: string; href: string }[] = [{ label: "Home", href: "/" }];

    // Firestore categories take priority
    for (const cat of firestoreCategories) {
        if (!seenHrefs.has(cat.href)) {
            seenHrefs.add(cat.href);
            allLinks.push(cat);
        }
    }
    // Then MDX categories (if not already added)
    for (const cat of mdxCategories) {
        if (!seenHrefs.has(cat.href)) {
            seenHrefs.add(cat.href);
            allLinks.push(cat);
        }
    }

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-gray-900 group flex-shrink-0">
                    Achados Vip da <span className="text-pink-600 group-hover:text-pink-700 transition-colors">Isa</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {allLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-gray-600 hover:text-pink-600 font-medium transition-colors text-sm uppercase tracking-wide"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile Hamburger Menu (Client Component) */}
                <MobileMenu links={allLinks} />
            </div>
        </nav>
    );
}
