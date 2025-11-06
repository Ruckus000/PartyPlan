
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const colors = {
  bgSecondary: '#0a0a0a',
  textPrimary: '#ffffff',
  accentBlue: '#3b82f6',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textSecondary: '#a0a0a0',
};

export default function ProfileSetupScreen({ onProfileSetupComplete }: { onProfileSetupComplete: () => void }) {
  const [displayName, setDisplayName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSetup = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName,
        emoji,
        updated_at: new Date(),
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        onProfileSetupComplete();
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>
      <Text style={styles.subtitle}>Choose a name and emoji for your account.</Text>

      <TextInput
        style={styles.input}
        placeholder="Display Name"
        placeholderTextColor="#888"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Emoji (e.g., 😎)"
        placeholderTextColor="#888"
        value={emoji}
        onChangeText={setEmoji}
        maxLength={2} // Emojis can be 2 chars
      />

      <TouchableOpacity style={styles.button} onPress={handleProfileSetup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
