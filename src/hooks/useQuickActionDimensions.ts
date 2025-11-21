/**
 * Quick Action Chip Dimensions
 * Fixed values from mockup spec (home.html)
 * Horizontal scroller uses fixed widths, not responsive calculations
 */
export function useQuickActionDimensions() {
  return {
    standard: 140,   // From home.html line 232
    featured: 200,   // From home.html line 236
    iconWrapper: {
      standard: 36,  // From home.html line 255
      featured: 40,  // From home.html line 271
    },
    gap: 10,        // From home.html line 203
  };
}
