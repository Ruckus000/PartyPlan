import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, radii, typography } from '../../theme/tokens';

export interface FilterTab {
  key: string;
  label: string;
  count: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

/**
 * FilterTabs - Horizontal filter tabs
 * Matches .filter-tabs from plan.html
 */
export function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          accessibilityLabel={`${tab.label} filter. ${tab.count} items`}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === tab.key }}
          style={({ pressed }) => [
            styles.tab,
            activeTab === tab.key && styles.tabActive,
            pressed && styles.tabPressed,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
          <View
            style={[
              styles.count,
              activeTab === tab.key && styles.countActive,
            ]}
          >
            <Text
              style={[
                styles.countText,
                activeTab === tab.key && styles.countTextActive,
              ]}
            >
              {tab.count}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    gap: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(229, 64, 79, 0.15)',
    borderColor: 'rgba(229, 64, 79, 0.3)',
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.accentSoft,
  },
  count: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  countActive: {
    backgroundColor: 'rgba(229, 64, 79, 0.2)',
  },
  countText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
  },
  countTextActive: {
    color: colors.accentSoft,
  },
});
