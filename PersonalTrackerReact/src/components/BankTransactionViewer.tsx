import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bankingService, type BankAccount } from '../services/bankingService';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  bankAccountId?: number;
  externalId?: string;
}

interface BankTransactionViewerProps {
  selectedAccountId?: number;
  onTransactionSelect?: (transaction: Transaction) => void;
}

export const BankTransactionViewer: React.FC<BankTransactionViewerProps> = ({
  selectedAccountId,
  onTransactionSelect
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(selectedAccountId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadBankAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions();
    }
  }, [selectedAccount, filterType, sortBy, sortOrder]);

  const loadBankAccounts = async () => {
    try {
      const accounts = await bankingService.getAccounts();
      setBankAccounts(accounts);
      if (!selectedAccount && accounts.length > 0) {
        setSelectedAccount(accounts[0].id);
      }
    } catch (err) {
      setError('Failed to load bank accounts');
    }
  };

  const loadTransactions = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      // In a real implementation, you'd have an endpoint to get transactions by account
      // For now, we'll simulate this with a mock API call
      const response = await fetch(`/api/banking/accounts/${selectedAccount}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      let data = await response.json();
      
      // Apply filters
      if (filterType !== 'all') {
        data = data.filter((t: Transaction) => t.type === filterType);
      }
      
      // Apply sorting
      data.sort((a: Transaction, b: Transaction) => {
        let aValue = sortBy === 'date' ? new Date(a.date).getTime() : a.amount;
        let bValue = sortBy === 'date' ? new Date(b.date).getTime() : b.amount;
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      // Fallback to mock data for demo
      setTransactions(generateMockTransactions());
    } finally {
      setLoading(false);
    }
  };

  const generateMockTransactions = (): Transaction[] => {
    const mockTransactions: Transaction[] = [
      {
        id: 1,
        amount: -45.67,
        description: "Supermarket Purchase",
        category: "Groceries",
        date: "2024-01-15T10:30:00Z",
        type: "expense",
        bankAccountId: selectedAccount!,
        externalId: "tx_123456"
      },
      {
        id: 2,
        amount: 2500.00,
        description: "Salary Payment",
        category: "Income",
        date: "2024-01-01T09:00:00Z",
        type: "income",
        bankAccountId: selectedAccount!,
        externalId: "tx_789012"
      },
      {
        id: 3,
        amount: -12.50,
        description: "Coffee Shop",
        category: "Dining",
        date: "2024-01-14T14:15:00Z",
        type: "expense",
        bankAccountId: selectedAccount!,
        externalId: "tx_345678"
      },
      {
        id: 4,
        amount: -89.99,
        description: "Gas Station",
        category: "Transportation",
        date: "2024-01-13T18:45:00Z",
        type: "expense",
        bankAccountId: selectedAccount!,
        externalId: "tx_901234"
      },
      {
        id: 5,
        amount: 150.00,
        description: "Freelance Work",
        category: "Income",
        date: "2024-01-10T16:20:00Z",
        type: "income",
        bankAccountId: selectedAccount!,
        externalId: "tx_567890"
      }
    ];

    // Apply filters
    let filtered = mockTransactions;
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = sortBy === 'date' ? new Date(a.date).getTime() : a.amount;
      let bValue = sortBy === 'date' ? new Date(b.date).getTime() : b.amount;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (category: string): React.ReactElement => {
    const iconMap: Record<string, React.ReactElement> = {
      'Groceries': (
        <div className="w-4 h-4 border border-current rounded flex items-center justify-center">
          <div className="w-2 h-2 bg-current rounded-full opacity-70"></div>
        </div>
      ),
      'Dining': (
        <div className="w-4 h-4 border border-current rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      ),
      'Transportation': (
        <div className="w-4 h-4 border border-current rounded flex items-center justify-center">
          <div className="w-2 h-1 bg-current rounded-full"></div>
        </div>
      ),
      'Income': (
        <div className="w-4 h-4 flex items-center justify-center">
          <div className="w-2 h-2 border border-current transform rotate-45"></div>
        </div>
      ),
      'Shopping': (
        <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-current rounded-xs"></div>
        </div>
      ),
      'Utilities': (
        <div className="w-4 h-4 flex items-center justify-center">
          <div className="w-0.5 h-3 bg-current rounded-full"></div>
        </div>
      ),
      'Entertainment': (
        <div className="w-4 h-4 border border-current rounded flex items-center justify-center">
          <div className="w-2 h-1 bg-current rounded-full"></div>
        </div>
      ),
      'Healthcare': (
        <div className="w-4 h-4 flex items-center justify-center">
          <div className="w-3 h-0.5 bg-current"></div>
          <div className="w-0.5 h-3 bg-current absolute"></div>
        </div>
      ),
      'Education': (
        <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-current opacity-50"></div>
        </div>
      )
    };
    return iconMap[category] || (
      <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center">
        <div className="w-2 h-1 bg-current rounded-xs opacity-70"></div>
      </div>
    );
  };

  const selectedAccountData = bankAccounts.find(acc => acc.id === selectedAccount);

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 rounded">
            <div className="w-full h-full flex flex-col justify-end p-0.5">
              <div className="flex items-end space-x-0.5 h-full">
                <div className="w-0.5 h-1/3 bg-blue-600 dark:bg-blue-400"></div>
                <div className="w-0.5 h-2/3 bg-blue-600 dark:bg-blue-400"></div>
                <div className="w-0.5 h-full bg-blue-600 dark:bg-blue-400"></div>
              </div>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Bank Transactions
          </h2>
        </div>
        
        {bankAccounts.length > 1 && (
          <select
            value={selectedAccount || ''}
            onChange={(e) => setSelectedAccount(Number(e.target.value))}
            className="px-3 py-1 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 text-sm"
          >
            <option value="">Select Account</option>
            {bankAccounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.accountName} - {formatAmount(account.balance)}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedAccountData && (
        <div className="mb-4 p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-stone-900 dark:text-stone-100">
                {selectedAccountData.accountName}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {selectedAccountData.iban || selectedAccountData.accountId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {formatAmount(selectedAccountData.balance)}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-500">
                Current Balance
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-stone-600 dark:text-stone-400">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="px-2 py-1 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 text-sm"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-stone-600 dark:text-stone-400">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="px-2 py-1 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 text-sm"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>
        
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-2 py-1 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded text-sm hover:bg-stone-200 dark:hover:bg-stone-600"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 rounded-full flex items-center justify-center">
                <div className="w-0.5 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-red-600 dark:bg-red-400 rounded-full mt-0.5"></div>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <div className="w-4 h-4 relative">
                <div className="absolute inset-0 flex items-center justify-center transform rotate-45">
                  <div className="w-3 h-0.5 bg-current"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                  <div className="w-3 h-0.5 bg-current"></div>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
          <span className="ml-2 text-stone-600 dark:text-stone-400">Loading transactions...</span>
        </div>
      )}

      {/* Transactions List */}
      {!loading && selectedAccount && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-20 mx-auto mb-4 border-2 border-stone-400 dark:border-stone-600 rounded flex flex-col">
                <div className="flex-1 p-2">
                  <div className="w-full h-1 bg-stone-400 dark:bg-stone-600 rounded mb-1 opacity-30"></div>
                  <div className="w-3/4 h-1 bg-stone-400 dark:bg-stone-600 rounded mb-1 opacity-30"></div>
                  <div className="w-1/2 h-1 bg-stone-400 dark:bg-stone-600 rounded opacity-30"></div>
                </div>
              </div>
              <p className="text-stone-600 dark:text-stone-400">No transactions found</p>
            </div>
          ) : (
            <AnimatePresence>
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 cursor-pointer transition-colors"
                  onClick={() => onTransactionSelect?.(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-stone-600 dark:text-stone-400">{getTransactionIcon(transaction.category)}</div>
                      <div>
                        <h4 className="font-medium text-stone-900 dark:text-stone-100">
                          {transaction.description}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-500">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.externalId && (
                            <>
                              <span>•</span>
                              <span>ID: {transaction.externalId.slice(-6)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedAccount && bankAccounts.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-stone-400 dark:border-stone-600 rounded-lg flex items-center justify-center">
            <div className="w-8 h-6 border border-stone-400 dark:border-stone-600 rounded-sm flex items-center justify-center">
              <div className="w-4 h-3 bg-stone-400 dark:bg-stone-600 rounded-xs opacity-50"></div>
            </div>
          </div>
          <p className="text-stone-600 dark:text-stone-400 mb-2">No bank accounts connected</p>
          <p className="text-sm text-stone-500 dark:text-stone-500">
            Connect a bank account to view transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default BankTransactionViewer;