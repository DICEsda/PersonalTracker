import { useState, useEffect } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import { Navbar } from './components/Navbar';
import { DashboardGrid } from './components/DashboardGrid';
import { MetricGraphModal } from './components/MetricGraphModal';
import { GoogleCalendar } from './components/GoogleCalendar';
import { AuthCallback } from './components/AuthCallback';
import { PWAInstall } from './components/PWAInstall';
import { AuthProvider, useAuth, LoginScreen } from './components/Auth';
import { FinancialWidget } from './components/FinancialWidget';
import { MoodTracker } from './components/MoodTracker';
import { JournalWidget } from './components/JournalWidget';
import { PrayerTracker } from './components/PrayerTracker';
import { BankingDashboard } from './components/BankingDashboard';
import { BankTransactionViewer } from './components/BankTransactionViewer';

// Services
import { personalTrackerApi } from './services/personalTrackerApi';
import type { 
  FinancialData, 
  MoodEntry, 
  JournalEntry, 
  PrayerEntry 
} from './services/personalTrackerApi';

// Types
export type Metric = {
  key: string;
  label: string;
  value: number | string;
  color: string;
  data: { date: string; value: number }[];
  category: 'fitness' | 'mindfulness' | 'financial';
  icon?: string;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/mindfulness" element={<Mindfulness />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/calendar" element={<GoogleCalendar />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAInstall />
    </div>
  );
}

// Dashboard Component
function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData>({
    balance: 50000,
    income: 5000,
    expenses: 3500,
    savings: 1500,
    investments: 15000,
    debt: 2500,
    emergencyFund: 10000,
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [prayerEntries, setPrayerEntries] = useState<PrayerEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (personalTrackerApi.isAuthenticated()) {
        const [financial, mood, journal, prayer] = await Promise.all([
          personalTrackerApi.getFinancialData().catch(() => financialData),
          personalTrackerApi.getMoodEntries().catch(() => []),
          personalTrackerApi.getJournalEntries().catch(() => []),
          personalTrackerApi.getPrayerEntries().catch(() => [])
        ]);
        
        setFinancialData(financial);
        setMoodEntries(mood);
        setJournalEntries(journal);
        setPrayerEntries(prayer);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleMoodEntry = async (entry: MoodEntry) => {
    try {
      const newEntry = await personalTrackerApi.addMoodEntry(entry);
      setMoodEntries(prev => [newEntry, ...prev.filter(e => e.date !== entry.date)]);
    } catch (error) {
      console.error('Failed to add mood entry:', error);
      setMoodEntries(prev => [entry, ...prev.filter(e => e.date !== entry.date)]);
    }
  };

  const handleJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    try {
      const newEntry = await personalTrackerApi.addJournalEntry(entry);
      setJournalEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Failed to add journal entry:', error);
      const localEntry: JournalEntry = { ...entry, id: Date.now().toString() };
      setJournalEntries(prev => [localEntry, ...prev]);
    }
  };

  const handlePrayerEntry = async (entry: PrayerEntry) => {
    try {
      const newEntry = await personalTrackerApi.addPrayerEntry(entry);
      setPrayerEntries(prev => [newEntry, ...prev.filter(e => e.date !== entry.date)]);
    } catch (error) {
      console.error('Failed to add prayer entry:', error);
      setPrayerEntries(prev => [entry, ...prev.filter(e => e.date !== entry.date)]);
    }
  };

  // Sample fitness metrics (would come from API in real implementation)
  const fitnessMetrics: Metric[] = [
    {
      key: 'steps',
      label: 'Daily Steps',
      value: 10234,
      color: 'bg-orange-500',
      category: 'fitness',
      icon: '👟',
      data: [
        { date: 'Mon', value: 8000 },
        { date: 'Tue', value: 9500 },
        { date: 'Wed', value: 12000 },
        { date: 'Thu', value: 11000 },
        { date: 'Fri', value: 10234 },
        { date: 'Sat', value: 9000 },
        { date: 'Sun', value: 10000 },
      ],
    },
    {
      key: 'calories',
      label: 'Calories Burned',
      value: 2200,
      color: 'bg-red-500',
      category: 'fitness',
      icon: '🔥',
      data: [
        { date: 'Mon', value: 2100 },
        { date: 'Tue', value: 2000 },
        { date: 'Wed', value: 2300 },
        { date: 'Thu', value: 2250 },
        { date: 'Fri', value: 2200 },
        { date: 'Sat', value: 2150 },
        { date: 'Sun', value: 2100 },
      ],
    }
  ];

  const currentStreak = prayerEntries.reduce((streak, entry, index) => {
    if (index === 0 && !entry.completed) return 0;
    if (entry.completed) return streak + 1;
    return streak;
  }, 0);

  const averageMood = moodEntries.length > 0 
    ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length)
    : 3;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          Personal Dashboard
        </h1>
        <p className="text-xl text-stone-600 dark:text-stone-300">
          Your wellness journey at a glance
        </p>
      </motion.div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-lg border border-stone-200 dark:border-stone-700"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${financialData.balance.toLocaleString()}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Balance</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-lg border border-stone-200 dark:border-stone-700"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {currentStreak}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Prayer Streak</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-lg border border-stone-200 dark:border-stone-700"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {averageMood}/5
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Avg Mood</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-stone-800 rounded-lg p-4 shadow-lg border border-stone-200 dark:border-stone-700"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {journalEntries.length}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Journal Entries</div>
          </div>
        </motion.div>
      </div>

      {/* New AI-Driven Dashboard Layout */}
      <DashboardGrid 
        metrics={[
          {
            key: 'mood',
            label: 'Average Mood',
            value: `${averageMood}/5`,
            color: 'bg-blue-500',
            category: 'mindfulness',
            icon: '😊',
            data: moodEntries.slice(0, 7).map((entry, index) => ({
              date: `Day ${index + 1}`,
              value: entry.mood
            }))
          },
          {
            key: 'prayer_streak',
            label: 'Prayer Streak',
            value: `${currentStreak} days`,
            color: 'bg-purple-500',
            category: 'mindfulness',
            icon: '🤲',
            data: prayerEntries.slice(0, 7).map((entry, index) => ({
              date: `Day ${index + 1}`,
              value: entry.completed ? 1 : 0
            }))
          },
          {
            key: 'journal_entries',
            label: 'Journal Entries',
            value: journalEntries.length,
            color: 'bg-green-500',
            category: 'mindfulness',
            icon: '📝',
            data: Array.from({ length: 7 }, (_, i) => ({
              date: `Day ${i + 1}`,
              value: Math.floor(Math.random() * 3)
            }))
          },
          ...fitnessMetrics
        ]}
        onMetricClick={(metric) => setSelectedMetric(metric)}
        financialData={financialData}
      />

      {selectedMetric && (
        <MetricGraphModal 
          metric={selectedMetric} 
          onClose={() => setSelectedMetric(null)} 
        />
      )}
    </div>
  );
}

