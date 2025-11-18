import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { colors, radii, typography } from '../../theme/tokens';

export interface MyFestival {
  id: string;
  name: string;
  dateRange: string;
  location: string;
  friendsCount: number;
  imageUrl: string;
  status: 'open' | 'planning' | 'confirmed';
}

interface MyFestivalCardProps {
  festival: MyFestival;
  onPress?: () => void;
}

/**
 * MyFestivalCard - Compact list card
 * Matches .my-card from home.html
 */
export function MyFestivalCard({ festival, onPress }: MyFestivalCardProps) {
  const { name, dateRange, location, friendsCount, imageUrl, status } = festival;

  const getStatusLabel = () => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'planning':
        return 'Planning';
      case 'confirmed':
        return 'Confirmed';
      default:
        return 'View';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Thumbnail Image */}
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.imageOverlay} />
      </ImageBackground>

      {/* Main Content */}
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {dateRange} • {location}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {friendsCount} {friendsCount === 1 ? 'friend' : 'friends'} in your squad
        </Text>
      </View>

      {/* Status Pill */}
      <View style={styles.pill}>
        <Text style={styles.pillText}>{getStatusLabel()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCardSoft,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 22,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardPressed: {
    transform: [{ translateY: -1 }],
    borderColor: colors.borderLight,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  main: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    letterSpacing: -0.01,
    color: colors.textPrimary,
  },
  meta: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(229, 64, 79, 0.08)',
  },
  pillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accentSoft,
  },
});
