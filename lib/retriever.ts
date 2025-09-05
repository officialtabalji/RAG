import { getPineconeIndex, DocumentChunk, DocumentMetadata } from './pinecone';
import { generateEmbedding } from './embeddings';
import Cohere from 'cohere-ai';

// Initialize Cohere for reranking
Cohere.init(process.env.COHERE_API_KEY!);

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
  useReranking: true,
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
    
    // Apply reranking if enabled
    if (options.useReranking && results.length > 0) {
      const rerankedResults = await rerankDocuments(query, results, options.rerankTopK);
      return rerankedResults;
    }
    
    return results.slice(0, options.rerankTopK);
  } catch (error) {
    console.error('Error retrieving documents:', error);
    throw new Error('Failed to retrieve documents');
  }
}

export async function rerankDocuments(
  query: string,
  results: RetrievalResult[],
  topK: number
): Promise<RetrievalResult[]> {
  try {
    if (results.length === 0) return results;
    
    // Prepare documents for reranking
    const documents = results.map(result => result.chunk.text);
    
    // Use Cohere rerank API
    const rerankResponse = await Cohere.rerank({
      model: 'rerank-english-v2.0',
      query: query,
      documents: documents,
      top_k: topK,
    });
    
    // Map reranked results back to original format
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
    console.error('Error reranking documents:', error);
    // Fallback to original results if reranking fails
    return results.slice(0, topK);
  }
}

// MMR (Maximal Marginal Relevance) implementation
export function applyMMR(
  results: RetrievalResult[],
  queryEmbedding: number[],
  lambda: number = 0.7
): RetrievalResult[] {
  if (results.length <= 1) return results;
  
  const selected: RetrievalResult[] = [];
  const remaining = [...results];
  
  // Start with the highest scoring result
  const first = remaining.reduce((max, current) => 
    current.score > max.score ? current : max
  );
  selected.push(first);
  remaining.splice(remaining.indexOf(first), 1);
  
  // Select remaining results using MMR
  while (remaining.length > 0 && selected.length < 10) {
    let bestScore = -Infinity;
    let bestIndex = -1;
    
    for (let i = 0; i < remaining.length; i++) {
      const relevance = remaining[i].score;
      const maxSimilarity = Math.max(
        ...selected.map(sel => 
          cosineSimilarity(
            remaining[i].chunk.embedding || [],
            sel.chunk.embedding || []
          )
        )
      );
      
      const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarity;
      
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = i;
      }
    }
    
    if (bestIndex >= 0) {
      selected.push(remaining[bestIndex]);
      remaining.splice(bestIndex, 1);
    } else {
      break;
    }
  }
  
  return selected;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
