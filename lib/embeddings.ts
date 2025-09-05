import OpenAI from 'openai';
import { encoding_for_model } from 'tiktoken';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize tokenizer for text-embedding-ada-002
const tokenizer = encoding_for_model('text-embedding-ada-002');

export interface ChunkingOptions {
  chunkSize: number;
  chunkOverlap: number;
  maxTokens: number;
}

export const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  chunkSize: 1000,
  chunkOverlap: 150, // 15% overlap
  maxTokens: 1200,
};

export function countTokens(text: string): number {
  return tokenizer.encode(text).length;
}

export function chunkText(
  text: string,
  options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS
): string[] {
  const { chunkSize, chunkOverlap } = options;
  const chunks: string[] = [];
  
  // Split by sentences first for better semantic boundaries
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const sentence of sentences) {
    const sentenceTokens = countTokens(sentence);
    
    // If adding this sentence would exceed the limit, start a new chunk
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
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function getOverlapText(text: string, overlapTokens: number): string {
  const words = text.split(' ');
  const tokens = tokenizer.encode(text);
  
  if (tokens.length <= overlapTokens) {
    return text;
  }
  
  // Get the last portion of text that fits within overlap tokens
  const overlapTokensSlice = tokens.slice(-overlapTokens);
  const overlapText = tokenizer.decode(overlapTokensSlice);
  
  return overlapText + ' ';
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts,
    });
    
    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}
