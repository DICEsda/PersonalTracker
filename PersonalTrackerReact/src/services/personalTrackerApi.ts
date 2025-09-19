import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5223/api';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface FinancialData {
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

export interface MoodEntry {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

export interface PrayerEntry {
  date: string;
  completed: boolean;
  prayers: string[];
  note?: string;
}

export interface FitnessData {
  steps: number;
  calories: number;
  activeMinutes: number;
  workouts: number;
  date: string;
}

class PersonalTrackerApi {
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('access_token');
    if (this.accessToken) {
      this.setAuthHeader();
    }
  }

  private setAuthHeader() {
    if (this.accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('access_token', token);
    this.setAuthHeader();
  }

  clearAccessToken() {
    this.accessToken = null;
    localStorage.removeItem('access_token');
    delete axios.defaults.headers.common['Authorization'];
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Authentication
  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  }

  // Financial Data
  async getFinancialData(): Promise<FinancialData> {
    const response = await axios.get(`${API_BASE_URL}/financial`);
    return response.data;
  }

  async updateFinancialData(data: FinancialData): Promise<FinancialData> {
    const response = await axios.put(`${API_BASE_URL}/financial`, data);
    return response.data;
  }

  // Mood Tracking
  async getMoodEntries(): Promise<MoodEntry[]> {
    const response = await axios.get(`${API_BASE_URL}/mood`);
    return response.data;
  }

  async addMoodEntry(entry: MoodEntry): Promise<MoodEntry> {
    const response = await axios.post(`${API_BASE_URL}/mood`, entry);
    return response.data;
  }

  // Journal
  async getJournalEntries(): Promise<JournalEntry[]> {
    const response = await axios.get(`${API_BASE_URL}/journal`);
    return response.data;
  }

  async addJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const response = await axios.post(`${API_BASE_URL}/journal`, entry);
    return response.data;
  }

  async updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const response = await axios.put(`${API_BASE_URL}/journal/${id}`, entry);
    return response.data;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/journal/${id}`);
  }

  // Prayer Tracking
  async getPrayerEntries(): Promise<PrayerEntry[]> {
    const response = await axios.get(`${API_BASE_URL}/prayer`);
    return response.data;
  }

  async addPrayerEntry(entry: PrayerEntry): Promise<PrayerEntry> {
    const response = await axios.post(`${API_BASE_URL}/prayer`, entry);
    return response.data;
  }

  // Fitness Data
  async getFitnessData(): Promise<FitnessData[]> {
    const response = await axios.get(`${API_BASE_URL}/fitness`);
    return response.data;
  }

  async addFitnessData(data: FitnessData): Promise<FitnessData> {
    const response = await axios.post(`${API_BASE_URL}/fitness`, data);
    return response.data;
  }

  // AI Insights
  async getWeeklySummary(): Promise<{ summary: string; insights: string[] }> {
    const response = await axios.get(`${API_BASE_URL}/ai/weekly-summary`);
    return response.data;
  }

  async getMoodInsights(): Promise<{ insights: string[]; patterns: string[] }> {
    const response = await axios.get(`${API_BASE_URL}/ai/mood-insights`);
    return response.data;
  }
}

export const personalTrackerApi = new PersonalTrackerApi();