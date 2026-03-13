import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20 py-12 text-center text-gray-500 text-sm">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-left">
          <p>&copy; {new Date().getFullYear()} Achados Vip da Isa. Todos os direitos reservados.</p>
          <p className="mt-1 text-xs text-gray-400">Participante do Programa de Associados da Amazon e Shopee.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/sobre" className="hover:text-pink-600 transition-colors">
            Sobre a Isa
          </Link>
          <Link href="/termos-de-uso" className="hover:text-pink-600 transition-colors">
            Termos de Uso
          </Link>
          <Link href="/politica-de-privacidade" className="hover:text-pink-600 transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
