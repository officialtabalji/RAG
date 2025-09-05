import { NextRequest, NextResponse } from 'next/server';
import { retrieveDocuments } from '@/lib/retriever-simple';
import { generateAnswer, estimateCost } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { query, options } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const startTime = Date.now();
    
    // Retrieve relevant documents
    const retrievedDocs = await retrieveDocuments(query, options);
    
    if (retrievedDocs.length === 0) {
      return NextResponse.json({
        success: true,
        answer: 'I cannot find any relevant information to answer your question.',
        citations: [],
        retrievedDocs: [],
        totalTime: Date.now() - startTime,
        tokensUsed: 0,
        estimatedCost: 0,
      });
    }
    
    // Generate answer with LLM
    const llmResponse = await generateAnswer(query, retrievedDocs);
    
    const totalTime = Date.now() - startTime;
    const estimatedCost = estimateCost(llmResponse.tokensUsed);
    
    return NextResponse.json({
      success: true,
      answer: llmResponse.answer,
      citations: llmResponse.citations,
      retrievedDocs: retrievedDocs.map(doc => ({
        id: doc.chunk.id,
        text: doc.chunk.text,
        metadata: doc.chunk.metadata,
        score: doc.score,
        rerankScore: doc.rerankScore,
      })),
      totalTime,
      tokensUsed: llmResponse.tokensUsed,
      estimatedCost,
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
