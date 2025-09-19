import React, { useState, useEffect } from 'react';

interface AIInsight {
  id: number;
  content: string;
  type: string;
  priority: number;
  generatedAt: string;
  userId?: string;
}

interface AIInsightsWidgetProps {
  className?: string;
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ className = '' }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/aiinsights');
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('http://localhost:5000/api/aiinsights/generate', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }
      await fetchInsights();
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate new insights');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getPriorityStyles = (priority: number) => {
    switch (priority) {
      case 3: return 'border-l-4 border-red-500 bg-red-50 text-red-800';
      case 2: return 'border-l-4 border-orange-500 bg-orange-50 text-orange-800';
      case 1: return 'border-l-4 border-blue-500 bg-blue-50 text-blue-800';
  default: return 'border-l-4 border-stone-500 bg-stone-50 text-stone-800';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High Priority';
      case 2: return 'Medium Priority';
      case 1: return 'Low Priority';
      default: return 'Info';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'spending':
      case 'expense':
        return '💰';
      case 'trend':
      case 'pattern':
        return '📈';
      case 'alert':
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (loading) {
    return (
  <div className={`bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">AI Financial Insights</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-stone-600 dark:text-stone-300">Loading insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
  <div className={`bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">AI Financial Insights</h3>
          </div>
          <button
            onClick={generateNewInsights}
            disabled={refreshing}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? '🔄' : '🔄'} Generate
          </button>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  const topInsight = insights.find(insight => insight.priority === 3) || insights[0];
  const otherInsights = insights.filter(insight => insight !== topInsight).slice(0, 3);

  return (
  <div className={`bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">AI Financial Insights</h3>
        </div>
        <button
          onClick={generateNewInsights}
          disabled={refreshing}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {/* Main Insight - Horizontal Card */}
        {topInsight && (
          <div className={`p-5 rounded-lg ${getPriorityStyles(topInsight.priority)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-2xl">
                {getTypeIcon(topInsight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/70 dark:bg-stone-700/70">
                    {getPriorityLabel(topInsight.priority)}
                  </span>
                  <span className="text-xs font-medium capitalize bg-white/50 dark:bg-stone-700/50 px-2 py-1 rounded">
                    {topInsight.type}
                  </span>
                  <span className="text-xs text-stone-600 dark:text-stone-300">
                    {new Date(topInsight.generatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium">{topInsight.content}</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Insights - Grid Layout */}
        {otherInsights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherInsights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg ${getPriorityStyles(insight.priority)}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getTypeIcon(insight.type)}</span>
                  <span className="text-xs font-medium capitalize">
                    {insight.type}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {insight.content}
                </p>
                <div className="text-xs text-stone-600 dark:text-stone-300">
                  {new Date(insight.generatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Insights State */}
        {insights.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-stone-500 dark:text-stone-400 mb-6">No insights available yet</p>
            <button
              onClick={generateNewInsights}
              disabled={refreshing}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🤖</span>
              Generate Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsWidget;