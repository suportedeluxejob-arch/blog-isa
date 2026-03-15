import Link from "next/link";
import { getPosts as getFirestorePosts } from "@/services/postService";
import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Achados Vip da Isa - Reviews Sinceros de Casa & Tech",
  description: "Curadoria de ofertas e reviews sinceros testados pela Isabelle. Encontre os melhores gadgets para sua casa.",
};

export const revalidate = 60;

export default async function Home() {
  const firestorePosts = await getFirestorePosts();

  const formattedFirestore = firestorePosts
    .filter(post => post.status === "published")
    .map(post => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      category: post.category || "Blog",
      date: post.createdAt?.toDate().toLocaleDateString("pt-BR"),
      articleType: post.articleType || "educational",
      origin: "firestore",
    }));

  const isExperienciaPost = (p: any) => {
    const cat = p.category?.toLowerCase() || "";
    return cat === "carros blindados rj" || cat === "minhas experiências" || cat === "minhas experiencias" || p.slug?.includes("blindado");
  };

  const allPosts = [...formattedFirestore];
  const achadosPosts = allPosts.filter(p => !isExperienciaPost(p));
  const experienciasPosts = allPosts.filter(p => isExperienciaPost(p));

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 font-sans pb-20">
        {/* Hero Section */}
        <header className="bg-white border-b border-gray-100 py-12 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Achados Vip da <span className="text-pink-600">Isa</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            O diário oficial da Isa: relatos reais, reviews sinceros e achados incríveis sobre estilo de vida, casa e o meu dia a dia.
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-pink-500 pl-4">
            Últimos Achados & Reviews
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {achadosPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/achados/${post.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {post.coverImage && (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-pink-600 uppercase tracking-wide">
                      {post.category}
                    </span>
                    {post.articleType === "educational" && (
                      <span className="bg-purple-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide">
                        📚 Guia
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                    <span>{post.date}</span>
                    <span className="font-medium text-pink-600">Ler Review &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}

            {achadosPosts.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                Nenhum review de achados publicado ainda.
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-purple-500 pl-4 mt-8">
            Diário da Isa: Minhas Experiências
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experienciasPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/experiencias/${post.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {post.coverImage && (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-600 uppercase tracking-wide">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                    <span>{post.date}</span>
                    <span className="font-medium text-purple-600">Ler Relato &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}

            {experienciasPosts.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                Nenhuma experiência publicada ainda.
              </div>
            )}
          </div>
        </main>
      </div>
    </PublicLayout>
  );
}
