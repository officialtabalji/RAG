'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface QueryInterfaceProps {
  onQuery: (results: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function QueryInterface({ onQuery, isLoading, setIsLoading }: QueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState({
    topK: 20,
    rerankTopK: 5,
    useReranking: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          options,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onQuery(data);
      } else {
        console.error('Query failed:', data.error);
      }
    } catch (error) {
      console.error('Query error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Search className="mr-2" />
        Ask Questions
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Question
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your uploaded documents..."
            rows={3}
            className="input-field resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Retrieval Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Initial Retrieval (topK)
              </label>
              <input
                type="number"
                value={options.topK}
                onChange={(e) => setOptions(prev => ({ ...prev, topK: parseInt(e.target.value) || 20 }))}
                min="1"
                max="100"
                className="input-field text-sm"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Final Results (rerankTopK)
              </label>
              <input
                type="number"
                value={options.rerankTopK}
                onChange={(e) => setOptions(prev => ({ ...prev, rerankTopK: parseInt(e.target.value) || 5 }))}
                min="1"
                max="20"
                className="input-field text-sm"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useReranking"
                checked={options.useReranking}
                onChange={(e) => setOptions(prev => ({ ...prev, useReranking: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              <label htmlFor="useReranking" className="text-xs text-gray-600">
                Use Reranking
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Ask Question
            </>
          )}
        </button>
      </form>
    </div>
  );
}
