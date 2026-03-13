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

          <h2>Por que o blog fala de tantos assuntos?</h2>
          <p>
            Se tem algo curioso sobre minha rotina é que ela nunca para num único assunto. Você vai me ver fazendo review desde um Mop Giratório de R$ 40 que salvou a minha faxina, até falando sobre a blindagem de carros de luxo, viagens inesquecíveis ou sobre organização financeira.
          </p>
          <p>
            Aqui, o nicho não é um único produto. O nicho é a <strong>"Vida e as Experiências da Isa"</strong>. Este espaço funciona como o meu "diário aberto". Eu simplesmente documento o que funciona para mim e, tão importante quanto: o que <em>não</em> funciona na prática. Se eu vivi e testei, vira artigo aqui.
          </p>

          <h2>A Nossa Missão</h2>
          <p>
            Ajudar outras pessoas a tomarem as melhores decisões do dia a dia. Sem propagandas mascaradas, sem discursos prontos. Apenas a minha vivência servindo de bússola para que você faça uma escolha inteligente baseada em testes <strong>reais</strong>.
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
