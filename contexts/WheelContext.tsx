import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { WHEEL_STORAGE_KEY } from '@/constants/wheel';

export type WheelItem = {
  id: string;
  label: string;
};

type WheelContextValue = {
  items: WheelItem[];
  isLoaded: boolean;
  addItem: (label: string) => void;
  addItems: (labels: string[]) => void;
  replaceItems: (labels: string[]) => void;
  updateItem: (id: string, label: string) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
};

const WheelContext = createContext<WheelContextValue | null>(null);

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function WheelProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WheelItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const stored = await AsyncStorage.getItem(WHEEL_STORAGE_KEY);
        if (cancelled) return;

        if (stored) {
          const parsed = JSON.parse(stored) as WheelItem[];
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        }
      } catch {
        // Start fresh if storage is corrupted.
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (nextItems: WheelItem[]) => {
    setItems(nextItems);
    await AsyncStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(nextItems));
  }, []);

  const addItem = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;

      setItems((current) => {
        const next = [...current, { id: createId(), label: trimmed }];
        void AsyncStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const addItems = useCallback((labels: string[]) => {
    const parsed = labels.map((label) => label.trim()).filter(Boolean);
    if (!parsed.length) return;

    setItems((current) => {
      const next = [
        ...current,
        ...parsed.map((label) => ({ id: createId(), label })),
      ];
      void AsyncStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const replaceItems = useCallback((labels: string[]) => {
    const parsed = labels.map((label) => label.trim()).filter(Boolean);

    setItems(() => {
      const next = parsed.map((label) => ({ id: createId(), label }));
      void AsyncStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateItem = useCallback(
    (id: string, label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;

      setItems((current) => {
        const next = current.map((item) =>
          item.id === id ? { ...item, label: trimmed } : item,
        );
        void AsyncStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      void AsyncStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearItems = useCallback(() => {
    void persist([]);
  }, [persist]);

  const value = useMemo(
    () => ({
      items,
      isLoaded,
      addItem,
      addItems,
      replaceItems,
      updateItem,
      removeItem,
      clearItems,
    }),
    [items, isLoaded, addItem, addItems, replaceItems, updateItem, removeItem, clearItems],
  );

  return <WheelContext.Provider value={value}>{children}</WheelContext.Provider>;
}

export function useWheel() {
  const context = useContext(WheelContext);
  if (!context) {
    throw new Error('useWheel must be used within a WheelProvider');
  }
  return context;
}
