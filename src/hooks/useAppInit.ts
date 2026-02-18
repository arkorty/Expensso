import {useEffect, useState} from 'react';
import {getDatabase} from '../db/database';
import {seedDefaultCategories} from '../db/queries';
import {useSettingsStore} from '../store/settingsStore';
import {useExpenseStore} from '../store/expenseStore';

/**
 * Hook to initialize the app: open DB, seed categories, hydrate settings.
 * Returns `isReady` when all initialization is complete.
 */
export function useAppInit(): {isReady: boolean; error: string | null} {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrate = useSettingsStore(s => s.hydrate);
  const initialize = useExpenseStore(s => s.initialize);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // 1. Open SQLite database (creates tables if needed)
        await getDatabase();

        // 2. Seed default categories
        await seedDefaultCategories();

        // 3. Hydrate settings from MMKV
        hydrate();

        // 4. Initialize expense store (load categories)
        await initialize();

        if (mounted) {
          setIsReady(true);
        }
      } catch (err: any) {
        console.error('App initialization failed:', err);
        if (mounted) {
          setError(err.message || 'Initialization failed');
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [hydrate, initialize]);

  return {isReady, error};
}
