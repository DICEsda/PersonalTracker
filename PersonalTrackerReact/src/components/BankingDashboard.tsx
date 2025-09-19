import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bankingService, type BankConnection, type BankAccount } from '../services/bankingService';

interface BankingDashboardProps {
  className?: string;
}

export const BankingDashboard: React.FC<BankingDashboardProps> = ({ className = '' }) => {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [connectionsData, accountsData, balanceData] = await Promise.all([
        bankingService.getConnections(),
        bankingService.getAccounts(),
        bankingService.getTotalBalance()
      ]);

      setConnections(connectionsData);
      setAccounts(accountsData);
      setTotalBalance(balanceData.totalBalance);
    } catch (err) {
      console.error('Failed to load banking data:', err);
      setError('Failed to load banking data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBank = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const result = await bankingService.openBankConnection();
      
      if (result.success) {
        // Reload data after successful connection
        await loadBankingData();
      }
    } catch (err) {
      console.error('Failed to connect bank:', err);
      setError('Failed to connect bank. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncData = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      
      const success = await bankingService.syncBankData();
      
      if (success) {
        await loadBankingData();
      } else {
        setError('Failed to sync bank data. Please try again.');
      }
    } catch (err) {
      console.error('Failed to sync bank data:', err);
      setError('Failed to sync bank data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectBank = async (connectionId: number) => {
    if (!confirm('Are you sure you want to disconnect this bank? This will remove all associated accounts and stop transaction syncing.')) {
      return;
    }

    try {
      const success = await bankingService.disconnectBank(connectionId);
      
      if (success) {
        await loadBankingData();
      } else {
        setError('Failed to disconnect bank. Please try again.');
      }
    } catch (err) {
      console.error('Failed to disconnect bank:', err);
      setError('Failed to disconnect bank. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'inactive':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'DKK') => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-stone-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-stone-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 rounded flex items-center justify-center">
              <div className="w-2 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-xs"></div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Banking
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {connections.length} connected bank{connections.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncData}
            disabled={isSyncing}
            className="p-2 text-stone-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 
                     hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Sync bank data"
          >
            <div className={`w-4 h-4 border-2 border-current rounded-full border-t-transparent ${isSyncing ? 'animate-spin' : ''}`}></div>
          </button>
          <button
            onClick={handleConnectBank}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="w-4 h-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-0.5 bg-current"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-3 bg-current"></div>
              </div>
            </div>
            {isConnecting ? 'Connecting...' : 'Connect Bank'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 rounded-full flex items-center justify-center">
                <div className="w-0.5 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-red-600 dark:bg-red-400 rounded-full mt-0.5"></div>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Balance */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">Total Bank Balance</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Bank Connections */}
      {connections.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-stone-400 dark:border-stone-600 rounded-lg flex items-center justify-center">
            <div className="w-8 h-6 border border-stone-400 dark:border-stone-600 rounded-sm flex items-center justify-center">
              <div className="w-4 h-3 bg-stone-400 dark:bg-stone-600 rounded-xs opacity-50"></div>
            </div>
          </div>
          <h4 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
            No banks connected
          </h4>
          <p className="text-stone-600 dark:text-stone-400 mb-4">
            Connect your bank accounts to automatically track transactions and balances
          </p>
          <button
            onClick={handleConnectBank}
            disabled={isConnecting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Your First Bank'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-stone-200 dark:border-stone-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-100 dark:bg-stone-700 rounded-lg">
                    <div className="w-5 h-3 border border-stone-600 dark:border-stone-400 rounded-sm flex items-center justify-center mr-2">
                      <div className="w-2 h-1 bg-stone-600 dark:bg-stone-400 rounded-xs opacity-70"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900 dark:text-stone-100">
                      {connection.bankName}
                    </h4>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {connection.accountCount} account{connection.accountCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(connection.status)}`}>
                    {connection.status}
                  </span>
                  <button
                    onClick={() => handleDisconnectBank(connection.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                    title="Disconnect bank"
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
                </div>
              </div>
              
              <div className="text-xs text-stone-500 dark:text-stone-500 space-y-1">
                <p>Connected: {formatDate(connection.createdAt)}</p>
                {connection.lastSyncAt && (
                  <p>Last sync: {formatDate(connection.lastSyncAt)}</p>
                )}
                {connection.consentExpiresAt && (
                  <p>Consent expires: {formatDate(connection.consentExpiresAt)}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bank Accounts */}
      {accounts.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-stone-900 dark:text-stone-100 mb-3">
            Connected Accounts
          </h4>
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {account.accountName}
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {account.bankName} • {account.accountType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  {account.availableBalance && account.availableBalance !== account.balance && (
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Available: {formatCurrency(account.availableBalance, account.currency)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};