import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Sobre a Isa - Achados Vip",
  description: "Conheça mais sobre a Isa, a consumidora real por trás dos testes focados em Lifestyle, Experiência, Casa e Eletrodomésticos.",
};

export default function Sobre() {
  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-6 py-16 bg-white min-h-screen">
        <article className="prose prose-slate prose-pink lg:prose-lg max-w-none">
          <h1>Sobre a Isa</h1>

          <h2>Quem é a Isa</h2>
          <p>
            Eu sou a Isabelle, assim como você: <strong>uma consumidora real</strong>. Cansada de comprar coisas ruins, cair em furadas anunciadas na internet e perder dinheiro com promessas milagrosas, decidi mudar o jogo. Comecei a testar tudo o que comprava de forma honesta, sem maquiagem e sem filtros da publicidade tradicional. O "Achados Vip da Isa" nasceu da minha própria necessidade de consumir melhor.
          </p>

          <h2>A Minha Especialidade</h2>
          <p>
            Sou especialista em testar e curar utilidades domésticas, produtos de beleza e itens práticos para facilitar a rotina diária. Meu método é simples e direto: eu mesma compro a grande maioria dos produtos, aplico no meu dia a dia por um período de tempo razoável e avalio coisas que a publicidade não mostra, como durabilidade real, custo-benefício e facilidade de manutenção. 
          </p>
          <p>
            Neste espaço, foco estritamente em **Lifestyle, Achados e Reviews**. O objetivo é que a minha vivência sirva como filtro e bússola confiável para você fazer sempre uma escolha inteligente baseada em testes <strong>reais</strong>.
          </p>

          <h2>Transparência: Como o blog se mantém</h2>
          <p>
            Para continuar testando e publicando as análises detalhadas que você vê aqui, preciso me manter. Por isso, a maioria dos links de produtos recomendados neste blog são <strong>links de afiliados</strong>. Isso significa que, se você decidir comprar algo que testei através do meu link, eu ganho uma pequena comissão das lojas (como Amazon ou Shopee), <strong>sem nenhum custo adicional para você</strong>. A honestidade é o pilar deste blog, e minha opinião nunca será vendida.
          </p>
        </article>
      </main>
    </PublicLayout>
  );
}
