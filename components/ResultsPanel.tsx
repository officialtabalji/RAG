'use client';

import { useState } from 'react';
import { MessageSquare, Clock, DollarSign, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface Citation {
  id: number;
  source: string;
  title: string;
  section?: string;
  text: string;
  score: number;
}

interface RetrievedDoc {
  id: string;
  text: string;
  metadata: {
    source: string;
    title: string;
    section?: string;
    position: number;
    chunkIndex: number;
    totalChunks: number;
  };
  score: number;
  rerankScore?: number;
}

interface QueryResults {
  answer: string;
  citations: Citation[];
  retrievedDocs: RetrievedDoc[];
  totalTime: number;
  tokensUsed: number;
  estimatedCost: number;
}

interface ResultsPanelProps {
  results: QueryResults;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    citations: false,
    retrievedDocs: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatCost = (cost: number) => {
    if (cost < 0.001) return `$${(cost * 1000).toFixed(3)}m`;
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MessageSquare className="mr-2" />
        Answer
      </h2>

      {/* Answer */}
      <div className="prose max-w-none mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: results.answer.replace(/\[(\d+)\]/g, '<span class="bg-primary-100 text-primary-800 px-1 rounded text-sm font-medium">[$1]</span>')
            }}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <div className="text-sm text-blue-600 font-medium">Response Time</div>
            <div className="text-lg font-semibold text-blue-800">{formatTime(results.totalTime)}</div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 flex items-center">
          <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <div className="text-sm text-green-600 font-medium">Tokens Used</div>
            <div className="text-lg font-semibold text-green-800">{results.tokensUsed.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 flex items-center">
          <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
          <div>
            <div className="text-sm text-purple-600 font-medium">Estimated Cost</div>
            <div className="text-lg font-semibold text-purple-800">{formatCost(results.estimatedCost)}</div>
          </div>
        </div>
      </div>

      {/* Citations */}
      {results.citations.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('citations')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900 mb-2"
          >
            <span>Citations ({results.citations.length})</span>
            {expandedSections.citations ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.citations && (
            <div className="space-y-3">
              {results.citations.map((citation) => (
                <div key={citation.id} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium mr-2">
                        [{citation.id}]
                      </span>
                      <span className="font-medium text-gray-800">{citation.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Score: {citation.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {citation.text}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Source: {citation.source}
                    {citation.section && ` • Section: ${citation.section}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Retrieved Documents */}
      {results.retrievedDocs.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('retrievedDocs')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-700 hover:text-gray-900 mb-2"
          >
            <span>Retrieved Documents ({results.retrievedDocs.length})</span>
            {expandedSections.retrievedDocs ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.retrievedDocs && (
            <div className="space-y-3">
              {results.retrievedDocs.map((doc, index) => (
                <div key={doc.id} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm font-medium mr-2">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{doc.metadata.title}</span>
                    </div>
                    <div className="text-xs text-gray-500 space-x-2">
                      <span>Score: {doc.score.toFixed(3)}</span>
                      {doc.rerankScore && (
                        <span>Rerank: {doc.rerankScore.toFixed(3)}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {doc.text}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Chunk {doc.metadata.chunkIndex + 1} of {doc.metadata.totalChunks}
                    {doc.metadata.section && ` • Section: ${doc.metadata.section}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
