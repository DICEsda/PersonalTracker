import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type Metric = {
  key: string;
  label: string;
  value: number | string;
  color: string;
  data: { date: string; value: number }[];
};

type MetricGraphModalProps = {
  metric: Metric | null;
  onClose: () => void;
};

export const MetricGraphModal: FC<MetricGraphModalProps> = ({ metric, onClose }) => (
  <AnimatePresence>
    {metric && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl w-full max-w-lg relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-orange-500 text-2xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <div className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{metric.label} - Last 7 Days</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metric.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
); 