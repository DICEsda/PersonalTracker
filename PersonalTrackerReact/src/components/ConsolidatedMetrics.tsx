import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

interface ConsolidatedMetricsProps {
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, subtitle }) => (
  <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      {trend && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend.isPositive ? '↗️' : '↘️'} {Math.abs(trend.value)}%
        </span>
      )}
    </div>
  <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">{title}</h4>
  <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{value}</p>
  {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{subtitle}</p>}
  </div>
);

const ConsolidatedMetrics: React.FC<ConsolidatedMetricsProps> = ({ className = '' }) => {
  // These would typically come from props or API calls
  const metrics = [
    {
      title: 'Monthly Savings',
      value: '$1,250',
      icon: '💰',
      trend: { value: 12.5, isPositive: true },
      subtitle: 'vs last month'
    },
    {
      title: 'Active Goals',
      value: '4',
      icon: '🎯',
      subtitle: '2 on track'
    },
    {
      title: 'Transactions',
      value: '127',
      icon: '💳',
      trend: { value: 8.3, isPositive: false },
      subtitle: 'this month'
    },
    {
      title: 'Account Balance',
      value: '$15,430',
      icon: '🏦',
      trend: { value: 3.2, isPositive: true },
      subtitle: 'total across accounts'
    },
    {
      title: 'Budget Usage',
      value: '68%',
      icon: '📊',
      subtitle: 'of monthly budget'
    },
    {
      title: 'Investment Growth',
      value: '+$340',
      icon: '📈',
      trend: { value: 2.1, isPositive: true },
      subtitle: 'this quarter'
    }
  ];

  return (
  <div className={`bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📋</span>
  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Financial Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            subtitle={metric.subtitle}
          />
        ))}
      </div>
    </div>
  );
};

export default ConsolidatedMetrics;