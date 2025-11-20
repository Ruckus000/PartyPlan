import { useWindowDimensions } from 'react-native';

/**
 * Get responsive card dimensions
 * Scales proportionally on small screens, caps at design specs on large screens
 */
export function useQuickActionDimensions() {
  const { width: screenWidth } = useWindowDimensions();
  const availableWidth = screenWidth - 40 - 16;
  
  return {
    standard: Math.floor(availableWidth / 3),
    featured: Math.min(180, Math.floor(availableWidth / 2) - 4),
    iconWrapper: {
      standard: 24,
      featured: 28,
    },
    gap: 8,
  };
}
