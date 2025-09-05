/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
}

module.exports = nextConfig
