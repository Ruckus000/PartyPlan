
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { authService } from '../lib/authService';
import NetworkDiagnostics from '../components/NetworkDiagnostics';
import TestAuthScreen from './TestAuthScreen';

const colors = {
  bgSecondary: '#0a0a0a',
  textPrimary: '#ffffff',
  accentBlue: '#3b82f6',
  accentRed: '#ef4444',
  accentYellow: '#f59e0b',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textSecondary: '#a0a0a0',
};

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showTestScreen, setShowTestScreen] = useState(false);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      logError(`Network: ${state.isConnected ? 'Connected' : 'Disconnected'} (${state.type})`);
    });
    return () => unsubscribe();
  }, []);

  const logError = (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, message);
    setErrorLog(prev => [`[${timestamp.split('T')[1].split('.')[0]}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Check network connectivity first
    if (isConnected === false) {
      Alert.alert('No Internet', 'Please check your internet connection and try again.');
      logError('❌ Auth attempt blocked: No internet connection');
      return;
    }

    setLoading(true);
    logError(`🔐 Starting ${isSignUp ? 'sign up' : 'sign in'} for ${email}`);

    try {
      logError('📡 Calling Supabase auth API via direct fetch...');

      const startTime = Date.now();
      const result = isSignUp 
        ? await authService.signUp(email, password)
        : await authService.signIn(email, password);
      const duration = Date.now() - startTime;

      logError(`⏱️ API call completed in ${duration}ms`);

      if (result.error) {
        logError(`❌ Auth error: ${result.error.message}`);
        logError(`📄 Error details: ${JSON.stringify({
          status: result.error.status,
          code: result.error.code,
        })}`);

        // Smart error handling based on status code and message
        const errorMessage = result.error.message.toLowerCase();

        if (errorMessage.includes('user already exists') || errorMessage.includes('already registered')) {
          // User exists - suggest signing in
          Alert.alert(
            'Account Already Exists',
            'This email is already registered. Would you like to sign in instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign In',
                onPress: () => setIsSignUp(false),
                style: 'default'
              }
            ]
          );
        } else if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid email or password')) {
          // Wrong credentials
          Alert.alert(
            'Invalid Credentials',
            'The email or password you entered is incorrect. Please try again.'
          );
        } else if (errorMessage.includes('email not confirmed')) {
          // Email not confirmed
          Alert.alert(
            'Email Not Confirmed',
            'Please check your email and click the confirmation link before signing in.'
          );
        } else if (errorMessage.includes('password') && (result.error.status === 422 || result.error.status === 400)) {
          // Password validation error
          Alert.alert(
            'Invalid Password',
            'Password must be at least 6 characters long.'
          );
        } else if (result.error.status === 0) {
          // Network error (status 0 means request didn't reach server)
          Alert.alert(
            'Network Error',
            'Unable to connect to the server. Please check your internet connection and try again.'
          );
        } else {
          // Generic error with details
          Alert.alert(
            'Authentication Error',
            `${result.error.message}\n\n${result.error.status ? `Status: ${result.error.status}` : 'Check error log for details'}`
          );
        }
      } else {
        logError('✅ Auth successful!');
        if (isSignUp) {
          if (result.session) {
            // Session created, user is logged in
            logError('🎉 Sign up successful and logged in!');
          } else {
            // Email confirmation required
            Alert.alert(
              'Success!',
              'Account created! Please check your email to verify your account before signing in.',
              [{ text: 'OK', onPress: () => setIsSignUp(false) }]
            );
          }
        } else {
          logError('🎉 Sign in successful!');
        }
      }
    } catch (err: any) {
      logError(`🚨 Exception caught: ${err.name} - ${err.message}`);
      logError(`📝 Stack: ${err.stack?.substring(0, 200)}`);
      logError(`🔍 Error type: ${typeof err}`);
      logError(`🔑 Error keys: ${Object.keys(err).join(', ')}`);

      // Log full error object
      try {
        logError(`📦 Full error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      } catch (e) {
        logError(`⚠️ Could not stringify error`);
      }

      Alert.alert(
        'Network Error',
        `${err.message || 'Unknown error'}\n\nType: ${err.name}\nPlease check the error log and diagnostics below.`
      );
    } finally {
      setLoading(false);
      logError('🏁 Auth attempt completed');
    }
  };

  if (showTestScreen) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowTestScreen(false)}
        >
          <Text style={styles.backButtonText}>← Back to Auth</Text>
        </TouchableOpacity>
        <TestAuthScreen />
      </View>
    );
  }

  if (showDiagnostics) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowDiagnostics(false)}
        >
          <Text style={styles.backButtonText}>← Back to Auth</Text>
        </TouchableOpacity>
        <NetworkDiagnostics />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Network Status Indicator */}
      <View style={[
        styles.networkIndicator,
        isConnected === true && styles.networkConnected,
        isConnected === false && styles.networkDisconnected,
      ]}>
        <Text style={styles.networkText}>
          {isConnected === null ? '⏳ Checking...' : isConnected ? '✅ Connected' : '❌ No Internet'}
        </Text>
      </View>

      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={styles.subtitle}>Enter your details to get started.</Text>

      <TextInput
        style={styles.input}
        placeholder="your.email@example.com"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="At least 6 characters"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity style={styles.button} onPress={handleAuthAction} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
        </Text>
      </TouchableOpacity>

      {/* Diagnostics Buttons */}
      <TouchableOpacity
        style={styles.diagnosticsButton}
        onPress={() => setShowDiagnostics(true)}
      >
        <Text style={styles.diagnosticsButtonText}>🔧 Run Network Diagnostics</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.diagnosticsButton, { borderColor: colors.accentBlue, marginTop: 12 }]}
        onPress={() => setShowTestScreen(true)}
      >
        <Text style={[styles.diagnosticsButtonText, { color: colors.accentBlue }]}>🧪 Test Direct API Call</Text>
      </TouchableOpacity>

      {/* Error Log */}
      {errorLog.length > 0 && (
        <View style={styles.errorLogContainer}>
          <Text style={styles.errorLogTitle}>Error Log (last 10):</Text>
          {errorLog.map((log, index) => (
            <Text key={index} style={styles.errorLogText}>{log}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  networkIndicator: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkConnected: {
    borderColor: colors.accentBlue,
  },
  networkDisconnected: {
    borderColor: colors.accentRed,
  },
  networkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
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
  toggleButton: {
    marginTop: 24,
  },
  toggleText: {
    color: colors.accentBlue,
  },
  diagnosticsButton: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accentYellow,
    alignItems: 'center',
    marginTop: 24,
  },
  diagnosticsButtonText: {
    color: colors.accentYellow,
    fontWeight: '600',
  },
  backButton: {
    padding: 12,
    marginBottom: 8,
  },
  backButtonText: {
    color: colors.accentBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  errorLogContainer: {
    width: '100%',
    marginTop: 24,
    padding: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorLogTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorLogText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Courier',
    marginBottom: 4,
  },
});
