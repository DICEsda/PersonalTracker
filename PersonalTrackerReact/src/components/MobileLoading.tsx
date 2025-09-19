import { motion } from 'framer-motion';

interface MobileLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse';
}

export function MobileLoading({ 
  message = 'Loading...', 
  size = 'medium', 
  variant = 'spinner' 
}: MobileLoadingProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const Spinner = () => (
    <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
  );

  const Dots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} bg-blue-500 rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <motion.div
      className={`${sizeClasses[size]} bg-blue-500 rounded-full`}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const LoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      default:
        return <Spinner />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingIndicator />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-300 text-center font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// Full screen loading overlay
export function FullScreenLoading({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center z-50"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <MobileLoading message={message} size="large" variant="spinner" />
    </motion.div>
  );
}

// Pull to refresh indicator
export function PullToRefreshIndicator({ 
  pullDistance, 
  isRefreshing 
}: { 
  pullDistance: number; 
  isRefreshing: boolean; 
}) {
  const maxPullDistance = 100;
  const progress = Math.min(pullDistance / maxPullDistance, 1);

  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"
        animate={isRefreshing ? { rotate: 360 } : {}}
        transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        style={{
          transform: `rotate(${progress * 180}deg)`
        }}
      />
      <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
        {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
      </span>
    </div>
  );
} 