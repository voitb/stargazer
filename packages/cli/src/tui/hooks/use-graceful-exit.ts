import { useApp } from 'ink';
import { useEffect } from 'react';

/**
 * Hook for graceful exit handling.
 * Ensures cleanup runs before the app exits on SIGINT/SIGTERM.
 */
export function useGracefulExit(cleanup?: () => Promise<void>): void {
  const { exit } = useApp();

  useEffect(() => {
    const handleExit = async () => {
      if (cleanup) {
        await cleanup();
      }
      exit();
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);

    return () => {
      process.removeListener('SIGINT', handleExit);
      process.removeListener('SIGTERM', handleExit);
    };
  }, [cleanup, exit]);
}
