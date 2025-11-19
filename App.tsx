import React, { useState, useEffect } from 'react';
import TimelineScreen from './src/screens/TimelineScreen';
import SquadScreen from './src/screens/SquadScreen';
import MapScreen from './src/screens/MapScreen';
import Fab from './src/components/Fab';
import AddModal from './src/components/AddModal';
import ErrorBoundary from './src/components/ErrorBoundary';
import CustomTabBar from './src/components/CustomTabBar';
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
import { colors } from './src/constants/colors';

type Tab = 'Timeline' | 'Squad' | 'Map';

// TEMPORARY: Set to true to bypass login requirement
const BYPASS_LOGIN = true;

// Debounce delay for AsyncStorage writes (reduces disk I/O and battery usage)
const PERSISTENCE_DEBOUNCE_MS = 500;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const { profile, setProfile, modalVisible, setModalVisible, pendingOperations, plans, setIsOffline } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Timeline');

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

      // Load cached data from AsyncStorage
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

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

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
              .select('*')
              .eq('squad_id', activeSquad.id);

            if (plansData) {
              useStore.getState().setPlans(plansData);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        useStore.getState().setSquads([]);
        useStore.getState().setActiveSquadId(null);
        useStore.getState().setPlans([]);
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
    return <View style={{ flex: 1, backgroundColor: colors.bgSecondary }} />;
  }

  // TEMPORARY: Bypass login check
  if (!BYPASS_LOGIN && !session) {
    return <AuthScreen />;
  }

  // TEMPORARY: Bypass profile setup check
  if (!BYPASS_LOGIN && !profile?.display_name) {
    return <ProfileSetupScreen onProfileSetupComplete={handleProfileSetupComplete} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Timeline':
        return <TimelineScreen />;
      case 'Squad':
        return <SquadScreen />;
      case 'Map':
        return <MapScreen />;
      default:
        return <TimelineScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SyncProvider value={syncManager}>
          <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bgPrimary} />
            <CustomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <View style={styles.content}>
              {renderScreen()}
            </View>
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
    backgroundColor: colors.bgSecondary,
  },
  content: {
    flex: 1,
  },
});