// Fitness Page
function Fitness() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  
  const fitnessMetrics: Metric[] = [
    {
      key: 'steps',
      label: 'Daily Steps',
      value: 10234,
      color: 'bg-orange-500',
      category: 'fitness',
      icon: '👟',
      data: [
        { date: 'Mon', value: 8000 },
        { date: 'Tue', value: 9500 },
        { date: 'Wed', value: 12000 },
        { date: 'Thu', value: 11000 },
        { date: 'Fri', value: 10234 },
        { date: 'Sat', value: 9000 },
        { date: 'Sun', value: 10000 },
      ],
    },
    {
      key: 'calories',
      label: 'Calories Burned',
      value: 2200,
      color: 'bg-red-500',
      category: 'fitness',
      icon: '🔥',
      data: [
        { date: 'Mon', value: 2100 },
        { date: 'Tue', value: 2000 },
        { date: 'Wed', value: 2300 },
        { date: 'Thu', value: 2250 },
        { date: 'Fri', value: 2200 },
        { date: 'Sat', value: 2150 },
        { date: 'Sun', value: 2100 },
      ],
    },
    {
      key: 'active-minutes',
      label: 'Active Minutes',
      value: 120,
      color: 'bg-green-500',
      category: 'fitness',
      icon: '⚡',
      data: [
        { date: 'Mon', value: 100 },
        { date: 'Tue', value: 110 },
        { date: 'Wed', value: 120 },
        { date: 'Thu', value: 130 },
        { date: 'Fri', value: 120 },
        { date: 'Sat', value: 110 },
        { date: 'Sun', value: 120 },
      ],
    },
    {
      key: 'workouts',
      label: 'Workouts',
      value: 5,
      color: 'bg-blue-500',
      category: 'fitness',
      icon: '💪',
      data: [
        { date: 'Mon', value: 1 },
        { date: 'Tue', value: 0 },
        { date: 'Wed', value: 1 },
        { date: 'Thu', value: 1 },
        { date: 'Fri', value: 0 },
        { date: 'Sat', value: 1 },
        { date: 'Sun', value: 1 },
      ],
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          Fitness Dashboard
        </h1>
        <p className="text-xl text-stone-600 dark:text-stone-300">
          Track your physical wellness journey
        </p>
      </motion.div>

      <DashboardGrid 
        metrics={fitnessMetrics} 
        onMetricClick={(metric) => setSelectedMetric(metric)} 
      />

      {selectedMetric && (
        <MetricGraphModal 
          metric={selectedMetric} 
          onClose={() => setSelectedMetric(null)} 
        />
      )}
    </div>
  );
}

// Mindfulness Page
function Mindfulness() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [prayerEntries, setPrayerEntries] = useState<PrayerEntry[]>([]);

  const handleMoodEntry = async (entry: MoodEntry) => {
    setMoodEntries(prev => [entry, ...prev.filter(e => e.date !== entry.date)]);
  };

  const handleJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    const localEntry: JournalEntry = { ...entry, id: Date.now().toString() };
    setJournalEntries(prev => [localEntry, ...prev]);
  };

  const handlePrayerEntry = async (entry: PrayerEntry) => {
    setPrayerEntries(prev => [entry, ...prev.filter(e => e.date !== entry.date)]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          Mindfulness Hub
        </h1>
        <p className="text-xl text-stone-600 dark:text-stone-300">
          Nurture your mental well-being
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MoodTracker 
          entries={moodEntries} 
          onAddEntry={handleMoodEntry} 
        />
        <JournalWidget 
          entries={journalEntries} 
          onAddEntry={handleJournalEntry} 
        />
        <PrayerTracker 
          entries={prayerEntries} 
          onAddEntry={handlePrayerEntry} 
        />
      </div>
    </div>
  );
}

// Finances Page
function Finances() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    balance: 50000,
    income: 5000,
    expenses: 3500,
    savings: 1500,
    investments: 15000,
    debt: 2500,
    emergencyFund: 10000,
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          Financial Overview
        </h1>
        <p className="text-xl text-stone-600 dark:text-stone-300">
          Track your financial wellness and banking data
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Widget */}
        <div className="lg:col-span-1">
          <FinancialWidget 
            data={financialData} 
          />
        </div>

        {/* Banking Dashboard */}
        <div className="lg:col-span-2">
          <BankingDashboard />
        </div>

        {/* Bank Transaction Viewer */}
        <div className="lg:col-span-3">
          <BankTransactionViewer />
        </div>
      </div>
    </div>
  );
}

export default App;