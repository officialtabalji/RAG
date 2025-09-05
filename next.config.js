/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
