import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Termos de Uso - Achados Vip",
  description: "Termos de uso e responsabilidades do Achados Vip da Isa. Leia atentamente nossas diretrizes de isenção de saúde, finanças e ofertas.",
};

export default function Termos() {
  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-6 py-16 bg-white min-h-screen">
        <article className="prose prose-slate prose-pink lg:prose-lg max-w-none">
          <h1>Termos de Uso e Avisos Legais</h1>

          <h2>Isenção de Responsabilidade (Saúde, Finanças e Segurança)</h2>
          <p>
            Este blog é um espaço restrito de <strong>relatos baseados nas MINHAS experiências de vida</strong>.
          </p>
          <p>
            Deixo absolutamente <strong>CLARO</strong> que eu <strong>NÃO</strong> possuo formação ou qualificação técnica oficial nas áreas abordadas fora de minha especialidade. Eu <strong>não sou consultora financeira (CNPI)</strong>, não sou mecânica especialista automotiva, não sou médica e não sou especialista de segurança pública.
          </p>
          <p>
            Os artigos que publico envolvendo a forma como organizo os meus investimentos, como me planejo diante de crises econômicas/guerras, saúde pessoal, ou sobre a segurança dos meus veículos (ex: blindagens), são <strong>ESTRITAMENTE RELATOS PESSOAIS</strong>. O único objetivo é mostrar <em>o que eu fiz na minha vida</em>, e não o que você deve fazer na sua. Cada leitor é o único e exclusivo responsável por estudar os riscos e tomar suas próprias decisões financeiras e de vida. Sempre consulte um profissional certificado antes de tomar grandes decisões críticas de vida.
          </p>

          <h2>Isenção de Ofertas e Preços</h2>
          <p>
            O mercado na internet (especialmente em grandes marketplaces online como Shopee e Amazon) é incrivelmente volátil. Por este motivo, não garantimos a permanência do estoque nem o valor final dos itens indicados nos artigos e posts. Os preços resenhados retratam apenas a janela de tempo em que a publicação foi escrita.
          </p>

          <h2>Propriedade Intelectual</h2>
          <p>
            Todos os relatos, artigos, opiniões e fotografias originais produzidas para o Achados Vip da Isa são de autoria própria e estão <strong>legalmente protegidos</strong> sob os termos da Lei de Direitos Autorais. É absolutamente vedada a cópia, reprodução parcial ou integral e comercialização não-autorizada desse material sob qualquer pretexto.
          </p>
        </article>
      </main>
    </PublicLayout>
  );
}
