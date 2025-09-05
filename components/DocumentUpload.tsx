'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: () => void;
}

export default function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setTitle(file.name);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!text.trim() || !title.trim()) {
      setUploadStatus({
        type: 'error',
        message: 'Please provide both title and content',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          title: title.trim(),
          source: 'upload',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus({
          type: 'success',
          message: `Document uploaded successfully! Processed ${data.document.chunks.length} chunks in ${data.document.processingTime}ms`,
        });
        setText('');
        setTitle('');
        onUpload();
      } else {
        setUploadStatus({
          type: 'error',
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to upload document',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearForm = () => {
    setText('');
    setTitle('');
    setUploadStatus({ type: null, message: '' });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2" />
        Upload Document
      </h2>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary-600">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop a text file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports .txt and .md files
            </p>
          </div>
        )}
      </div>

      {/* Manual Input */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title..."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your document content here..."
            rows={8}
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus.type && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            uploadStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {uploadStatus.message}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleUpload}
          disabled={isUploading || !text.trim() || !title.trim()}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
        <button
          onClick={clearForm}
          className="btn-secondary"
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
