import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'achadosvipdaisa.com.br',
          },
        ],
        destination: 'https://www.achadosvipdaisa.com.br/:path*',
        statusCode: 301,
      },
      {
        source: '/reviews/vale-a-pena-blindar-o-carro-no-rj',
        destination: '/experiencias/vale-a-pena-blindar-o-carro-no-rj',
        statusCode: 301,
      },
      {
        source: '/reviews/vale-a-pena-blindar-o-carro-no-rj',
        destination: '/experiencias/vale-a-pena-blindar-o-carro-no-rj',
        statusCode: 301,
      },
      {
        source: '/reviews/comprar-carro-blindado-rj',
        destination: '/experiencias/comprar-carro-blindado-rj',
        statusCode: 301,
      },
      {
        source: '/reviews/guia-tecnico-como-funciona-a-blindagem-automotiva-e-seus-niveis-de-protecao',
        destination: '/experiencias/o-que-aprendi-sobre-blindagem-rj',
        statusCode: 301,
      },
      {
        source: '/reviews/como-funciona-blindados-rj',
        destination: '/experiencias/como-funciona-blindados-rj',
        statusCode: 301,
      },
      {
        source: '/achados/como-funciona-blindados-rj',
        destination: '/experiencias/como-funciona-blindados-rj',
        permanent: true,
      },
      {
        source: '/reviews/:slug*',
        destination: '/achados/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
