import Groq from 'groq-sdk';
import { RetrievalResult } from './retriever';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export interface LLMResponse {
  answer: string;
  citations: Citation[];
  tokensUsed: number;
  processingTime: number;
}

export interface Citation {
  id: number;
  source: string;
  title: string;
  section?: string;
  text: string;
  score: number;
}

export async function generateAnswer(
  query: string,
  retrievedDocs: RetrievalResult[]
): Promise<LLMResponse> {
  const startTime = Date.now();
  
  try {
    // Prepare context and citations
    const context = prepareContext(retrievedDocs);
    const citations = prepareCitations(retrievedDocs);
    
    // Create the prompt
    const prompt = createPrompt(query, context, citations);
    
    // Generate response using Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant that answers questions based on provided context. 
          Always cite your sources using the format [1], [2], etc. 
          If you cannot find the answer in the provided context, say "I cannot find the answer to this question in the provided documents."
          Be accurate, concise, and helpful.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 1000,
    });
    
    const answer = completion.choices[0]?.message?.content || 'No answer generated.';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;
    
    return {
      answer,
      citations,
      tokensUsed,
      processingTime,
    };
  } catch (error) {
    console.error('Error generating answer:', error);
    throw new Error('Failed to generate answer');
  }
}

function prepareContext(retrievedDocs: RetrievalResult[]): string {
  return retrievedDocs
    .map((result, index) => {
      const { chunk } = result;
      return `[${index + 1}] ${chunk.text}`;
    })
    .join('\n\n');
}

function prepareCitations(retrievedDocs: RetrievalResult[]): Citation[] {
  return retrievedDocs.map((result, index) => ({
    id: index + 1,
    source: result.chunk.metadata.source,
    title: result.chunk.metadata.title,
    section: result.chunk.metadata.section,
    text: result.chunk.text,
    score: result.rerankScore || result.score,
  }));
}

function createPrompt(query: string, context: string, citations: Citation[]): string {
  return `Based on the following context, please answer the question: "${query}"

Context:
${context}

Instructions:
1. Answer the question based only on the provided context
2. Use citations in the format [1], [2], etc. to reference specific sources
3. If the answer cannot be found in the context, clearly state that
4. Be concise but comprehensive
5. Maintain accuracy and avoid hallucination

Question: ${query}

Answer:`;
}

export function estimateCost(tokensUsed: number, model: string = 'llama3-8b-8192'): number {
  // Rough cost estimates (these are approximate and may vary)
  const costPerToken = {
    'llama3-8b-8192': 0.0000002, // $0.20 per 1M tokens
    'llama3-70b-8192': 0.0000009, // $0.90 per 1M tokens
  };
  
  return tokensUsed * (costPerToken[model as keyof typeof costPerToken] || 0.0000002);
}
