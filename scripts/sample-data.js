const { processDocument } = require('../lib/document-processor');
require('dotenv').config();

const sampleDocuments = [
  {
    title: "Introduction to Machine Learning",
    content: `Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide. The primary aim is to allow the computers to learn automatically without human intervention or assistance and adjust actions accordingly.

There are three main types of machine learning:

1. Supervised Learning: This type of learning uses labeled training data to learn a mapping function from inputs to outputs. Examples include classification and regression problems.

2. Unsupervised Learning: This type of learning finds hidden patterns in data without labeled examples. Examples include clustering and dimensionality reduction.

3. Reinforcement Learning: This type of learning involves an agent learning to make decisions by taking actions in an environment to maximize cumulative reward.

Machine learning algorithms build a mathematical model based on training data to make predictions or decisions without being explicitly programmed to perform the task.`
  },
  {
    title: "Natural Language Processing Fundamentals",
    content: `Natural Language Processing (NLP) is a field of artificial intelligence that focuses on the interaction between computers and humans through natural language. The ultimate objective of NLP is to read, decipher, understand, and make sense of human language in a valuable way.

NLP combines computational linguistics—rule-based modeling of human language—with statistical, machine learning, and deep learning models. These technologies enable computers to process human language in the form of text or voice data and understand its full meaning, complete with the speaker's or writer's intent and sentiment.

Key components of NLP include:

1. Tokenization: Breaking down text into individual words or tokens.
2. Part-of-speech tagging: Identifying the grammatical parts of speech for each word.
3. Named entity recognition: Identifying and classifying named entities in text.
4. Sentiment analysis: Determining the emotional tone of text.
5. Machine translation: Automatically translating text from one language to another.

Modern NLP systems often use transformer architectures, such as BERT, GPT, and T5, which have revolutionized the field by achieving state-of-the-art results on many NLP tasks. These models are pre-trained on large corpora of text and can be fine-tuned for specific tasks.`
  },
  {
    title: "Vector Databases and Embeddings",
    content: `Vector databases are specialized databases designed to store, index, and query high-dimensional vectors efficiently. They are essential for modern AI applications that rely on embeddings and similarity search.

Embeddings are dense vector representations of data that capture semantic meaning. In the context of text, embeddings convert words, sentences, or documents into numerical vectors in a high-dimensional space where similar content is positioned close together.

Key concepts in vector databases:

1. Vector Similarity: Measured using metrics like cosine similarity, Euclidean distance, or dot product.
2. Indexing: Efficient data structures like HNSW (Hierarchical Navigable Small World) or IVF (Inverted File) for fast similarity search.
3. Approximate Nearest Neighbor (ANN) search: Finding the most similar vectors without exhaustive search.

Popular vector databases include Pinecone, Weaviate, Qdrant, and Chroma. These databases are optimized for:
- Fast similarity search at scale
- Real-time updates and insertions
- Metadata filtering
- Hybrid search combining vector and traditional search

Vector databases are crucial for applications like recommendation systems, semantic search, retrieval-augmented generation (RAG), and similarity matching.`
  },
  {
    title: "Retrieval-Augmented Generation (RAG)",
    content: `Retrieval-Augmented Generation (RAG) is a technique that combines information retrieval with text generation to improve the accuracy and relevance of AI-generated responses. RAG systems retrieve relevant information from a knowledge base and use it as context for generating answers.

The RAG process typically involves:

1. Document Processing: Breaking down documents into chunks and creating embeddings.
2. Storage: Storing document chunks and their embeddings in a vector database.
3. Retrieval: Finding relevant chunks based on query similarity.
4. Reranking: Further refining retrieved results using more sophisticated ranking models.
5. Generation: Using a language model to generate answers based on retrieved context.

Benefits of RAG include:
- Reduced hallucination by grounding responses in retrieved facts
- Ability to incorporate up-to-date information
- Transparency through source citations
- Domain-specific knowledge integration

RAG systems are particularly useful for question-answering, chatbots, and knowledge management applications where accuracy and source attribution are important. The quality of a RAG system depends on the effectiveness of retrieval, the relevance of reranking, and the capability of the generation model.`
  },
  {
    title: "Large Language Models and Transformers",
    content: `Large Language Models (LLMs) are neural networks with billions or trillions of parameters trained on vast amounts of text data. They have revolutionized natural language processing and AI applications.

Transformer architecture, introduced in "Attention Is All You Need" (2017), is the foundation of modern LLMs. Key components include:

1. Self-Attention: Allows the model to focus on different parts of the input sequence.
2. Multi-Head Attention: Multiple attention mechanisms running in parallel.
3. Positional Encoding: Information about the position of tokens in the sequence.
4. Feed-Forward Networks: Processing attention outputs.

Popular LLMs include:
- GPT series (Generative Pre-trained Transformer)
- BERT (Bidirectional Encoder Representations from Transformers)
- T5 (Text-to-Text Transfer Transformer)
- PaLM (Pathways Language Model)
- LLaMA (Large Language Model Meta AI)

LLMs demonstrate emergent capabilities like:
- Few-shot learning
- Chain-of-thought reasoning
- Code generation
- Mathematical problem solving
- Creative writing

However, LLMs also have limitations including hallucination, bias, and lack of real-time knowledge. Techniques like RAG, fine-tuning, and prompt engineering help address these limitations.`
  }
];

async function uploadSampleData() {
  try {
    console.log('Uploading sample documents...');
    
    for (const doc of sampleDocuments) {
      console.log(`Processing: ${doc.title}`);
      const result = await processDocument(doc.content, doc.title, 'sample-data');
      console.log(`✓ Uploaded ${doc.title} (${result.chunks.length} chunks, ${result.totalTokens} tokens)`);
    }
    
    console.log('All sample documents uploaded successfully!');
    
  } catch (error) {
    console.error('Error uploading sample data:', error);
    process.exit(1);
  }
}

uploadSampleData();
