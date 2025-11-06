
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TimelineScreen from './src/screens/TimelineScreen';
import SquadScreen from './src/screens/SquadScreen';
import MapScreen from './src/screens/MapScreen';
import Fab from './src/components/Fab';
import AddModal from './src/components/AddModal';
import { View } from 'react-native';
import { supabase } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import { Session } from '@supabase/supabase-js';

const Tab = createBottomTabNavigator();

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

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

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
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
    return <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (!profile?.display_name) {
    return <ProfileSetupScreen onProfileSetupComplete={handleProfileSetupComplete} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Timeline" component={TimelineScreen} />
          <Tab.Screen name="Squad" component={SquadScreen} />
          <Tab.Screen name="Map" component={MapScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <Fab onPress={() => setModalVisible(true)} />
      <AddModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}
