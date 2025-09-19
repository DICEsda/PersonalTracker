import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Types
export interface BankConnection {
  id: number;
  bankName: string;
  bankCode: string;
  status: string;
  accountCount: number;
  createdAt: string;
  lastSyncAt?: string;
  consentExpiresAt?: string;
}

export interface BankAccount {
  id: number;
  accountId: string;
  accountName: string;
  accountType: string;
  currency: string;
  balance: number;
  availableBalance?: number;
  iban?: string;
  bankName: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: number;
  amount: number;
  currency: string;
  description: string;
  merchantName?: string;
  category: string;
  transactionType: string;
  date: string;
  status: string;
  runningBalance?: number;
  bankAccount: {
    id: number;
    name: string;
    bankName: string;
  };
}

class BankingService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/banking`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Initiate bank connection
  async initiateConnection(): Promise<string> {
    const response = await this.api.post('/connect');
    return response.data.connectUrl;
  }

  // Handle connection callback
  async handleConnectionCallback(connectionId: string, status: string): Promise<any> {
    const response = await this.api.post('/callback', {
      connectionId,
      status,
    });
    return response.data;
  }

  // Get user's bank connections
  async getConnections(): Promise<BankConnection[]> {
    const response = await this.api.get('/connections');
    return response.data;
  }

  // Get user's bank accounts
  async getAccounts(): Promise<BankAccount[]> {
    const response = await this.api.get('/accounts');
    return response.data;
  }

  // Sync bank data
  async syncBankData(): Promise<boolean> {
    try {
      const response = await this.api.post('/sync');
      return response.data.success;
    } catch (error) {
      console.error('Failed to sync bank data:', error);
      return false;
    }
  }

  // Sync account transactions
  async syncAccountTransactions(accountId: number): Promise<boolean> {
    try {
      const response = await this.api.post(`/accounts/${accountId}/sync-transactions`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to sync account transactions:', error);
      return false;
    }
  }

  // Disconnect bank
  async disconnectBank(connectionId: number): Promise<boolean> {
    try {
      const response = await this.api.delete(`/connections/${connectionId}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to disconnect bank:', error);
      return false;
    }
  }

  // Get bank transactions
  async getTransactions(fromDate?: string, toDate?: string): Promise<BankTransaction[]> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const response = await this.api.get(`/transactions?${params}`);
    return response.data;
  }

  // Get total bank balance
  async getTotalBalance(): Promise<{ totalBalance: number; currency: string }> {
    const response = await this.api.get('/balance');
    return response.data;
  }

  // Open bank connection in popup
  openBankConnection(): Promise<{ success: boolean; connectionId?: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const connectUrl = await this.initiateConnection();
        
        const popup = window.open(
          connectUrl,
          'bank-connection',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for connection completion
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'bank-connection-complete') {
            window.removeEventListener('message', handleMessage);
            popup?.close();
            resolve({
              success: event.data.success,
              connectionId: event.data.connectionId
            });
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            resolve({ success: false });
          }
        }, 1000);

      } catch (error) {
        console.error('Failed to open bank connection:', error);
        reject(error);
      }
    });
  }
}

export const bankingService = new BankingService();