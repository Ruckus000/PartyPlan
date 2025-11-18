import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import PlansScreen from './src/screens/PlansScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import Fab from './src/components/Fab';
import AddModal from './src/components/AddModal';
import ErrorBoundary from './src/components/ErrorBoundary';
import { BottomNav, TabConfig } from './src/components/navigation/BottomNav';
import {
  HomeIconOutline,
  HomeIconFilled,
  PlansIconOutline,
  PlansIconFilled,
  ProfileIconOutline,
  ProfileIconFilled,
} from './src/components/icons/TabIcons';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import { Session } from '@supabase/supabase-js';
import { useStore } from './src/lib/store';
import { Squad } from './src/types';
import { useSyncManager } from './src/hooks/useSyncManager';
import { useDebouncedPersistence } from './src/hooks/useDebouncedPersistence';
import { SyncProvider } from './src/contexts/SyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { colors } from './src/theme/tokens';

type Tab = 'Home' | 'Plans' | 'Profile';

// Debounce delay for AsyncStorage writes (reduces disk I/O and battery usage)
const PERSISTENCE_DEBOUNCE_MS = 500;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const { profile, setProfile, modalVisible, setModalVisible, pendingOperations, plans, setIsOffline } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Home');

  // Initialize sync manager (only active when logged in with squads)
  const syncManager = useSyncManager();

  // Network detection - update offline state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, [setIsOffline]);

  // Debounced persistence for pending operations and plans (reduces disk I/O and battery usage)
  useDebouncedPersistence('pendingOps', pendingOperations, PERSISTENCE_DEBOUNCE_MS);
  useDebouncedPersistence('plans', plans, PERSISTENCE_DEBOUNCE_MS);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);

      // Check session FIRST before loading cached data
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Logged in: Load from AsyncStorage first (for offline support)
        try {
          const [cachedPendingOps, cachedPlans] = await Promise.all([
            AsyncStorage.getItem('pendingOps'),
            AsyncStorage.getItem('plans'),
          ]);

          if (cachedPendingOps) {
            const ops = JSON.parse(cachedPendingOps);
            useStore.getState().setPendingOperations(ops);
          }

          if (cachedPlans) {
            const parsedPlans = JSON.parse(cachedPlans);
            useStore.getState().setPlans(parsedPlans);
          }
        } catch (error) {
          console.error('Failed to load cached data:', error);
        }
      } else {
        // Not logged in: Fetch plans from DB (for attendees), skip AsyncStorage
        // This ensures we show attendees even when not logged in
        // and avoids loading wrong user's cached data
        try {
          const { data: plansData } = await supabase
            .from('plans')
            .select('*, profiles!created_by(emoji, display_name)')
            .is('squad_id', null);

          if (plansData) {
            // Transform the data to match our Plan type
            const transformedPlans = plansData.map((plan: any) => ({
              ...plan,
              profile: plan.profiles ? {
                emoji: plan.profiles.emoji,
                display_name: plan.profiles.display_name,
              } : undefined,
            }));
            useStore.getState().setPlans(transformedPlans);
          }
        } catch (error) {
          console.error('Failed to fetch plans for unauthenticated state:', error);
        }
      }

      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);

        // Fetch user's squads (via squad_members join)
        const { data: squadMemberships } = await supabase
          .from('squad_members')
          .select('squad_id, squads(*)')
          .eq('profile_id', session.user.id);

        if (squadMemberships && squadMemberships.length > 0) {
          // Use type guard to filter out null squads safely
          const squads = squadMemberships
            .map((m: any) => m.squads as Squad | null)
            .filter((s): s is Squad => s !== null);

          useStore.getState().setSquads(squads);

          // Set first squad as active (or find "My Schedule")
          // Guard against empty squads array after filtering
          if (squads.length > 0) {
            const mySchedule = squads.find(s => s.name === 'My Schedule');
            const activeSquad = mySchedule || squads[0];
            useStore.getState().setActiveSquadId(activeSquad.id);

            // Fetch plans for active squad (ALL plans, not just user's)
            const { data: plansData } = await supabase
              .from('plans')
              .select('*, profiles!created_by(emoji, display_name)')
              .eq('squad_id', activeSquad.id);

            if (plansData) {
              // Transform the data to match our Plan type (Supabase returns profiles as nested object)
              const transformedPlans = plansData.map((plan: any) => ({
                ...plan,
                profile: plan.profiles ? {
                  emoji: plan.profiles.emoji,
                  display_name: plan.profiles.display_name,
                } : undefined,
              }));
              useStore.getState().setPlans(transformedPlans);
            }
          } else {
            // No squads, fetch ALL individual plans (from all users)
            const { data: plansData } = await supabase
              .from('plans')
              .select('*, profiles!created_by(emoji, display_name)')
              .is('squad_id', null);

            if (plansData) {
              // Transform the data to match our Plan type
              const transformedPlans = plansData.map((plan: any) => ({
                ...plan,
                profile: plan.profiles ? {
                  emoji: plan.profiles.emoji,
                  display_name: plan.profiles.display_name,
                } : undefined,
              }));
              useStore.getState().setPlans(transformedPlans);
            }
          }
        } else {
          // No squad memberships, fetch ALL individual plans (from all users)
          const { data: plansData } = await supabase
            .from('plans')
            .select('*, profiles!created_by(emoji, display_name)')
            .is('squad_id', null);

          if (plansData) {
            // Transform the data to match our Plan type
            const transformedPlans = plansData.map((plan: any) => ({
              ...plan,
              profile: plan.profiles ? {
                emoji: plan.profiles.emoji,
                display_name: plan.profiles.display_name,
              } : undefined,
            }));
            useStore.getState().setPlans(transformedPlans);
          }
        }
      }
      // Note: When not logged in, plans are already fetched above (before this if block)
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        useStore.getState().setSquads([]);
        useStore.getState().setActiveSquadId(null);
        // Fetch plans from DB for unauthenticated state (to show attendees)
        try {
          const { data: plansData } = await supabase
            .from('plans')
            .select('*, profiles!created_by(emoji, display_name)')
            .is('squad_id', null);

          if (plansData) {
            const transformedPlans = plansData.map((plan: any) => ({
              ...plan,
              profile: plan.profiles ? {
                emoji: plan.profiles.emoji,
                display_name: plan.profiles.display_name,
              } : undefined,
            }));
            useStore.getState().setPlans(transformedPlans);
          } else {
            useStore.getState().setPlans([]);
          }
        } catch (error) {
          console.error('Failed to fetch plans for unauthenticated state:', error);
          useStore.getState().setPlans([]);
        }
      } else {
        fetchSessionAndProfile(); // Re-fetch profile on login
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleProfileSetupComplete = async () => {
    setLoading(true);
    if (session) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(profileData);
    }
    setLoading(false);
  };

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // Login screen disabled for now
  // if (!session) {
  //   return <AuthScreen />;
  // }

  // Profile setup disabled for now
  // if (!profile?.display_name) {
  //   return <ProfileSetupScreen onProfileSetupComplete={handleProfileSetupComplete} />;
  // }

  // Memoize active screen to prevent unnecessary re-renders
  const ActiveScreen = useMemo(() => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Plans':
        return <PlansScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  }, [activeTab]);

  // Memoize tab press handlers to prevent recreation on every render
  const handleHomePress = useCallback(() => setActiveTab('Home'), []);
  const handlePlansPress = useCallback(() => setActiveTab('Plans'), []);
  const handleProfilePress = useCallback(() => setActiveTab('Profile'), []);

  // Static tab configuration (icons and labels)
  const tabData: {
    key: Tab;
    label: string;
    iconOutline: React.ReactNode;
    iconFilled: React.ReactNode;
    onPress: () => void;
  }[] = useMemo(
    () => [
      {
        key: 'Home',
        label: 'Home',
        iconOutline: <HomeIconOutline />,
        iconFilled: <HomeIconFilled />,
        onPress: handleHomePress,
      },
      {
        key: 'Plans',
        label: 'Plans',
        iconOutline: <PlansIconOutline />,
        iconFilled: <PlansIconFilled />,
        onPress: handlePlansPress,
      },
      {
        key: 'Profile',
        label: 'Profile',
        iconOutline: <ProfileIconOutline />,
        iconFilled: <ProfileIconFilled />,
        onPress: handleProfilePress,
      },
    ],
    [handleHomePress, handlePlansPress, handleProfilePress]
  );

  // Configure bottom nav tabs with dynamic state
  const tabs: TabConfig[] = useMemo(
    () =>
      tabData.map((tab) => ({
        ...tab,
        isActive: activeTab === tab.key,
        ...(tab.key === 'Plans' && { showBadge: pendingOperations.length > 0 }),
      })),
    [activeTab, pendingOperations.length, tabData]
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SyncProvider value={syncManager}>
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
            <View style={styles.content}>
              {ActiveScreen}
            </View>
            <BottomNav tabs={tabs} />
            <Fab onPress={() => setModalVisible(true)} />
            <AddModal visible={modalVisible} onClose={() => setModalVisible(false)} />
          </SafeAreaView>
        </SyncProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
});
