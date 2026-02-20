import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthContextProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Achados Vip da Isa - Reviews Sinceros de Casa & Tech",
  description: "Curadoria de ofertas e reviews testados pela Isabelle. Encontre os melhores gadgets para sua casa.",
  openGraph: {
    title: "Achados Vip da Isa",
    description: "Reviews honestos e curadoria de ofertas. Gadgets, casa inteligente e beleza.",
    type: "website",
    locale: "pt_BR",
    siteName: "Achados Vip da Isa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
