import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setLoading, setError } from '../redux/slices/authSlice';
import { CustomInput, Button } from '../components';
import apiService from '../services/apiService';

export const EmailLoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestLink = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailError('');
    dispatch(setLoading(true));

    try {
      const response = await apiService.requestMagicLink(email);

      // Show success message
      Alert.alert(
        'Check Your Email',
        `We've sent a login link to ${email}. Please check your email and click the link to sign in.`,
        [{ text: 'OK' }]
      );

      // In development, also show the link for testing
      if (__DEV__ && response.magic_link) {
        console.log('Magic Link (Dev Only):', response.magic_link);
        console.log('Token (Dev Only):', response.token);
        
        // Optional: Show in alert for easier testing
        setTimeout(() => {
          Alert.alert(
            'Development Mode',
            `Magic Link Token: ${response.token}\n\nTap to copy and use for testing.`,
            [
              {
                text: 'OK',
              },
            ]
          );
        }, 500);
      }

      dispatch(setLoading(false));
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.error || 'Failed to send login link. Please try again.';
      dispatch(setError(errorMessage));

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Sign in with your email to get started
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.formContainer}>
            <CustomInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
              editable={!isLoading}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Submit Button */}
            <Button
              title={isLoading ? 'Sending...' : 'Send Login Link'}
              onPress={handleRequestLink}
              disabled={isLoading}
              style={styles.submitButton}
            />

            {isLoading && (
              <ActivityIndicator
                size="large"
                color="#2A75CF"
                style={styles.loader}
              />
            )}
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              We'll send you a secure login link. Click the link in your email to
              sign in instantly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 24,
  },
  loader: {
    marginTop: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  infoContainer: {
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
