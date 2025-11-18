import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { colors, radii, typography } from '../../theme/tokens';

export interface FriendAvatar {
  emoji: string;
  name?: string;
}

export interface FestivalFeed {
  id: string;
  title: string;
  location: string;
  genre: string;
  dateRange: string;
  imageUrl: string;
  friendsGoing: FriendAvatar[];
  totalFriends: number;
}

interface FestivalFeedCardProps {
  festival: FestivalFeed;
  onPress?: () => void;
}

/**
 * FestivalFeedCard - Large flyer-focused card
 * Matches .feed-card from home.html
 */
export function FestivalFeedCard({ festival, onPress }: FestivalFeedCardProps) {
  const { title, location, genre, dateRange, imageUrl, friendsGoing, totalFriends } = festival;
  const displayedFriends = friendsGoing.slice(0, 3);
  const remainingCount = Math.max(0, totalFriends - 3);

  const friendText = totalFriends > 0
    ? `${totalFriends} ${totalFriends === 1 ? 'friend is' : 'friends are'} going`
    : '';

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${title} festival card. ${dateRange}. ${location}. ${genre}. ${friendText}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view festival details"
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Flyer Image Header */}
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        {/* Vignette overlay */}
        <View style={styles.vignette} />

        {/* Date Badge (top-left) */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{dateRange}</Text>
        </View>

        {/* Friends Going Overlay (top-right) */}
        {friendsGoing.length > 0 && (
          <View style={styles.friendsOverlay}>
            <View style={styles.friendsAvatars}>
              {displayedFriends.map((friend, index) => (
                <View key={index} style={[styles.friendAvatar, index > 0 && styles.friendAvatarStacked]}>
                  <Text style={styles.friendEmoji}>{friend.emoji}</Text>
                </View>
              ))}
              {remainingCount > 0 && (
                <View style={[styles.friendAvatar, styles.friendAvatarMore, styles.friendAvatarStacked]}>
                  <Text style={styles.friendMoreText}>+{remainingCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.friendsCount}>{totalFriends}</Text>
          </View>
        )}
      </ImageBackground>

      {/* Event Info */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {location} • {genre}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ translateY: -2 }],
    borderColor: colors.borderMedium,
  },
  header: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    resizeMode: 'cover',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Radial gradient would need react-native-linear-gradient with radial support
    // For now, using subtle overlay
    borderRadius: 0,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: '#fff',
  },
  friendsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    paddingLeft: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  friendsAvatars: {
    flexDirection: 'row',
  },
  friendAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#30202a',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarStacked: {
    marginLeft: -8,
  },
  friendAvatarMore: {
    backgroundColor: 'rgba(229, 64, 79, 0.15)',
    borderColor: 'rgba(229, 64, 79, 0.3)',
  },
  friendEmoji: {
    fontSize: 14,
  },
  friendMoreText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: '#fff',
  },
  friendsCount: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: '#fff',
    paddingRight: 2,
  },
  body: {
    padding: 14,
    paddingBottom: 16,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.02,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  location: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
});
