import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function NetworkDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;

  const updateResult = (test: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setResults(prev => {
      const index = prev.findIndex(r => r.test === test);
      const newResult = { test, status, message, details };
      if (index >= 0) {
        const newResults = [...prev];
        newResults[index] = newResult;
        return newResults;
      }
      return [...prev, newResult];
    });
  };

  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);

    // Test 1: Network Connectivity
    updateResult('network', 'running', 'Checking network connectivity...');
    try {
      const netInfo = await NetInfo.fetch();
      updateResult('network', 'success', `Connected: ${netInfo.isConnected}, Type: ${netInfo.type}`, netInfo);
    } catch (error) {
      updateResult('network', 'error', `Failed: ${error}`, error);
    }

    // Test 2: AsyncStorage
    updateResult('storage', 'running', 'Testing AsyncStorage...');
    try {
      await AsyncStorage.setItem('test_key', 'test_value');
      const value = await AsyncStorage.getItem('test_key');
      await AsyncStorage.removeItem('test_key');
      updateResult('storage', 'success', `AsyncStorage working: ${value === 'test_value'}`, { value });
    } catch (error) {
      updateResult('storage', 'error', `Failed: ${error}`, error);
    }

    // Test 3: Environment Variables
    updateResult('env', 'running', 'Checking environment variables...');
    try {
      const url = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
      const key = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      const hasUrl = !!url && url.startsWith('https://');
      const hasKey = !!key && key.length > 50;
      if (hasUrl && hasKey) {
        updateResult('env', 'success', `Environment vars present`, { url, keyLength: key?.length });
      } else {
        updateResult('env', 'error', `Missing environment variables`, { hasUrl, hasKey });
      }
    } catch (error) {
      updateResult('env', 'error', `Failed: ${error}`, error);
    }

    // Test 4: Basic Fetch API
    updateResult('fetch', 'running', 'Testing fetch API...');
    try {
      const response = await fetch('https://httpbin.org/json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      updateResult('fetch', 'success', `Fetch working: ${response.status}`, { status: response.status, data });
    } catch (error: any) {
      updateResult('fetch', 'error', `Failed: ${error.message}`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // Test 5: Supabase URL Fetch
    if (supabaseUrl) {
      updateResult('supabase-url', 'running', 'Testing Supabase URL...');
      try {
        const response = await fetch(supabaseUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        updateResult('supabase-url', 'success', `Supabase reachable: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });
      } catch (error: any) {
        updateResult('supabase-url', 'error', `Failed: ${error.message}`, {
          message: error.message,
          stack: error.stack,
          name: error.name,
          cause: error.cause,
        });
      }
    }

    // Test 6: Supabase Auth Endpoint
    if (supabaseUrl) {
      updateResult('supabase-auth', 'running', 'Testing Supabase auth endpoint...');
      try {
        const authUrl = `${supabaseUrl}/auth/v1/signup`;
        console.log('Testing auth URL:', authUrl);

        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'test123456',
          }),
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }

        updateResult('supabase-auth', response.ok ? 'success' : 'error',
          `Auth endpoint response: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data,
        });
      } catch (error: any) {
        updateResult('supabase-auth', 'error', `Failed: ${error.message}`, {
          message: error.message,
          stack: error.stack,
          name: error.name,
          cause: error.cause,
        });
      }
    }

    setRunning(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Diagnostics</Text>
      <Text style={styles.subtitle}>Test network and Supabase connectivity</Text>

      <TouchableOpacity
        style={[styles.button, running && styles.buttonDisabled]}
        onPress={runDiagnostics}
        disabled={running}
      >
        {running ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Run Diagnostics</Text>
        )}
      </TouchableOpacity>

      {results.map((result) => (
        <View key={result.test} style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTest}>{result.test}</Text>
            <View style={[
              styles.statusBadge,
              result.status === 'success' && styles.statusSuccess,
              result.status === 'error' && styles.statusError,
              result.status === 'running' && styles.statusRunning,
            ]}>
              <Text style={styles.statusText}>{result.status}</Text>
            </View>
          </View>
          <Text style={styles.resultMessage}>{result.message}</Text>
          {result.details && (
            <ScrollView horizontal style={styles.detailsContainer}>
              <Text style={styles.detailsText}>
                {JSON.stringify(result.details, null, 2)}
              </Text>
            </ScrollView>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    padding: 12,
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
  },
  resultCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  statusSuccess: {
    backgroundColor: colors.accentGreen,
  },
  statusError: {
    backgroundColor: colors.accentRed,
  },
  statusRunning: {
    backgroundColor: colors.accentBlue,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resultMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  detailsContainer: {
    maxHeight: 150,
  },
  detailsText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Courier',
  },
});
