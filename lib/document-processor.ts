import { chunkText, generateEmbeddings, countTokens } from './embeddings-simple';
import { getPineconeIndex, DocumentChunk, DocumentMetadata } from './pinecone';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedDocument {
  id: string;
  title: string;
  source: string;
  chunks: DocumentChunk[];
  totalTokens: number;
  processingTime: number;
}

export async function processDocument(
  text: string,
  title: string,
  source: string = 'upload'
): Promise<ProcessedDocument> {
  const startTime = Date.now();
  
  try {
    // Generate document ID
    const documentId = uuidv4();
    
    // Count total tokens
    const totalTokens = countTokens(text);
    
    // Chunk the text
    const textChunks = chunkText(text);
    
    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(textChunks);
    
    // Create document chunks with metadata
    const chunks: DocumentChunk[] = textChunks.map((chunkText, index) => ({
      id: `${documentId}_chunk_${index}`,
      text: chunkText,
      metadata: {
        source,
        title,
        position: index,
        chunkIndex: index,
        totalChunks: textChunks.length,
      },
      embedding: embeddings[index],
    }));
    
    // Store in Pinecone
    await storeChunksInPinecone(chunks);
    
    const processingTime = Date.now() - startTime;
    
    return {
      id: documentId,
      title,
      source,
      chunks,
      totalTokens,
      processingTime,
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error('Failed to process document');
  }
}

async function storeChunksInPinecone(chunks: DocumentChunk[]): Promise<void> {
  try {
    const index = await getPineconeIndex();
    
    // Prepare vectors for upsert
    const vectors = chunks.map(chunk => ({
      id: chunk.id,
      values: chunk.embedding!,
      metadata: {
        text: chunk.text,
        ...chunk.metadata,
      },
    }));
    
    // Upsert in batches to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }
  } catch (error) {
    console.error('Error storing chunks in Pinecone:', error);
    throw new Error('Failed to store document chunks');
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const index = await getPineconeIndex();
    
    // Get all chunks for this document
    const queryResponse = await index.query({
      vector: new Array(1536).fill(0), // Dummy vector
      topK: 10000,
      includeMetadata: true,
      filter: {
        source: { $eq: documentId }
      }
    });
    
    // Delete all chunks
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const idsToDelete = queryResponse.matches.map(match => match.id!);
      await index.deleteMany(idsToDelete);
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

export async function getDocumentStats(): Promise<{
  totalDocuments: number;
  totalChunks: number;
  totalTokens: number;
}> {
  try {
    const index = await getPineconeIndex();
    
    // Get index stats
    const stats = await index.describeIndexStats();
    
    return {
      totalDocuments: stats.totalVectorCount || 0,
      totalChunks: stats.totalVectorCount || 0,
      totalTokens: 0, // Would need to track this separately
    };
  } catch (error) {
    console.error('Error getting document stats:', error);
    return {
      totalDocuments: 0,
      totalChunks: 0,
      totalTokens: 0,
    };
  }
}
