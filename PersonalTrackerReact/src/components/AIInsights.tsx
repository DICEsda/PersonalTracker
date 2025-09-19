import React from 'react';
import { motion } from 'framer-motion';

interface AIInsight {
  category: string;
  insight: string;
  recommendation: string;
  confidence: number;
}

interface AIInsightsProps {
  insights?: AIInsight[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights = [] }) => {
  const defaultInsights: AIInsight[] = [
    {
      category: 'Mood',
      insight: 'Your mood has been consistently positive this week',
      recommendation: 'Keep up the great work with your mindfulness practices',
      confidence: 85
    },
    {
      category: 'Activity',
      insight: 'Your step count increased by 15% compared to last week',
      recommendation: 'Consider adding strength training to complement your cardio',
      confidence: 92
    },
    {
      category: 'Habits',
      insight: 'You\'ve maintained a 7-day prayer streak',
      recommendation: 'This consistency is building strong spiritual habits',
      confidence: 100
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-700"
    >
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">🤖</div>
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100">
          AI Insights
        </h3>
      </div>

      <div className="space-y-4">
        {displayInsights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-stone-50 dark:bg-stone-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {insight.category}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {insight.confidence}% confidence
              </span>
            </div>
            
            <p className="text-sm text-stone-700 dark:text-stone-300 mb-2">
              {insight.insight}
            </p>
            
            <p className="text-xs text-stone-600 dark:text-stone-400 italic">
              💡 {insight.recommendation}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
          View Weekly Summary
        </button>
      </div>
    </motion.div>
  );
};