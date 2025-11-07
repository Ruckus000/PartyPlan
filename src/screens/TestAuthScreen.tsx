import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Constants from 'expo-constants';

const colors = {
  bgSecondary: '#0a0a0a',
  textPrimary: '#ffffff',
  accentBlue: '#3b82f6',
  accentGreen: '#10b981',
  accentRed: '#ef4444',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textSecondary: '#a0a0a0',
};

export default function TestAuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev.slice(0, 19)]);
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setLogs([]);

    addLog('🧪 Starting direct API test...');
    addLog(`📍 URL: ${supabaseUrl}`);
    addLog(`🔑 Key length: ${supabaseAnonKey?.length}`);

    if (!supabaseUrl || !supabaseAnonKey) {
      addLog('❌ Missing Supabase credentials');
      Alert.alert('Error', 'Supabase credentials not found');
      setLoading(false);
      return;
    }

    try {
      const authUrl = `${supabaseUrl}/auth/v1/signup`;
      addLog(`🌐 Calling: ${authUrl}`);

      const requestBody = {
        email,
        password,
      };

      addLog(`📤 Request body: ${JSON.stringify(requestBody)}`);

      const headers = {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      };

      addLog(`📋 Headers: ${JSON.stringify(Object.keys(headers))}`);

      const startTime = Date.now();

      addLog('⏳ Sending request...');

      const response = await fetch(authUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;

      addLog(`⏱️ Response received in ${duration}ms`);
      addLog(`📊 Status: ${response.status} ${response.statusText}`);
      addLog(`🏷️ Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

      const responseText = await response.text();
      addLog(`📄 Response body length: ${responseText.length}`);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        addLog(`✅ Parsed JSON response`);
        addLog(`📦 Response keys: ${Object.keys(responseData).join(', ')}`);
      } catch (e) {
        addLog(`⚠️ Could not parse JSON: ${responseText.substring(0, 100)}`);
        responseData = responseText;
      }

      if (response.ok) {
        addLog(`✅ SUCCESS: Auth request completed`);
        Alert.alert('Success', 'Direct API call succeeded!\n\nCheck logs for details.');
      } else {
        addLog(`❌ ERROR: ${JSON.stringify(responseData)}`);
        Alert.alert('Error', `API returned ${response.status}\n\n${JSON.stringify(responseData, null, 2).substring(0, 200)}`);
      }

    } catch (error: any) {
      addLog(`🚨 EXCEPTION: ${error.name}`);
      addLog(`📝 Message: ${error.message}`);
      addLog(`🔍 Type: ${typeof error}`);
      addLog(`🔑 Keys: ${Object.keys(error).join(', ')}`);

      if (error.stack) {
        addLog(`📚 Stack: ${error.stack.substring(0, 300)}`);
      }

      try {
        addLog(`📦 Stringified: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      } catch (e) {
        addLog(`⚠️ Could not stringify error`);
      }

      Alert.alert(
        'Exception Caught',
        `${error.name}: ${error.message}\n\nCheck logs below for full details.`
      );
    } finally {
      setLoading(false);
      addLog('🏁 Test completed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Direct API Test</Text>
      <Text style={styles.subtitle}>Bypass Supabase SDK to isolate issues</Text>

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="your.email@example.com"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        placeholderTextColor="#666"
        autoCapitalize="none"
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testDirectFetch}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '⏳ Testing...' : '🧪 Test Direct API Call'}
        </Text>
      </TouchableOpacity>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Test Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
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
    padding: 16,
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  logsContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
  },
  logsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  logText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Courier',
    marginBottom: 4,
  },
});
