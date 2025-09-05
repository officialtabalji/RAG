# Deployment Guide

This guide will help you deploy the RAG application to Vercel.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **API Keys**: Ensure you have all required API keys

## Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial RAG application"
git push origin main
```

## Step 2: Deploy to Vercel

1. **Import Project**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   In the Vercel dashboard, go to Settings → Environment Variables and add:

   ```
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX_NAME=rag-documents
   OPENAI_API_KEY=your_openai_api_key
   COHERE_API_KEY=your_cohere_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-app-name.vercel.app`

## Step 3: Initialize Production Database

After deployment, you need to initialize your Pinecone index:

1. **Set up Pinecone**:
   - Go to [pinecone.io](https://pinecone.io)
   - Create a new project
   - Create an index with:
     - Name: `rag-documents`
     - Dimensions: `1536`
     - Metric: `cosine`
     - Cloud: `aws`
     - Region: `us-east-1`

2. **Upload Sample Data** (Optional):
   ```bash
   # Run locally with production environment variables
   node scripts/sample-data.js
   ```

## Step 4: Test Your Deployment

1. Visit your deployed URL
2. Upload a test document
3. Ask a question to verify the system works

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PINECONE_API_KEY` | Your Pinecone API key | Yes |
| `PINECONE_ENVIRONMENT` | Your Pinecone environment | Yes |
| `PINECONE_INDEX_NAME` | Name of your Pinecone index | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `COHERE_API_KEY` | Your Cohere API key | Yes |
| `GROQ_API_KEY` | Your Groq API key | Yes |

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally

2. **Runtime Errors**:
   - Verify all environment variables are set
   - Check API key permissions and quotas

3. **Pinecone Connection Issues**:
   - Ensure the index exists and is ready
   - Verify the environment and API key are correct

### Monitoring

- Check Vercel function logs for API errors
- Monitor API usage in respective dashboards
- Set up alerts for high usage or errors

## Cost Optimization

1. **Pinecone**: Use serverless tier for small applications
2. **OpenAI**: Monitor embedding usage
3. **Cohere**: Use reranking judiciously
4. **Groq**: Optimize prompt length

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Consider implementing rate limiting for production use
- Add authentication if handling sensitive data
