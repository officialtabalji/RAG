'use client';

import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Database, FileText, Hash } from 'lucide-react';

interface Stats {
  totalDocuments: number;
  totalChunks: number;
  totalTokens: number;
}

interface StatsPanelProps {
  stats: Stats | null;
  setStats: (stats: Stats | null) => void;
}

export default function StatsPanel({ stats, setStats }: StatsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!stats) {
      fetchStats();
    }
  }, [stats]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart3 className="mr-2" />
          Statistics
        </h2>
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          title="Refresh stats"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && !stats ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total Documents */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Documents</div>
                <div className="text-2xl font-bold text-blue-800">
                  {stats?.totalDocuments || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Total Chunks */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-sm text-green-600 font-medium">Total Chunks</div>
                <div className="text-2xl font-bold text-green-800">
                  {formatNumber(stats?.totalChunks || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Hash className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-sm text-purple-600 font-medium">Total Tokens</div>
                <div className="text-2xl font-bold text-purple-800">
                  {formatNumber(stats?.totalTokens || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="w-full btn-secondary text-sm disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
        </div>
      </div>
    </div>
  );
}
