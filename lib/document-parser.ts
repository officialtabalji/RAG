import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';

export interface ParsedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    wordCount?: number;
    size: number;
  };
}

export interface SupportedFormat {
  extension: string;
  mimeType: string;
  description: string;
}

export const SUPPORTED_FORMATS: SupportedFormat[] = [
  { extension: 'pdf', mimeType: 'application/pdf', description: 'PDF Document' },
  { extension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'Word Document' },
  { extension: 'doc', mimeType: 'application/msword', description: 'Word Document (Legacy)' },
  { extension: 'txt', mimeType: 'text/plain', description: 'Text File' },
  { extension: 'md', mimeType: 'text/markdown', description: 'Markdown File' },
  { extension: 'csv', mimeType: 'text/csv', description: 'CSV File' },
  { extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Excel Spreadsheet' },
  { extension: 'xls', mimeType: 'application/vnd.ms-excel', description: 'Excel Spreadsheet (Legacy)' },
];

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function isSupportedFormat(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  return SUPPORTED_FORMATS.some(format => format.extension === extension);
}

export function getSupportedExtensions(): string[] {
  return SUPPORTED_FORMATS.map(format => format.extension);
}

export function getSupportedMimeTypes(): string[] {
  return SUPPORTED_FORMATS.map(format => format.mimeType);
}

export async function parseDocument(
  file: File,
  buffer: Buffer
): Promise<ParsedDocument> {
  const fileName = file.name;
  const fileType = getFileExtension(fileName);
  const size = file.size;

  let text = '';
  let metadata: any = {};

  try {
    switch (fileType) {
      case 'pdf':
        const pdfResult = await parsePDF(buffer);
        text = pdfResult.text;
        metadata = pdfResult.metadata;
        break;

      case 'docx':
        const docxResult = await parseDOCX(buffer);
        text = docxResult.text;
        metadata = docxResult.metadata;
        break;

      case 'doc':
        // For .doc files, we'll treat them as binary and try to extract text
        // Note: This is limited - for better .doc support, consider using a different library
        text = 'Legacy .doc files are not fully supported. Please convert to .docx format for better results.';
        metadata = { warning: 'Limited support for .doc files' };
        break;

      case 'txt':
      case 'md':
        text = buffer.toString('utf-8');
        metadata = { encoding: 'utf-8' };
        break;

      case 'csv':
        const csvResult = await parseCSV(buffer);
        text = csvResult.text;
        metadata = csvResult.metadata;
        break;

      case 'xlsx':
      case 'xls':
        const excelResult = await parseExcel(buffer);
        text = excelResult.text;
        metadata = excelResult.metadata;
        break;

      default:
        throw new Error(`Unsupported file format: ${fileType}`);
    }

    return {
      text: text.trim(),
      metadata: {
        fileName,
        fileType,
        size,
        ...metadata,
        wordCount: text.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error(`Error parsing ${fileName}:`, error);
    throw new Error(`Failed to parse ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parsePDF(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        info: data.info,
      },
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parseDOCX(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      metadata: {
        messages: result.messages,
      },
    };
  } catch (error) {
    throw new Error(`DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parseCSV(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Convert CSV data to readable text format
        const text = results.map((row, index) => {
          const rowText = Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          return `Row ${index + 1}: ${rowText}`;
        }).join('\n');
        
        resolve({
          text,
          metadata: {
            rowCount: results.length,
            columns: results.length > 0 ? Object.keys(results[0]) : [],
          },
        });
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      });
  });
}

async function parseExcel(buffer: Buffer): Promise<{ text: string; metadata: any }> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    let text = '';
    const metadata: any = {
      sheetCount: sheetNames.length,
      sheetNames,
    };

    // Process each sheet
    sheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      text += `\n--- Sheet ${index + 1}: ${sheetName} ---\n`;
      
      // Convert to readable format
      jsonData.forEach((row: any, rowIndex: number) => {
        if (Array.isArray(row) && row.length > 0) {
          const rowText = row.filter(cell => cell !== undefined && cell !== null)
            .map(cell => String(cell))
            .join(' | ');
          if (rowText.trim()) {
            text += `Row ${rowIndex + 1}: ${rowText}\n`;
          }
        }
      });
    });

    return {
      text: text.trim(),
      metadata,
    };
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to validate file size
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// Utility function to get file type description
export function getFileTypeDescription(fileName: string): string {
  const extension = getFileExtension(fileName);
  const format = SUPPORTED_FORMATS.find(f => f.extension === extension);
  return format?.description || 'Unknown file type';
}
