import PublicLayout from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Política de Privacidade - Achados Vip da Isa",
  description: "Entenda como protegemos seus dados. Este aviso explica o uso de Cookies de sistema e parcerias afiliadas.",
};

export default function Politica() {
  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-6 py-16 bg-white min-h-screen">
        <article className="prose prose-slate prose-pink lg:prose-lg max-w-none">
          <h1>Política de Privacidade</h1>

          <h2>Coleta de Dados</h2>
          <p>
            A sua privacidade é um compromisso levado a sério em nosso portal. Nós possuímos um sistema estruturado de autenticação fornecido pelo <strong>Firebase</strong>, serviço seguro da Google, que armazena informações básicas de login sempre sob alto grau de criptografia se você escolher assinar ou comentar através do nosso sistema. Além disso, utilizamos as ferramentas analíticas convencionais padrão de mercado para compreender como os visitantes navegam neste blog.
          </p>

          <h2>Uso de Cookies</h2>
          <p>
            O Achados Vip da Isa faz o uso de <strong>cookies</strong> estritamente para garantir a funcionalidade da sua experiência, métricas de Analytics e para o correto funcionamento das <strong>nossas redes de afiliados (Links Amazon/Shopee)</strong>. Quando você clica num item recomendado e vai para a loja parceira, este cookie de redirecionamento providencia que o sistema saiba que a recomendação saiu do nosso site, permitindo então que sejamos comissionados pela loja. Esses cookies em momento algum roubam dados sensíveis da sua máquina.
          </p>

          <h2>Não vendemos seus dados para terceiros</h2>
          <p>
            É importante reforçar nossa adequação com a <strong>LGPD (Lei Geral de Proteção de Dados)</strong>. Nós nunca cedemos, permutamos e muito menos <strong>vendemos</strong> os seus dados de registro, de uso, nome ou navegação para quaisquer empresas terceirizadas em troca de compensação financeira. Nossa parceria é com você e seus dados ficam onde estão.
          </p>
        </article>
      </main>
    </PublicLayout>
  );
}
