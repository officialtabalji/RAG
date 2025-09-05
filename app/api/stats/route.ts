import { NextResponse } from 'next/server';
import { getDocumentStats } from '@/lib/document-processor';

export async function GET() {
  try {
    const stats = await getDocumentStats();
    
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
