import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MoodEntry {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

interface MoodTrackerProps {
  entries: MoodEntry[];
  onAddEntry: (entry: MoodEntry) => void;
}

const moodEmojis = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄'
} as const;

const moodLabels = {
  1: 'Very Sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Very Happy'
} as const;

export const MoodTracker: React.FC<MoodTrackerProps> = ({ entries, onAddEntry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: MoodEntry = {
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      note: note.trim() || undefined
    };
    onAddEntry(newEntry);
    setNote('');
    setSelectedMood(3);
    setIsEditing(false);
  };

  const todayEntry = entries.find(entry => entry.date === new Date().toISOString().split('T')[0]);
  const averageMood = entries.length > 0 
    ? Math.round(entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length)
    : 3;

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-700"
      >
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">How are you feeling today?</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
              Select your mood
            </label>
            <div className="flex justify-between items-center">
              {([1, 2, 3, 4, 5] as const).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    selectedMood === mood
                      ? 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-700 border-2 border-transparent'
                  }`}
                >
                  <span className="text-3xl mb-1">{moodEmojis[mood]}</span>
                  <span className="text-xs text-stone-600 dark:text-stone-400">{moodLabels[mood]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Save Mood
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
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Mood Tracker</h3>
        <div className="text-2xl">{moodEmojis[averageMood as keyof typeof moodEmojis]}</div>
      </div>
      
      <div className="space-y-3">
        {todayEntry ? (
          <div className="text-center">
            <div className="text-4xl mb-2">{moodEmojis[todayEntry.mood]}</div>
            <div className="text-stone-600 dark:text-stone-400">Today's mood: {moodLabels[todayEntry.mood]}</div>
            {todayEntry.note && (
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-2 italic">
                "{todayEntry.note}"
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-stone-500 dark:text-stone-400">
            Tap to log your mood for today
          </div>
        )}
        
        <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600 dark:text-stone-400">7-day average</span>
            <span className="text-stone-800 dark:text-stone-200">
              {moodEmojis[averageMood as keyof typeof moodEmojis]} {moodLabels[averageMood as keyof typeof moodLabels]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};