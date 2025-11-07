import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook for debounced persistence to AsyncStorage
 * Reduces disk I/O and battery usage by delaying writes until data stops changing
 *
 * @param key - AsyncStorage key to store data under
 * @param value - Data to persist (will be JSON stringified)
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 */
export function useDebouncedPersistence<T>(
  key: string,
  value: T,
  delay: number = 500
): void {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      AsyncStorage.setItem(key, JSON.stringify(value));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [key, value, delay]);
}
