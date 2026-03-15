import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
  },
  async redirects() {
    return [
      {
        source: '/reviews/vale-a-pena-blindar-o-carro-no-rj',
        destination: '/experiencias/vale-a-pena-blindar-o-carro-no-rj',
        permanent: true,
      },
      {
        source: '/reviews/vale-a-pena-blindar-o-carro-no-rj',
        destination: '/experiencias/vale-a-pena-blindar-o-carro-no-rj',
        permanent: true,
      },
      {
        source: '/reviews/comprar-carro-blindado-rj',
        destination: '/experiencias/comprei-meu-carro-blindado-na-blindados-rj-minha-experiencia-real',
        permanent: true,
      },
      {
        source: '/reviews/guia-tecnico-como-funciona-a-blindagem-automotiva-e-seus-niveis-de-protecao',
        destination: '/experiencias/guia-tecnico-como-funciona-a-blindagem-automotiva-e-seus-niveis-de-protecao',
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
