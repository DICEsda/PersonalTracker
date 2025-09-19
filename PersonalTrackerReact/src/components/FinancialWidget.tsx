import React from 'react';
import { motion } from 'framer-motion';

interface FinancialData {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  investments?: number;
  debt?: number;
  emergencyFund?: number;
  monthlyBudget?: number;
  savingsRate?: number;
  debtToIncomeRatio?: number;
  lastUpdated: string;
}

interface FinancialWidgetProps {
  data: FinancialData;
}

export const FinancialWidget: React.FC<FinancialWidgetProps> = ({ data }) => {
  // Calculate additional metrics
  const savingsRate = data.income > 0 ? (data.savings / data.income) * 100 : 0;
  const debtToIncomeRatio = data.income > 0 ? ((data.debt || 0) / data.income) * 100 : 0;
  const monthsOfEmergencyFund = data.expenses > 0 ? (data.emergencyFund || 0) / data.expenses : 0;
  const netCashFlow = data.income - data.expenses;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Financial Overview</h3>
        <div className="w-6 h-6 border-2 border-green-600 dark:border-green-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${data.balance.toLocaleString()}
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Balance</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Savings Rate</div>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="mb-4 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Monthly Cash Flow</span>
          <span className={`text-sm font-bold ${netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString()}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-stone-600 dark:text-stone-400">Income</span>
            <span className="text-green-600 dark:text-green-400">+${data.income.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600 dark:text-stone-400">Expenses</span>
            <span className="text-red-600 dark:text-red-400">-${data.expenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-stone-600 dark:text-stone-400">Savings</span>
            <span className="text-blue-600 dark:text-blue-400">${data.savings.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="space-y-2">
        {(data.investments || 0) > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-stone-600 dark:text-stone-400 text-sm">Investments</span>
            <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">
              ${(data.investments || 0).toLocaleString()}
            </span>
          </div>
        )}
        
        {(data.debt || 0) > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-stone-600 dark:text-stone-400 text-sm">Total Debt</span>
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
              ${(data.debt || 0).toLocaleString()}
            </span>
          </div>
        )}
        
        {(data.emergencyFund || 0) > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-stone-600 dark:text-stone-400 text-sm">Emergency Fund</span>
            <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
              ${(data.emergencyFund || 0).toLocaleString()} ({monthsOfEmergencyFund.toFixed(1)} months)
            </span>
          </div>
        )}
        
        {debtToIncomeRatio > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-stone-600 dark:text-stone-400 text-sm">Debt-to-Income</span>
            <span className={`text-sm font-medium ${debtToIncomeRatio > 30 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {debtToIncomeRatio.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="mt-4 flex gap-2">
        <div className={`h-2 flex-1 rounded-full ${savingsRate >= 20 ? 'bg-green-200 dark:bg-green-800' : savingsRate >= 10 ? 'bg-yellow-200 dark:bg-yellow-800' : 'bg-red-200 dark:bg-red-800'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(savingsRate / 20 * 100, 100)}%` }}
          ></div>
        </div>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          Savings Health
        </span>
      </div>
      
      <div className="pt-3 mt-3 border-t border-stone-200 dark:border-stone-700">
        <span className="text-xs text-stone-500 dark:text-stone-400">
          Last updated: {data.lastUpdated}
        </span>
      </div>
    </motion.div>
  );
};