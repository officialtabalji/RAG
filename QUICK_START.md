# 🚀 Quick Start Guide

## Step 1: Get API Keys (Minimum Required)

### **Pinecone (Vector Database) - FREE**
1. Go to [https://pinecone.io](https://pinecone.io)
2. Sign up (free account)
3. Create a project
4. Go to "API Keys" → Copy your key and environment

### **Groq (LLM) - FREE**
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up (free account)
3. Go to "API Keys" → Create new key

## Step 2: Set Up Environment

Create `.env.local` file in the project root:

```env
# Required
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_ENVIRONMENT=your_environment_here
GROQ_API_KEY=your_groq_key_here

# Optional (for better performance)
# OPENAI_API_KEY=your_openai_key_here
# COHERE_API_KEY=your_cohere_key_here
```

## Step 3: Run the Application

```bash
# 1. Install dependencies
npm install

# 2. Initialize Pinecone database
node scripts/init-pinecone.js

# 3. Start the app
npm run dev
```

## Step 4: Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Upload a text document or paste content
3. Ask questions about your documents
4. See AI-generated answers with citations!

## 🎯 What Works Without Full Setup

- ✅ **UI**: Fully functional interface
- ✅ **Basic Embeddings**: Simple text-based vectors
- ✅ **Pinecone Storage**: Vector database
- ✅ **Groq LLM**: Fast AI responses
- ❌ **Advanced Embeddings**: Need OpenAI for better quality
- ❌ **Reranking**: Need Cohere for better relevance

## 💡 Pro Tips

1. **Start Simple**: Use just Pinecone + Groq first
2. **Add OpenAI Later**: For better embedding quality
3. **Add Cohere Later**: For better document ranking
4. **Test with Sample Data**: Run `node scripts/sample-data.js`

## 🆘 Troubleshooting

**"next is not recognized"**
- Run `npm install` again

**"Pinecone connection failed"**
- Check your API key and environment name
- Make sure the index exists

**"No documents found"**
- Upload some documents first
- Or run the sample data script

**"LLM error"**
- Check your Groq API key
- Make sure you have free credits

## 📞 Need Help?

1. Check the full README.md for detailed setup
2. Look at DEPLOYMENT.md for production setup
3. Run the evaluation script to test: `node scripts/evaluation.js`
