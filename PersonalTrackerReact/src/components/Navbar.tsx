import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './Auth';

const navItems = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Fitness', path: '/fitness', icon: '💪' },
  { name: 'Mindfulness', path: '/mindfulness', icon: '🧘' },
  { name: 'Finances', path: '/finances', icon: '💰' },
  { name: 'Calendar', path: '/calendar', icon: '📅' },
];

export function Navbar() {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
  <nav className="w-full bg-stone-900 text-stone-50 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Placeholder */}
          <div className="w-8 h-8 rounded-full bg-stone-600 flex items-center justify-center text-stone-50 font-bold text-lg">PT</div>
          <div className="text-lg sm:text-xl font-bold tracking-wide text-stone-50">Personal Tracker</div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `relative px-4 py-2 rounded-full transition-all duration-200 font-medium outline-none focus:ring-2 focus:ring-stone-400/50 min-h-[44px] min-w-[44px] flex items-center justify-center ` +
                (isActive
                  ? 'bg-stone-100 text-stone-900 shadow-md border border-stone-300'
                  : 'hover:bg-stone-700 text-stone-200')
              }
              end={item.path === '/'}
            >
              <span className="z-10 relative">{item.name}</span>
            </NavLink>
          ))}
          {/* Theme toggle removed for dark-only mode */}
          
          {/* Logout button */}
          <button
            className="ml-2 px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200 font-medium"
            title="Logout"
            onClick={logout}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
  <div className="md:hidden flex items-center gap-2">
          {/* Theme toggle removed for dark-only mode */}
          <button
            className="p-2 rounded-full bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium outline-none focus:ring-2 focus:ring-stone-400/50 min-h-[48px] ` +
                  (isActive
                    ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-md border border-stone-700 dark:border-stone-300'
                    : 'hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200')
                }
                end={item.path === '/'}
                onClick={closeMobileMenu}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 