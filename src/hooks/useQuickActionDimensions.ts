import { useWindowDimensions } from 'react-native';

/**
 * Get responsive card dimensions
 * Scales proportionally on small screens, caps at design specs on large screens
 */
export function useQuickActionDimensions() {
  return {
    standard: 110,
    featured: 160,
    iconWrapper: {
      standard: 28,
      featured: 32,
    },
    gap: 8,
  };
}
