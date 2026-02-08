/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // El linting se ejecuta en desarrollo local (pnpm lint).
    // No bloquear el build de producción por reglas de ESLint.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Si hay errores de tipo, se detectan en desarrollo (pnpm type-check).
    // No bloquear el build de producción por errores de tipo.
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
