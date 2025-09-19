import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIInsightsWidget from './AIInsightsWidget';
import { FinancialWidget } from './FinancialWidget';

type Metric = {
  key: string;
  label: string;
  value: number | string;
  color: string;
  data: { date: string; value: number }[];
  category: 'fitness' | 'mindfulness' | 'financial';
  icon?: string;
};

type DashboardGridProps = {
  metrics: Metric[];
  onMetricClick: (metric: Metric) => void;
  financialData?: {
    balance: number;
    income: number;
    expenses: number;
    savings: number;
    lastUpdated: string;
    investments?: number;
    debt?: number;
    emergencyFund?: number;
    monthlyBudget?: number;
    savingsRate?: number;
    debtToIncomeRatio?: number;
  };
};

export const DashboardGrid: FC<DashboardGridProps> = ({ 
  metrics, 
  onMetricClick, 
  financialData 
}) => (
  <AnimatePresence>
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* AI Insights - Top Priority Horizontal Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <AIInsightsWidget className="min-h-[200px]" />
      </motion.div>

      {/* Financial Overview - Single full-width card */}
      {financialData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <FinancialWidget data={financialData} />
        </motion.div>
      )}

      {/* Additional Widgets Grid */}
      {metrics.filter(m => m.category !== 'financial').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {metrics
            .filter(m => m.category !== 'financial')
            .map((metric, idx) => (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + idx * 0.05 }}
                className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => onMetricClick(metric)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{metric.icon || '📊'}</span>
                    <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 capitalize">
                      {metric.label}
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 capitalize">
                    {metric.category}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
                  {metric.value}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  Tap to view details
                </div>
              </motion.div>
            ))}
        </motion.div>
      )}
    </div>
  </AnimatePresence>
); 