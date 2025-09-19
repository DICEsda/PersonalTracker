import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { googleCalendarApi } from '../services/googleCalendarApi';
import GoogleLogin from './GoogleLogin';
import type { GoogleCalendarEvent, CalendarInfo, CreateEventRequest } from '../types/googleCalendar';

interface GoogleCalendarProps {
  className?: string;
}

export const GoogleCalendar: React.FC<GoogleCalendarProps> = ({ className = '' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>('');
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    // Check if we have a stored access token
    const token = localStorage.getItem('google_access_token');
    if (token) {
      googleCalendarApi.setAccessToken(token);
      setIsAuthenticated(true);
      loadCalendars();
    }
  }, []);

  useEffect(() => {
    if (selectedCalendar && isAuthenticated) {
      loadEvents();
    }
  }, [selectedCalendar, currentDate, isAuthenticated]);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      const response = await googleCalendarApi.getCalendars();
      setCalendars(response.calendars);
      if (response.calendars.length > 0) {
        const primaryCalendar = response.calendars.find(c => c.primary) || response.calendars[0];
        setSelectedCalendar(primaryCalendar.id);
      }
    } catch (error) {
      console.error('Failed to load calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const startDate = startOfWeek(currentDate);
      const endDate = endOfWeek(currentDate);
      const response = await googleCalendarApi.getEvents(selectedCalendar, startDate, endDate);
      setEvents(response.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateEventRequest) => {
    try {
      setLoading(true);
      await googleCalendarApi.createEvent(selectedCalendar, eventData);
      await loadEvents();
      setShowEventForm(false);
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setLoading(true);
      await googleCalendarApi.deleteEvent(selectedCalendar, eventId);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const handleAuthSuccess = async (accessToken: string) => {
    googleCalendarApi.setAccessToken(accessToken);
    localStorage.setItem('google_access_token', accessToken);
    setIsAuthenticated(true);
    await loadCalendars();
  };

  const handleAuthError = (error: string) => {
    console.error('Authentication failed:', error);
    // You could show an error message to the user here
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6 border border-stone-200 dark:border-stone-700 ${className}`}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">📅 Google Calendar</h2>
          <p className="text-stone-600 dark:text-stone-300 mb-6">Connect your Google Calendar to view and manage your events</p>
        </div>
        <GoogleLogin onSuccess={handleAuthSuccess} onError={handleAuthError} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6 border border-stone-200 dark:border-stone-700 ${className}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">📅 Google Calendar</h2>
        <div className="flex gap-2">
          <select
            value={selectedCalendar}
            onChange={(e) => setSelectedCalendar(e.target.value)}
            className="border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-lg px-3 py-2 text-sm"
          >
            {calendars.map(calendar => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.summary}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
          className="text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
        >
          ← Previous Week
        </button>
        <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200">
          {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
          className="text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100"
        >
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-stone-600 dark:text-stone-300 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getWeekDays().map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isSameDay(date, new Date());
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-stone-200 dark:border-stone-700 cursor-pointer ${
                isToday ? 'bg-blue-50 border-blue-300' : 'bg-stone-50 dark:bg-stone-900'
              }`}
              onClick={() => {
                setSelectedDate(date);
                setShowEventForm(true);
              }}
            >
              <div className={`text-sm font-semibold mb-1 ${
                isToday ? 'text-blue-600' : 'text-stone-700 dark:text-stone-200'
              }`}>
                {format(date, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50"
                    title={event.summary}
                    onClick={() => {
                      if (confirm('Delete this event?')) {
                        deleteEvent(event.id);
                      }
                    }}
                  >
                    {event.summary}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          onSubmit={createEvent}
          onCancel={() => setShowEventForm(false)}
          selectedDate={selectedDate}
        />
      )}
    </motion.div>
  );
};

// Event Form Component
interface EventFormProps {
  onSubmit: (event: CreateEventRequest) => void;
  onCancel: () => void;
  selectedDate?: Date | null;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, onCancel, selectedDate }) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    summary: '',
    description: '',
    start: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: selectedDate ? format(new Date(selectedDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm") : format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    isAllDay: false,
    colorId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stone-800 rounded-lg p-6 w-full max-w-md border border-stone-200 dark:border-stone-700">
        <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Start</label>
              <input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">End</label>
              <input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-stone-300 dark:border-stone-600 rounded-lg px-3 py-2 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isAllDay}
              onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm text-stone-700 dark:text-stone-300">All day event</label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Create Event
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-700 dark:text-stone-900 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 