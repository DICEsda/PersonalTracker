import { useState } from 'react'
import './index.css'
import { DashboardGrid } from './components/DashboardGrid'
import { MetricGraphModal } from './components/MetricGraphModal'

const metrics = [
  {
    key: 'steps',
    label: 'Steps',
    value: 10234,
    color: 'bg-orange-400',
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
    label: 'Calories',
    value: 2200,
    color: 'bg-gray-700',
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
    key: 'mood',
    label: 'Mood',
    value: '😊',
    color: 'bg-black',
    data: [
      { date: 'Mon', value: 3 },
      { date: 'Tue', value: 4 },
      { date: 'Wed', value: 5 },
      { date: 'Thu', value: 4 },
      { date: 'Fri', value: 3 },
      { date: 'Sat', value: 4 },
      { date: 'Sun', value: 5 },
    ],
  },
  {
    key: 'networth',
    label: 'Net Worth',
    value: '$12,500',
    color: 'bg-gray-900',
    data: [
      { date: 'Mon', value: 12000 },
      { date: 'Tue', value: 12100 },
      { date: 'Wed', value: 12200 },
      { date: 'Thu', value: 12300 },
      { date: 'Fri', value: 12400 },
      { date: 'Sat', value: 12500 },
      { date: 'Sun', value: 12500 },
    ],
  },
  {
    key: 'journal',
    label: 'Journal Entries',
    value: 5,
    color: 'bg-gray-800',
    data: [
      { date: 'Mon', value: 1 },
      { date: 'Tue', value: 0 },
      { date: 'Wed', value: 1 },
      { date: 'Thu', value: 1 },
      { date: 'Fri', value: 0 },
      { date: 'Sat', value: 1 },
      { date: 'Sun', value: 1 },
    ],
  },
  {
    key: 'prayer',
    label: 'Prayer Streak',
    value: '7 days',
    color: 'bg-orange-500',
    data: [
      { date: 'Mon', value: 1 },
      { date: 'Tue', value: 1 },
      { date: 'Wed', value: 1 },
      { date: 'Thu', value: 1 },
      { date: 'Fri', value: 1 },
      { date: 'Sat', value: 1 },
      { date: 'Sun', value: 1 },
    ],
  },
]

function App() {
  const [selected, setSelected] = useState(null as null | typeof metrics[0])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-100 to-gray-300 dark:from-black dark:via-gray-900 dark:to-gray-800 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Personal Development Dashboard</h1>
      <DashboardGrid metrics={metrics} onMetricClick={setSelected} />
      <MetricGraphModal metric={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default App
