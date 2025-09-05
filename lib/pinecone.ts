import { Pinecone } from '@pinecone-database/pinecone';

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return pinecone;
};

export const getPineconeIndex = async () => {
  const client = await getPineconeClient();
  return client.index(process.env.PINECONE_INDEX_NAME || 'rag-documents');
};

export interface DocumentMetadata {
  source: string;
  title: string;
  section?: string;
  position: number;
  chunkIndex: number;
  totalChunks: number;
}

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: DocumentMetadata;
  embedding?: number[];
}
