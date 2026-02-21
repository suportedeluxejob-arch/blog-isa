"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, Home } from "lucide-react";

interface NavLink {
    label: string;
    href: string;
}

interface MobileMenuProps {
    links: NavLink[];
}

export function MobileMenu({ links }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on route change / link click
    const handleClose = () => setIsOpen(false);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleOutside = (e: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("touchstart", handleOutside);
        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("touchstart", handleOutside);
        };
    }, [isOpen]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    return (
        <div className="md:hidden" ref={menuRef}>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu-drawer"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    border: "none",
                    background: isOpen ? "#fce7f3" : "transparent",
                    color: isOpen ? "#be185d" : "#6b7280",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                    WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                }}
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={handleClose}
                    style={{
                        position: "fixed",
                        inset: 0,
                        top: "64px",
                        background: "rgba(0, 0, 0, 0.4)",
                        zIndex: 40,
                        backdropFilter: "blur(2px)",
                        WebkitBackdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Slide-down Drawer */}
            <div
                id="mobile-menu-drawer"
                role="navigation"
                aria-label="Menu de navegação"
                style={{
                    position: "fixed",
                    top: "64px",
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: "#ffffff",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    borderRadius: "0 0 20px 20px",
                    overflow: "hidden",
                    maxHeight: isOpen ? "80vh" : "0",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(-8px)",
                    transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, transform 0.3s ease",
                    pointerEvents: isOpen ? "auto" : "none",
                    overflowY: isOpen ? "auto" : "hidden",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {/* Header inside drawer */}
                <div style={{
                    padding: "16px 24px 12px",
                    borderBottom: "1px solid #f3f4f6",
                    background: "linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%)",
                }}>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Navegação
                    </p>
                </div>

                {/* Links */}
                <div style={{ padding: "8px 0" }}>
                    {links.map((link, idx) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={handleClose}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "15px 24px",
                                fontSize: "16px",
                                fontWeight: link.href === "/" ? 700 : 500,
                                color: link.href === "/" ? "#be185d" : "#1f2937",
                                textDecoration: "none",
                                borderBottom: idx < links.length - 1 ? "1px solid #f9fafb" : "none",
                                WebkitTapHighlightColor: "transparent",
                                touchAction: "manipulation",
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {link.href === "/" && <Home size={16} color="#db2777" />}
                                {link.label}
                            </span>
                            <ChevronRight size={16} color="#d1d5db" />
                        </Link>
                    ))}
                </div>

                {/* Footer inside drawer */}
                <div style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #f3f4f6",
                    background: "#fafafa",
                    textAlign: "center",
                }}>
                    <p style={{ margin: 0, fontSize: "12px", color: "#d1d5db" }}>
                        Achados Vip da <strong style={{ color: "#db2777" }}>Isa</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
