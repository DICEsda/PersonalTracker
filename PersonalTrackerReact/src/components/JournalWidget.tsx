import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

interface JournalWidgetProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id'>) => void;
}

export const JournalWidget: React.FC<JournalWidgetProps> = ({ entries, onAddEntry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newEntry: Omit<JournalEntry, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      title: title.trim(),
      content: content.trim()
    };
    
    onAddEntry(newEntry);
    setTitle('');
    setContent('');
    setIsEditing(false);
  };

  const todayEntry = entries.find(entry => entry.date === new Date().toISOString().split('T')[0]);
  const recentEntries = entries.slice(0, 3);

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 border border-stone-200 dark:border-stone-700"
      >
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-4">New Journal Entry</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind today?"
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Entry
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, reflections, or daily experiences..."
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 resize-none"
              rows={6}
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Save Entry
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
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Journal</h3>
        <div className="text-2xl">📔</div>
      </div>
      
      <div className="space-y-3">
        {todayEntry ? (
          <div className="space-y-2">
            <div className="font-medium text-stone-800 dark:text-stone-200">{todayEntry.title}</div>
            <div className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3">
              {todayEntry.content}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">Today</div>
          </div>
        ) : (
          <div className="text-center text-stone-500 dark:text-stone-400 py-4">
            Tap to write today's journal entry
          </div>
        )}
        
        {recentEntries.length > 0 && (
          <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
            <div className="text-sm text-stone-600 dark:text-stone-400 mb-2">Recent entries</div>
            <div className="space-y-1">
              {recentEntries.slice(0, 2).map((entry) => (
                <div key={entry.id} className="text-xs text-stone-500 dark:text-stone-400 truncate">
                  {entry.date}: {entry.title}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <span className="text-sm text-stone-600 dark:text-stone-400">
            {entries.length} total entries
          </span>
        </div>
      </div>
    </motion.div>
  );
};