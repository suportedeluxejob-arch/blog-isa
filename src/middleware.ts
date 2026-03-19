import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de slugs (URLs) de artigos sobre blindagem que foram intencionalmente removidos
// por violação de fronteira temática (YMYL).
const goneSlugs = [
  'vale-a-pena-blindar-o-carro-no-rj',
  'comprar-carro-blindado-rj',
  'o-que-aprendi-sobre-blindagem-rj',
  'como-funciona-blindados-rj',
  'guia-tecnico-como-funciona-a-blindagem-automotiva-e-seus-niveis-de-protecao'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se o caminho atual tenta acessar um dos artigos deletados
  // Independente do prefixo (/reviews, /experiencias, /achados)
  const isGoneArticle = goneSlugs.some(slug => pathname.endsWith(`/${slug}`));
  
  // Verifica tentativas de acessar a categoria antiga
  const isGoneCategory = pathname === '/categories/carros-blindados-rj';

  if (isGoneArticle || isGoneCategory) {
    // Retorna HTTP Status 410 (Gone) explícito
    // Instruindo o Googlebot a dropar imediatamente essa URL do índice
    return new NextResponse(
      'Gone - 410. Este conteudo foi removido permanentemente para readequacao de foco tematico e diretrizes de qualidade (E-E-A-T) da entidade.',
      { 
        status: 410,
        headers: {
          'Content-Type': 'text/plain',
        }
      }
    );
  }
  
  return NextResponse.next();
}

// Otimização: O middleware só vai executar nas rotas de conteúdo onde essas URLs existiam
export const config = {
  matcher: [
    '/reviews/:path*',
    '/experiencias/:path*',
    '/achados/:path*',
    '/categories/:path*'
  ],
};
