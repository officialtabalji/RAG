import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/document-processor';

export async function POST(request: NextRequest) {
  try {
    const { text, title, source } = await request.json();
    
    if (!text || !title) {
      return NextResponse.json(
        { error: 'Text and title are required' },
        { status: 400 }
      );
    }
    
    const processedDoc = await processDocument(text, title, source || 'upload');
    
    return NextResponse.json({
      success: true,
      document: processedDoc,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
