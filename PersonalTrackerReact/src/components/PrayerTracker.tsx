import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PrayerEntry {
  date: string;
  completed: boolean;
  prayers: string[];
  note?: string;
}

interface PrayerTrackerProps {
  entries: PrayerEntry[];
  onAddEntry: (entry: PrayerEntry) => void;
}

const defaultPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const PrayerTracker: React.FC<PrayerTrackerProps> = ({ entries, onAddEntry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [completedPrayers, setCompletedPrayers] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PrayerEntry = {
      date: new Date().toISOString().split('T')[0],
      completed: completedPrayers.length === defaultPrayers.length,
      prayers: completedPrayers,
      note: note.trim() || undefined
    };
    onAddEntry(newEntry);
    setCompletedPrayers([]);
    setNote('');
    setIsEditing(false);
  };

  const togglePrayer = (prayer: string) => {
    setCompletedPrayers(prev => 
      prev.includes(prayer) 
        ? prev.filter(p => p !== prayer)
        : [...prev, prayer]
    );
  };

  const todayEntry = entries.find(entry => entry.date === new Date().toISOString().split('T')[0]);
  
  // Calculate streak
  const currentStreak = entries.reduce((streak, entry, index) => {
    if (index === 0 && !entry.completed) return 0;
    if (entry.completed) return streak + 1;
    return streak;
  }, 0);

  const completionRate = entries.length > 0 
    ? Math.round((entries.filter(e => e.completed).length / entries.length) * 100)
    : 0;

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-700"
      >
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">Log Today's Prayers</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
              Check completed prayers
            </label>
            <div className="space-y-2">
              {defaultPrayers.map((prayer) => (
                <label key={prayer} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completedPrayers.includes(prayer)}
                    onChange={() => togglePrayer(prayer)}
                    className="w-4 h-4 text-orange-600 bg-white border-stone-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-stone-700 dark:text-stone-300">{prayer}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Reflection (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any thoughts or reflections on your prayers today?"
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Save Prayers
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 cursor-pointer border border-stone-200 dark:border-stone-700"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Prayer Tracker</h3>
        <div className="text-2xl">🤲</div>
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {currentStreak}
          </div>
          <div className="text-stone-600 dark:text-stone-400">day streak</div>
        </div>
        
        {todayEntry ? (
          <div className="space-y-2">
            <div className="text-sm text-stone-600 dark:text-stone-400">Today's prayers:</div>
            <div className="flex flex-wrap gap-1">
              {defaultPrayers.map((prayer) => (
                <span
                  key={prayer}
                  className={`px-2 py-1 text-xs rounded-full ${
                    todayEntry.prayers.includes(prayer)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
                  }`}
                >
                  {prayer}
                </span>
              ))}
            </div>
            {todayEntry.note && (
              <div className="text-sm text-stone-500 dark:text-stone-400 italic">
                "{todayEntry.note}"
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-stone-500 dark:text-stone-400">
            Tap to log today's prayers
          </div>
        )}
        
        <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600 dark:text-stone-400">Completion rate</span>
            <span className="text-stone-800 dark:text-stone-200">{completionRate}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};