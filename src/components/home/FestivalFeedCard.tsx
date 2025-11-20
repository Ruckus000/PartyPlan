import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { colors, typography } from '../../theme/tokens';
import { home, radii } from '../../theme/dimensions';

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
export const FestivalFeedCard = React.memo(function FestivalFeedCard({ festival, onPress }: FestivalFeedCardProps) {
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
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    // From mockup: border: 1px solid var(--border-subtle)
    borderWidth: home.festivalFeed.card.borderWidth,
    borderColor: colors.borderSubtle,
    // From mockup: border-radius: 24px
    borderRadius: home.festivalFeed.card.borderRadius,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ translateY: -2 }],
    borderColor: colors.borderMedium,
  },
  header: {
    // From mockup: height: 240px
    height: home.festivalFeed.card.imageHeight,
    position: 'relative',
  },
  headerImage: {
    resizeMode: 'cover',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // From mockup: radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(5,3,6,0.25) 100%)
    // Native doesn't support radial gradients easily, subtle overlay is fine
    borderRadius: 0,
  },
  dateBadge: {
    // From mockup: top: 12px, left: 12px
    position: 'absolute',
    top: home.festivalFeed.dateBadge.position.top,
    left: home.festivalFeed.dateBadge.position.left,
    // From mockup: padding: 6px 12px
    paddingVertical: home.festivalFeed.dateBadge.padding.vertical,
    paddingHorizontal: home.festivalFeed.dateBadge.padding.horizontal,
    borderRadius: home.festivalFeed.dateBadge.borderRadius,
    // From mockup: background: rgba(0, 0, 0, 0.6), backdrop-filter: blur(10px)
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: home.festivalFeed.dateBadge.borderWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateBadgeText: {
    // From mockup: font-size: 11px, font-weight: 600
    fontSize: typography.size.xxs,
    fontWeight: typography.weight.semibold,
    color: '#fff',
  },
  friendsOverlay: {
    // From mockup: top: 12px, right: 12px
    position: 'absolute',
    top: home.festivalFeed.friendsOverlay.position.top,
    right: home.festivalFeed.friendsOverlay.position.right,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    // From mockup: padding: 6px 10px 6px 6px
    paddingVertical: home.festivalFeed.friendsOverlay.padding.vertical,
    paddingHorizontal: home.festivalFeed.friendsOverlay.padding.horizontal,
    paddingLeft: home.festivalFeed.friendsOverlay.padding.left,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: home.festivalFeed.friendsOverlay.borderWidth,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  friendsAvatars: {
    flexDirection: 'row',
  },
  friendAvatar: {
    // From mockup: width/height: 26px
    width: home.festivalFeed.friendsOverlay.avatarSize,
    height: home.festivalFeed.friendsOverlay.avatarSize,
    borderRadius: home.festivalFeed.friendsOverlay.avatarSize / 2,
    backgroundColor: '#30202a',
    // From mockup: border: 1.5px solid rgba(0, 0, 0, 0.4)
    borderWidth: home.festivalFeed.friendsOverlay.avatarBorderWidth,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarStacked: {
    // From mockup: margin-left: -8px (except first-child)
    marginLeft: home.festivalFeed.friendsOverlay.avatarOverlap,
  },
  friendAvatarMore: {
    // From mockup: background: rgba(229, 64, 79, 0.15), border-color: rgba(229, 64, 79, 0.3)
    backgroundColor: 'rgba(229, 64, 79, 0.15)',
    borderColor: 'rgba(229, 64, 79, 0.3)',
  },
  friendEmoji: {
    fontSize: 14,
  },
  friendMoreText: {
    // From mockup: font-size: 10px, font-weight: 700
    fontSize: typography.size.xxxs,
    fontWeight: typography.weight.bold,
    color: '#fff',
  },
  friendsCount: {
    // From mockup: font-size: 12px, font-weight: 600
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: '#fff',
    paddingRight: 2,
  },
  body: {
    // From mockup: padding: 14px 16px 16px
    paddingTop: home.festivalFeed.card.bodyPadding.top,
    paddingHorizontal: home.festivalFeed.card.bodyPadding.horizontal,
    paddingBottom: home.festivalFeed.card.bodyPadding.bottom,
  },
  title: {
    // From mockup: font-size: 17px, font-weight: 700, letter-spacing: -0.02em
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  location: {
    // From mockup: font-size: 13px
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});
