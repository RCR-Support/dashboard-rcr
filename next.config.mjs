/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { dev, isServer }) => {
        // Solo desactivar la minificación en desarrollo
        if (dev) {
            config.optimization.minimize = false;
        }

        // Optimización para módulos específicos
        if (!isServer) {
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                '@heroui': {
                    test: /[\\/]node_modules[\\/](@heroui)[\\/]/,
                    name: '@heroui',
                    priority: 10,
                    reuseExistingChunk: true,
                },
                'framer-motion': {
                    test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
                    name: 'framer-motion',
                    priority: 10,
                    reuseExistingChunk: true,
                },
            };
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
    
    // Optimizaciones experimentales
    experimental: {
        optimizePackageImports: ['@heroui/tooltip', '@heroui/button', '@heroui/react', 'framer-motion'],
    },
};

export default nextConfig;
