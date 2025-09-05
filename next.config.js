/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Solo desactivar la minificación en desarrollo
    if (dev) {
      config.optimization.minimize = false;
    }
    return config;
  },

  // Añadir configuración para permitir imágenes de Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
