// Simplified embeddings using a basic text vectorization
// This is a fallback when OpenAI API is not available

export function countTokens(text: string): number {
  // Rough token estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string, chunkSize: number = 1000, chunkOverlap: number = 150): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const sentence of sentences) {
    const sentenceTokens = countTokens(sentence);
    
    if (currentTokens + sentenceTokens > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const overlapText = getOverlapText(currentChunk, chunkOverlap);
      currentChunk = overlapText + sentence;
      currentTokens = countTokens(currentChunk);
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
      currentTokens += sentenceTokens;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function getOverlapText(text: string, overlapTokens: number): string {
  const words = text.split(' ');
  const estimatedWords = Math.ceil(overlapTokens * 4 / 5); // Rough conversion
  
  if (words.length <= estimatedWords) {
    return text;
  }
  
  return words.slice(-estimatedWords).join(' ') + ' ';
}

// Simple text-based embedding (not as good as OpenAI but works for demo)
export function generateSimpleEmbedding(text: string): number[] {
  // This is a very basic embedding - just for demonstration
  // In production, you'd want to use a proper embedding model
  
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(1536).fill(0);
  
  // Simple word frequency-based embedding
  words.forEach(word => {
    const hash = simpleHash(word);
    const index = hash % 1536;
    embedding[index] += 1;
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Try OpenAI first, fallback to simple embedding
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.log('OpenAI embedding failed, using simple embedding');
    }
  }
  
  return generateSimpleEmbedding(text);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts,
      });
      
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.log('OpenAI embeddings failed, using simple embeddings');
    }
  }
  
  return texts.map(text => generateSimpleEmbedding(text));
}
