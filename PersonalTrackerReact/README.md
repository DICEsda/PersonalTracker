# Personal Tracker React Web Application# React + TypeScript + Vite



A modern, responsive React web application for tracking personal wellness across fitness, mindfulness, and financial metrics. Built according to the Product Requirements Document specifications.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## Features ImplementedCurrently, two official plugins are available:



### ✅ Core Requirements (PRD Milestone 1)- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh

- **Dashboard with Widgets**: Centralized view of all key metrics- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Financial Tracking**: Net worth, income, expenses, and savings tracking

- **Mood Tracking**: Daily mood logging with notes## Expanding the ESLint configuration

- **Journal Entries**: Full journaling with title and content

- **Prayer Tracker**: Islamic prayer tracking with streak monitoringIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- **Fitness Metrics**: Steps and calories display (with sample data)

- **Google OAuth2 Authentication**: Secure login flow```js

- **Google Calendar Integration**: Calendar viewing and event managementexport default tseslint.config([

- **Responsive Design**: Mobile-friendly layout  globalIgnores(['dist']),

- **Dark/Light Theme**: Theme toggle with system preference detection  {

- **PWA Support**: Progressive Web App capabilities    files: ['**/*.{ts,tsx}'],

    extends: [

### ✅ Design Guidelines (PRD Section 6)      // Other configs...

- **Color Scheme**: White/Grey/Black with Orange accents (#f97316)

- **Typography**: Inter font family for clarity and readability      // Remove tseslint.configs.recommended and replace with this

- **Layout**: Widget-style cards with clean shadows and rounded corners      ...tseslint.configs.recommendedTypeChecked,

- **Accessibility**: Proper focus states and contrast ratios      // Alternatively, use this for stricter rules

- **Animations**: Smooth framer-motion transitions      ...tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules

### ✅ Additional Features      ...tseslint.configs.stylisticTypeChecked,

- **AI Insights**: Placeholder component for future AI integration

- **Data Persistence**: Backend API integration ready      // Other configs...

- **Error Handling**: Graceful fallbacks for API failures    ],

- **Loading States**: Proper loading indicators    languageOptions: {

- **Form Validation**: Input validation for all forms      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

## Technology Stack        tsconfigRootDir: import.meta.dirname,

      },

- **React 19** with TypeScript      // other options...

- **Vite** for build tooling    },

- **Tailwind CSS** for styling  },

- **Framer Motion** for animations])

- **React Router** for navigation```

- **Axios** for API calls

- **Recharts** for data visualizationYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



## Getting Started```js

// eslint.config.js

### Prerequisitesimport reactX from 'eslint-plugin-react-x'

- Node.js 18+ import reactDom from 'eslint-plugin-react-dom'

- npm or yarn

export default tseslint.config([

### Installation  globalIgnores(['dist']),

  {

1. **Clone and install dependencies**:    files: ['**/*.{ts,tsx}'],

```bash    extends: [

cd PersonalTrackerReact      // Other configs...

npm install      // Enable lint rules for React

```      reactX.configs['recommended-typescript'],

      // Enable lint rules for React DOM

2. **Environment Configuration**:      reactDom.configs.recommended,

```bash    ],

cp .env.example .env    languageOptions: {

```      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

Edit `.env` and configure:        tsconfigRootDir: import.meta.dirname,

```env      },

VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com      // other options...

VITE_API_BASE_URL=http://localhost:5223/api    },

```  },

])

3. **Start development server**:```

```bash
npm run dev
```

4. **Build for production**:
```bash
npm run build
```

## Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API and Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (development)
   - Your production domain callback URL
6. Copy the Client ID to your `.env` file

### Backend Integration
The application is configured to work with the PersonalTrackerBackend (.NET API):
- Ensure the backend is running on `http://localhost:5223`
- API endpoints are automatically configured in `personalTrackerApi.ts`
- Authentication tokens are managed automatically

## Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
│   ├── Auth.tsx        # Authentication provider and login screen
│   ├── FinancialWidget.tsx
│   ├── MoodTracker.tsx
│   ├── JournalWidget.tsx
│   ├── PrayerTracker.tsx
│   ├── AIInsights.tsx
│   └── ...
├── services/           # API services
│   ├── personalTrackerApi.ts
│   └── googleCalendarApi.ts
├── App.tsx            # Main application
└── index.css          # Global styles
```

### Widget System
Each widget follows a consistent pattern:
- **Display Mode**: Shows current data and summary
- **Edit Mode**: Form for data entry
- **Interactive**: Click to edit/update
- **Animated**: Smooth transitions
- **Accessible**: Keyboard navigation support

## Future Enhancements

Based on PRD Milestones 2-4:
- **AI Insight Engine**: Weekly summaries and pattern analysis
- **iOS HealthKit Integration**: Automatic fitness data sync
- **Push Notifications**: Habit reminders and insights
- **Home Assistant Integration**: Environmental data tracking
- **Multi-user Support**: Family/team tracking

## License

Private project - see main repository for license information.