import Link from "next/link";
import { getAllReviews } from "@/lib/mdx";

export const metadata = {
  title: "Achados Vip da Isa - Reviews Sinceros de Casa & Tech",
  description: "Curadoria de ofertas e reviews testados pela Isabelle. Encontre os melhores gadgets para sua casa.",
};

export default async function Home() {
  const reviews = await getAllReviews();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-100 py-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Achados Vip da <span className="text-pink-600">Isa</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Reviews honestos (do tipo que fala a verdade), curadoria de ofertas e dicas para uma casa mais inteligente.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-pink-500 pl-4">
          Últimos Reviews & Testes
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((post) => (
            <Link
              key={post.slug}
              href={`/reviews/${post.slug}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Image Placeholder (or Real Image) */}
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {post.frontmatter.featuredImage && (
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${post.frontmatter.featuredImage})` }} />
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 uppercase tracking-wide">
                  {post.frontmatter.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors mb-3">
                  {post.frontmatter.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                  {post.frontmatter.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                  <span>{post.frontmatter.date}</span>
                  <span className="font-medium text-pink-600">Ler Review &rarr;</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Placeholder for when we have few posts */}
          {reviews.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              Nenhum review publicado ainda. Volte em breve!
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 mt-20 py-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Achados Vip da Isa. Todos os direitos reservados.</p>
        <p className="mt-2">Participante do Programa de Associados da Amazon e Shopee.</p>
      </footer>
    </div>
  );
}
