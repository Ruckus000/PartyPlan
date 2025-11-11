
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { authService } from '../lib/authService';

const colors = {
  bgSecondary: '#0a0a0a',
  textPrimary: '#ffffff',
  accentBlue: '#3b82f6',
  accentRed: '#ef4444',
  accentYellow: '#f59e0b',
  accentGreen: '#10b981',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textSecondary: '#a0a0a0',
};

const validatePassword = (pwd: string) => {
  const hasMinLength = pwd.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
  return { hasMinLength, hasLetter, hasNumber, hasSymbol };
};

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Monitor network connectivity (keep logic but no UI)
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      console.log(`Network: ${state.isConnected ? 'Connected' : 'Disconnected'} (${state.type})`);
    });
    return () => unsubscribe();
  }, []);

  // Clear password error when switching between sign up and sign in
  useEffect(() => {
    setPasswordError('');
    setConfirmPassword('');
  }, [isSignUp]);

  const handleAuthAction = async () => {
    // Clear previous errors
    setPasswordError('');

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Validate password requirements for sign up
    if (isSignUp) {
      const validation = validatePassword(password);
      if (!validation.hasMinLength || !validation.hasLetter || !validation.hasNumber || !validation.hasSymbol) {
        setPasswordError('Password must be at least 6 letters with 1 number and 1 symbol');
        return;
      }

      // Check password match
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
    }

    // Check network connectivity first
    if (isConnected === false) {
      Alert.alert('No Internet', 'Please check your internet connection and try again.');
      return;
    }

    setLoading(true);

    try {
      const result = isSignUp
        ? await authService.signUp(email, password)
        : await authService.signIn(email, password);

      if (result.error) {
        const errorMessage = result.error.message.toLowerCase();

        // Display password-related errors in the indicator
        if (errorMessage.includes('user already exists') || errorMessage.includes('already registered')) {
          setPasswordError('This email is already registered. Sign in instead?');
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
          setPasswordError('Incorrect email or password');
        } else if (errorMessage.includes('password') && (result.error.status === 422 || result.error.status === 400)) {
          setPasswordError('Password must be at least 6 letters with 1 number and 1 symbol');
        } else if (errorMessage.includes('email not confirmed')) {
          Alert.alert(
            'Email Not Confirmed',
            'Please check your email and click the confirmation link before signing in.'
          );
        } else if (result.error.status === 0) {
          Alert.alert(
            'Network Error',
            'Unable to connect to the server. Please check your internet connection and try again.'
          );
        } else {
          setPasswordError(result.error.message);
        }
      } else {
        // Success - clear any errors
        setPasswordError('');
        if (isSignUp) {
          if (result.session) {
            // Session created, user is logged in
          } else {
            // Email confirmation required
            Alert.alert(
              'Success!',
              'Account created! Please check your email to verify your account before signing in.',
              [{ text: 'OK', onPress: () => setIsSignUp(false) }]
            );
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      Alert.alert(
        'Network Error',
        `${err.message || 'Unknown error'}\n\nType: ${err.name}`
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);
  const isPasswordValid = passwordValidation.hasMinLength &&
    passwordValidation.hasLetter &&
    passwordValidation.hasNumber &&
    passwordValidation.hasSymbol;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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

        {/* Password Strength Indicator */}
        {(isSignUp && password.length > 0) || passwordError ? (
          <View style={[
            styles.passwordIndicator,
            passwordError && styles.passwordIndicatorError,
            !passwordError && isPasswordValid && password.length > 0 && styles.passwordIndicatorValid
          ]}>
            {passwordError ? (
              <Text style={styles.passwordIndicatorTextError}>{passwordError}</Text>
            ) : isSignUp && password.length > 0 ? (
              <View>
                <Text style={styles.passwordIndicatorTitle}>Password requirements:</Text>
                <Text style={[
                  styles.passwordRequirement,
                  passwordValidation.hasMinLength && passwordValidation.hasLetter && styles.passwordRequirementMet
                ]}>
                  {passwordValidation.hasMinLength && passwordValidation.hasLetter ? '✓' : '○'} At least 6 letters
                </Text>
                <Text style={[
                  styles.passwordRequirement,
                  passwordValidation.hasNumber && styles.passwordRequirementMet
                ]}>
                  {passwordValidation.hasNumber ? '✓' : '○'} Contains 1 number
                </Text>
                <Text style={[
                  styles.passwordRequirement,
                  passwordValidation.hasSymbol && styles.passwordRequirementMet
                ]}>
                  {passwordValidation.hasSymbol ? '✓' : '○'} Contains 1 symbol
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError(''); // Clear error when user types
          }}
          autoCapitalize="none"
          secureTextEntry
          editable={!loading}
        />

        {/* Confirm Password Field - Only for Sign Up */}
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setPasswordError(''); // Clear error when user types
            }}
            autoCapitalize="none"
            secureTextEntry
            editable={!loading}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleAuthAction} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
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
  passwordIndicator: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  passwordIndicatorError: {
    borderColor: colors.accentRed,
  },
  passwordIndicatorValid: {
    borderColor: colors.accentGreen,
  },
  passwordIndicatorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  passwordRequirement: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  passwordRequirementMet: {
    color: colors.accentGreen,
  },
  passwordIndicatorTextError: {
    fontSize: 12,
    color: colors.accentRed,
    fontWeight: '500',
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
});
