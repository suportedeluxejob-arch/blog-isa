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
        source: '/reviews/comprei-meu-carro-blindado-na-blindados-rj-minha-experiencia-real',
        destination: '/experiencias/comprei-meu-carro-blindado-na-blindados-rj-minha-experiencia-real',
        permanent: true,
      },
      {
        source: '/reviews/como-funciona-blindados-rj',
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
