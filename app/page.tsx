'use client';

import { useState } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import QueryInterface from '@/components/QueryInterface';
import ResultsPanel from '@/components/ResultsPanel';
import StatsPanel from '@/components/StatsPanel';

export default function Home() {
  const [queryResults, setQueryResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          RAG Application
        </h1>
        <p className="text-lg text-gray-600">
          Upload documents and ask questions with AI-powered retrieval
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload and Query */}
        <div className="lg:col-span-2 space-y-6">
          <DocumentUpload onUpload={() => setStats(null)} />
          <QueryInterface 
            onQuery={setQueryResults}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>

        {/* Right Column - Stats */}
        <div className="lg:col-span-1">
          <StatsPanel stats={stats} setStats={setStats} />
        </div>
      </div>

      {/* Results Panel */}
      {queryResults && (
        <div className="mt-8">
          <ResultsPanel results={queryResults} />
        </div>
      )}
    </div>
  );
}
