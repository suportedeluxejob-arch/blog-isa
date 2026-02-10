
import Link from "next/link";

export function Navbar() {
    const links = [
        { label: "Home", href: "/" },
        { label: "Casa Inteligente", href: "/categories/casa-inteligente" },
        { label: "Beleza & Autocuidado", href: "/categories/beleza-e-autocuidado" },
        // { label: "Tech", href: "/categories/tech" }, // Commented out until we have tech content
    ];

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-gray-900 group">
                    Achados Vip da <span className="text-pink-600 group-hover:text-pink-700 transition-colors">Isa</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-gray-600 hover:text-pink-600 font-medium transition-colors text-sm uppercase tracking-wide"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Placeholder (Simple for now) */}
                <div className="md:hidden text-gray-400 text-sm">
                    {/* Can be expanded later */}
                    Menu
                </div>
            </div>
        </nav>
    );
}
