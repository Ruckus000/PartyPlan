import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Card } from '../ui/Card';
import { StatusBadge, StatusType } from './StatusBadge';
import { colors, radii, typography } from '../../theme/tokens';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface SquadMember {
  id: string;
  emoji: string;
  name: string;
  confirmed: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'conflict' | 'vote' | 'update';
  title: string;
  description: string;
  time?: string;
}

export interface Squad {
  id: string;
  name: string;
  dateRange: string;
  imageUrl: string;
  members: SquadMember[];
  totalMembers: number;
  confirmedCount: number;
  statuses: { type: StatusType; text: string; showIcon?: boolean }[];
  activities?: ActivityItem[];
  hasInvite?: boolean;
  inviteText?: string;
  inviterName?: string;
}

interface SquadCardProps {
  squad: Squad;
  onAcceptInvite?: () => void;
  onDeclineInvite?: () => void;
  onQuickAction?: (actionType: string) => void;
}

/**
 * SquadCard - Expandable squad/plan card
 * Matches .squad-card from plan.html
 */
export const SquadCard = React.memo(function SquadCard({
  squad,
  onAcceptInvite,
  onDeclineInvite,
  onQuickAction,
}: SquadCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const {
    name,
    dateRange,
    imageUrl,
    members,
    totalMembers,
    confirmedCount,
    statuses,
    activities,
    hasInvite,
    inviteText,
  } = squad;

  const displayedMembers = members.slice(0, 4);
  const cardStyle = StyleSheet.flatten([
    styles.card,
    hasInvite ? styles.cardWithInvite : undefined,
  ]);

  return (
    <Card
      variant="default"
      style={cardStyle}
    >
      {/* Invite Notification */}
      {hasInvite && inviteText && (
        <Pressable
          style={styles.inviteNotification}
          onPress={handleToggleExpand}
          accessibilityLabel={inviteText}
          accessibilityRole="alert"
        >
          <View style={styles.notificationDot} />
          <Text style={styles.notificationText} numberOfLines={2}>
            {inviteText}
          </Text>
          <View style={styles.notificationActions}>
            <Pressable
              style={styles.inviteButton}
              onPress={(e) => {
                e?.stopPropagation?.();
                onAcceptInvite?.();
              }}
              accessibilityLabel="Accept invite"
              accessibilityRole="button"
            >
              <Text style={styles.inviteButtonTextAccept}>Join</Text>
            </Pressable>
            <Pressable
              style={[styles.inviteButton, styles.inviteButtonDecline]}
              onPress={(e) => {
                e?.stopPropagation?.();
                onDeclineInvite?.();
              }}
              accessibilityLabel="Decline invite"
              accessibilityRole="button"
            >
              <Text style={styles.inviteButtonTextDecline}>Decline</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* Squad Header */}
      <Pressable
        style={styles.header}
        onPress={handleToggleExpand}
        accessibilityLabel={`${name}. ${dateRange}. ${totalMembers} members. ${statuses.map(s => s.text).join(', ')}`}
        accessibilityRole="button"
        accessibilityHint={expanded ? 'Collapse details' : 'Expand to see details'}
      >
        {/* Squad Info Row */}
        <View style={styles.row}>
          <ImageBackground
            source={{ uri: imageUrl }}
            style={styles.image}
            imageStyle={styles.imageStyle}
          />

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.date} numberOfLines={1}>
              {dateRange}
            </Text>
          </View>

          <View style={styles.statusesContainer}>
            {statuses.map((status, index) => (
              <StatusBadge
                key={index}
                type={status.type}
                text={status.text}
                showIcon={status.showIcon}
              />
            ))}
          </View>
        </View>

        {/* Members Row */}
        <View style={styles.membersRow}>
          <View style={styles.memberAvatars}>
            {displayedMembers.map((member) => (
              <View
                key={member.id}
                style={[
                  styles.memberAvatar,
                  member.confirmed && styles.memberAvatarConfirmed,
                ]}
              >
                <Text style={styles.memberEmoji}>{member.emoji}</Text>
                {member.confirmed && <View style={styles.confirmationDot} />}
              </View>
            ))}
          </View>
          <Text style={styles.memberCount}>
            {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
            {confirmedCount > 0 && ` • ${confirmedCount} confirmed`}
          </Text>
        </View>
      </Pressable>

      {/* Expandable Body */}
      {expanded && activities && activities.length > 0 && (
        <View style={styles.body}>
          {activities.map((activity, index) => (
            <ActivityRow key={activity.id} activity={activity} isLast={index === activities.length - 1} />
          ))}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.quickAction, styles.quickActionPrimary]}
              onPress={() => onQuickAction?.('resolve')}
              accessibilityLabel="Resolve conflicts"
              accessibilityRole="button"
            >
              <Text style={styles.quickActionTextPrimary}>
                Resolve conflicts
              </Text>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => onQuickAction?.('vote')}
              accessibilityLabel="Vote now"
              accessibilityRole="button"
            >
              <Text style={styles.quickActionText}>Vote now</Text>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => onQuickAction?.('timeline')}
              accessibilityLabel="View timeline"
              accessibilityRole="button"
            >
              <Text style={styles.quickActionText}>View timeline</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
});

/**
 * ActivityRow - Individual activity item
 */
function ActivityRow({ activity, isLast }: { activity: ActivityItem; isLast: boolean }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'conflict':
        return '⚠️';
      case 'vote':
        return '🗳️';
      case 'update':
        return '✨';
      default:
        return '•';
    }
  };

  const getIconColor = () => {
    switch (activity.type) {
      case 'conflict':
        return colors.accent;
      case 'vote':
        return colors.accentYellow;
      case 'update':
        return colors.accentBlue;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.activityItem, isLast && styles.activityItemLast]}>
      <View style={[styles.activityIcon, { backgroundColor: `${getIconColor()}20` }]}>
        <Text style={styles.activityIconText}>{getIcon()}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        {activity.time && (
          <Text style={styles.activityTime}>{activity.time}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'visible',
  },
  cardWithInvite: {
    borderColor: 'rgba(229, 64, 79, 0.2)',
  },
  inviteNotification: {
    backgroundColor: 'rgba(229, 64, 79, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 64, 79, 0.15)',
    padding: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  notificationText: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 6,
  },
  inviteButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(67, 233, 123, 0.3)',
    backgroundColor: 'transparent',
  },
  inviteButtonDecline: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inviteButtonTextAccept: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accentGreen,
  },
  inviteButtonTextDecline: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
  },
  header: {
    padding: 14,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  date: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  statusesContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgCardSoft,
    borderWidth: 2,
    borderColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    position: 'relative',
  },
  memberAvatarConfirmed: {},
  memberEmoji: {
    fontSize: 11,
  },
  confirmationDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentGreen,
    borderWidth: 2,
    borderColor: colors.bgCard,
  },
  memberCount: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    padding: 14,
    paddingBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  activityItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconText: {
    fontSize: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  activityDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: 3,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  quickAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  quickActionPrimary: {
    backgroundColor: 'rgba(67, 233, 123, 0.1)',
    borderColor: 'rgba(67, 233, 123, 0.2)',
  },
  quickActionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
  },
  quickActionTextPrimary: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accentGreen,
  },
});
