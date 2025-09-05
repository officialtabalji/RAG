// Client-side utilities for document handling
// This file can be safely imported in browser components

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

// Function to read text files in the browser
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string || '');
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}
