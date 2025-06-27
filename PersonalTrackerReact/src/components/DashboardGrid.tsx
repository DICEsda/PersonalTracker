import { FC } from 'react';
import { motion } from 'framer-motion';
import { MetricCard } from './MetricCard';

type Metric = {
  key: string;
  label: string;
  value: number | string;
  color: string;
  data: { date: string; value: number }[];
};

type DashboardGridProps = {
  metrics: Metric[];
  onMetricClick: (metric: Metric) => void;
};

export const DashboardGrid: FC<DashboardGridProps> = ({ metrics, onMetricClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
    {metrics.map((metric) => (
      <motion.div
        key={metric.key}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="flex"
      >
        <MetricCard metric={metric} onClick={() => onMetricClick(metric)} />
      </motion.div>
    ))}
  </div>
); 