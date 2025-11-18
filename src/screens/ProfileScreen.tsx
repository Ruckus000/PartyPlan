import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { AppScreen } from '../components/ui/AppScreen';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { SettingsSection } from '../components/profile/SettingsSection';
import { SettingItem } from '../components/profile/SettingItem';
import { colors, radii, typography } from '../theme/tokens';

/**
 * ProfileScreen - User profile and settings
 * Matches profile.html mockup
 */
export default function ProfileScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);

  // TODO: Get real user data from Supabase/store
  const user = {
    emoji: '🎧',
    name: 'Alex Chen',
    username: 'alexchen',
  };

  const handlePersonalInfo = () => {
    console.log('Navigate to personal information');
    // TODO: Navigate to profile edit screen
  };

  const handleHelp = () => {
    console.log('Navigate to help & FAQ');
    // TODO: Navigate to help screen or open web view
  };

  const handleContactSupport = () => {
    console.log('Navigate to contact support');
    // TODO: Open email or support form
  };

  const handleSignOut = () => {
    console.log('Sign out');
    // TODO: Implement sign out logic
  };

  const handleLinkPress = (link: 'privacy' | 'terms' | 'about') => {
    console.log(`Open ${link}`);
    // TODO: Open web view or external browser
  };

  return (
    <AppScreen scrollable={true}>
      {/* Profile Header */}
      <ProfileHeader emoji={user.emoji} name={user.name} username={user.username} />

      {/* Content */}
      <View style={styles.content}>
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingItem
            icon="user"
            label="Personal information"
            description="Name, emoji, username"
            onPress={handlePersonalInfo}
            showChevron
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingItem
            icon="bell"
            label="Push notifications"
            description="Conflicts, votes, updates"
            toggleValue={pushNotifications}
            onToggleChange={setPushNotifications}
            isLastItem
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingItem
            icon="help"
            label="Help & FAQ"
            onPress={handleHelp}
            showChevron
          />
          <SettingItem
            icon="mail"
            label="Contact support"
            onPress={handleContactSupport}
            showChevron
            isLastItem
          />
        </SettingsSection>

        {/* Sign Out (Danger Zone) */}
        <View style={styles.section}>
          <View style={styles.dangerCard}>
            <Pressable
              onPress={handleSignOut}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
              accessibilityHint="Sign out of your account"
              style={({ pressed }) => [
                styles.dangerBtn,
                pressed && styles.dangerBtnPressed,
              ]}
            >
              <Text style={styles.dangerBtnText}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>EDC Squad Sync v1.0.0</Text>
          <View style={styles.appLinks}>
            <Pressable
              onPress={() => handleLinkPress('privacy')}
              accessibilityLabel="Privacy policy"
              accessibilityRole="link"
            >
              <Text style={styles.appLink}>Privacy</Text>
            </Pressable>
            <Pressable
              onPress={() => handleLinkPress('terms')}
              accessibilityLabel="Terms of service"
              accessibilityRole="link"
            >
              <Text style={styles.appLink}>Terms</Text>
            </Pressable>
            <Pressable
              onPress={() => handleLinkPress('about')}
              accessibilityLabel="About this app"
              accessibilityRole="link"
            >
              <Text style={styles.appLink}>About</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  dangerCard: {
    backgroundColor: 'rgba(229, 64, 79, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(229, 64, 79, 0.15)',
    borderRadius: radii.lg,
    padding: 16,
    alignItems: 'center',
  },
  dangerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(229, 64, 79, 0.3)',
    backgroundColor: 'transparent',
    minHeight: 44, // Touch target
  },
  dangerBtnPressed: {
    backgroundColor: 'rgba(229, 64, 79, 0.1)',
    borderColor: 'rgba(229, 64, 79, 0.4)',
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: typography.weight.semibold,
    color: colors.accent,
  },
  appInfo: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: typography.weight.medium,
    marginBottom: 10,
  },
  appLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  appLink: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
