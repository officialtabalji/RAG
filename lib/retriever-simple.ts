import { getPineconeIndex, DocumentChunk, DocumentMetadata } from './pinecone';
import { generateEmbedding } from './embeddings-simple';

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
  rerankScore?: number;
}

export interface RetrievalOptions {
  topK: number;
  rerankTopK: number;
  useReranking: boolean;
}

export const DEFAULT_RETRIEVAL_OPTIONS: RetrievalOptions = {
  topK: 20,
  rerankTopK: 5,
  useReranking: false, // Disabled by default for simple version
};

export async function retrieveDocuments(
  query: string,
  options: RetrievalOptions = DEFAULT_RETRIEVAL_OPTIONS
): Promise<RetrievalResult[]> {
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Retrieve from Pinecone
    const index = await getPineconeIndex();
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: options.topK,
      includeMetadata: true,
      includeValues: false,
    });
    
    // Convert to our format
    const results: RetrievalResult[] = queryResponse.matches?.map(match => ({
      chunk: {
        id: match.id!,
        text: match.metadata?.text as string || '',
        metadata: match.metadata as DocumentMetadata,
      },
      score: match.score || 0,
    })) || [];
    
    // Apply simple reranking if enabled and Cohere is not available
    if (options.useReranking && results.length > 0 && !process.env.COHERE_API_KEY) {
      const rerankedResults = await simpleRerankDocuments(query, results, options.rerankTopK);
      return rerankedResults;
    }
    
    // Apply Cohere reranking if available
    if (options.useReranking && results.length > 0 && process.env.COHERE_API_KEY) {
      const rerankedResults = await cohereRerankDocuments(query, results, options.rerankTopK);
      return rerankedResults;
    }
    
    return results.slice(0, options.rerankTopK);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    throw new Error('Failed to retrieve documents');
  }
}

// Simple keyword-based reranking
async function simpleRerankDocuments(
  query: string,
  results: RetrievalResult[],
  topK: number
): Promise<RetrievalResult[]> {
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const rerankedResults = results.map(result => {
    const text = result.chunk.text.toLowerCase();
    let keywordScore = 0;
    
    // Count keyword matches
    queryWords.forEach(word => {
      const matches = (text.match(new RegExp(word, 'g')) || []).length;
      keywordScore += matches;
    });
    
    // Combine with original score
    const combinedScore = result.score * 0.7 + (keywordScore / queryWords.length) * 0.3;
    
    return {
      ...result,
      rerankScore: combinedScore,
    };
  });
  
  // Sort by combined score
  rerankedResults.sort((a, b) => (b.rerankScore || 0) - (a.rerankScore || 0));
  
  return rerankedResults.slice(0, topK);
}

// Cohere reranking (if API key is available)
async function cohereRerankDocuments(
  query: string,
  results: RetrievalResult[],
  topK: number
): Promise<RetrievalResult[]> {
  try {
    const Cohere = require('cohere-ai');
    Cohere.init(process.env.COHERE_API_KEY!);
    
    const documents = results.map(result => result.chunk.text);
    
    const rerankResponse = await Cohere.rerank({
      model: 'rerank-english-v2.0',
      query: query,
      documents: documents,
      top_k: topK,
    });
    
    const rerankedResults: RetrievalResult[] = [];
    
    for (const rerankResult of rerankResponse.results) {
      const originalResult = results[rerankResult.index];
      rerankedResults.push({
        ...originalResult,
        rerankScore: rerankResult.relevance_score,
      });
    }
    
    return rerankedResults;
  } catch (error) {
    console.error('Error with Cohere reranking:', error);
    // Fallback to simple reranking
    return simpleRerankDocuments(query, results, topK);
  }
}
