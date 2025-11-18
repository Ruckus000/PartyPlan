import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients, layout } from '../../theme/tokens';

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/**
 * AppScreen - Base screen wrapper component
 * Mimics .app-container from HTML mockups
 * - Handles background gradient
 * - Centers content (max-width 430px)
 * - Applies bottom padding for bottom nav
 * - Safe area handling
 */
export function AppScreen({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.root}>
        {/* Radial background gradient circle at top-left */}
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
                contentContainerStyle,
              ]}
              showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    height: 400,
    opacity: 1,
  },
  container: {
    flex: 1,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: layout.screenBottomPadding, // Space for bottom nav
  },
  content: {
    flex: 1,
    paddingBottom: layout.screenBottomPadding,
  },
});
