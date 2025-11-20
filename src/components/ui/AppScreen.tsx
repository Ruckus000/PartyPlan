import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, layout } from '../../theme/tokens';
import { screen } from '../../theme/dimensions';

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  noSafeArea?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/**
 * AppScreen - Base screen wrapper component
 * Mimics .app-container from HTML mockups
 * - Handles background gradient
 * - Centers content (max-width: 430px from mockup)
 * - Applies bottom padding for bottom nav (110px from mockup)
 * - Safe area handling for notches and home indicators
 */
export function AppScreen({
  children,
  scrollable = true,
  noSafeArea = false,
  style,
  contentContainerStyle,
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const Container = noSafeArea ? View : SafeAreaView;
  const containerProps = noSafeArea ? {} : { edges: ['top'] as const };

  return (
    <Container style={styles.safeArea} {...containerProps}>
      <View style={styles.root}>
        {/* Radial background gradient circle at top-left */}
        {/* From mockup: radial-gradient(circle at 0 0, rgba(229, 64, 79, 0.25) 0, transparent 55%) */}
        <LinearGradient
          colors={gradients.appContainer.colors}
          locations={gradients.appContainer.locations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />

        {/* Content container */}
        <View style={[styles.container, style]}>
          {scrollable ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  // Dynamic bottom padding based on safe area + bottom nav
                  paddingBottom: layout.screenBottomPadding + insets.bottom,
                },
                contentContainerStyle,
              ]}
              showsVerticalScrollIndicator={false}
              // Scroll performance optimizations
              removeClippedSubviews={true}
              scrollEventThrottle={16}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, contentContainerStyle]}>
              {children}
            </View>
          )}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // From mockup: --bg: #050306
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Large enough to cover fold/gradient area
    height: 400,
    opacity: 1,
  },
  container: {
    flex: 1,
    // From mockup: max-width: 430px
    maxWidth: screen.maxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // Bottom padding applied dynamically to account for safe area
    // Base: 110px (from mockup: padding-bottom: 110px)
  },
  content: {
    flex: 1,
    // From mockup: padding-bottom: 110px
    paddingBottom: layout.screenBottomPadding,
  },
});
