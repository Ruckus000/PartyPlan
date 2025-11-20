import { useWindowDimensions } from 'react-native';

/**
 * Get responsive card dimensions
 * Scales proportionally on small screens, caps at design specs on large screens
 */
export function useQuickActionDimensions() {
  const { width: screenWidth } = useWindowDimensions();
  
  // Design constants from mockup
  const DESIGN_BASE = 430;
  const DESIGN_CARD_STANDARD = 140;
  const DESIGN_CARD_FEATURED = 200;
  
  // Scale proportionally but cap at design maximum
  const scaleFactor = Math.min(1, screenWidth / DESIGN_BASE);
  
  return {
    standard: Math.round(DESIGN_CARD_STANDARD * scaleFactor),
    featured: Math.round(DESIGN_CARD_FEATURED * scaleFactor),
    iconWrapper: {
      standard: Math.round(36 * scaleFactor),
      featured: Math.round(40 * scaleFactor),
    },
    gap: 10, // Can stay fixed for consistent spacing
  };
}
