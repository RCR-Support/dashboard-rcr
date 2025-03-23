/** @type {import('next').NextConfig} */
const nextConfig = {

    webpack: (config, { dev, isServer }) => {
        config.optimization.minimize = false;
        return config;
    },

};

export default nextConfig;
