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
        source: '/reviews/:slug*',
        destination: '/achados/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
