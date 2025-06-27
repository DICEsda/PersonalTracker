import type { FC } from 'react';

type Metric = {
  key: string;
  label: string;
  value: number | string;
  color: string;
  data: { date: string; value: number }[];
};

type MetricCardProps = {
  metric: Metric;
  onClick: () => void;
};

export const MetricCard: FC<MetricCardProps> = ({ metric, onClick }) => (
  <div
    className={`rounded-xl shadow-lg p-6 cursor-pointer text-white ${metric.color} flex flex-col items-center w-full`}
    onClick={onClick}
  >
    <div className="text-lg font-semibold mb-2">{metric.label}</div>
    <div className="text-3xl font-bold mb-1">{metric.value}</div>
    <div className="text-xs opacity-70">Last 7 days</div>
  </div>
); 