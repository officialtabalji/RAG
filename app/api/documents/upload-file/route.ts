import { NextRequest, NextResponse } from 'next/server';
import { processFile } from '@/lib/document-processor';
import { isSupportedFormat, validateFileSize } from '@/lib/document-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file format
    if (!isSupportedFormat(file.name)) {
      return NextResponse.json(
        { error: `Unsupported file format. Supported formats: PDF, DOCX, TXT, MD, CSV, XLSX` },
        { status: 400 }
      );
    }
    
    // Validate file size (10MB limit)
    if (!validateFileSize(file, 10)) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Process the file
    const processedDoc = await processFile(file, buffer);
    
    return NextResponse.json({
      success: true,
      document: processedDoc,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    );
  }
}
