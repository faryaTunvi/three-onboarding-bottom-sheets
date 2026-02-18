import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setLoading, setError } from '../redux/slices/authSlice';
import { CustomInput, Button } from '../components';
import apiService from '../services/apiService';
import { useNavigation } from '@react-navigation/native';

export const EmailLoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Handle deep link when app is already open (warm start) or on mount (cold start)
  useEffect(() => {
    console.log('🔗 EmailLoginScreen: Setting up deep link listener');

    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('🔗 Deep link received (warm start):', url);
      handleMagicLink(url);
    };

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (cold start) - use setTimeout to ensure navigation is ready
    const checkInitialUrl = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          console.log('🔗 Initial URL (cold start):', url);
          // Delay to ensure navigation is ready
          setTimeout(() => {
            handleMagicLink(url);
          }, 500);
        }
      } catch (error) {
        console.error('❌ Error getting initial URL:', error);
      }
    };

    checkInitialUrl();

    return () => {
      console.log('🔗 EmailLoginScreen: Removing deep link listener');
      subscription.remove();
    };
  }, []);

  const handleMagicLink = (url: string) => {
    console.log('🔍 Processing magic link:', url);
    
    // Extract token from URL
    const token = extractTokenFromUrl(url);
    
    if (token) {
      console.log('✅ Token extracted successfully:', token);
      console.log('🚀 Navigating to VerifyEmail screen...');
      
      // Navigate to VerifyEmailScreen with token
      try {
        navigation.navigate('VerifyEmail', { token });
        console.log('✅ Navigation dispatched with token:', token);
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        Alert.alert('Error', 'Failed to navigate to verification screen');
      }
    } else {
      console.log('⚠️ No token found in URL');
      Alert.alert(
        'Invalid Link',
        'The verification link appears to be invalid. Please request a new one.'
      );
    }
  };

  const extractTokenFromUrl = (url: string): string | null => {
    try {
      console.log('🔍 Parsing URL:', url);
      
      // Method 1: Check for query parameter token (?token=xxx)
      const queryMatch = url.match(/[?&]token=([^&]+)/);
      if (queryMatch && queryMatch[1]) {
        const token = decodeURIComponent(queryMatch[1]);
        console.log('✅ Token found in query parameter:', token);
        return token;
      }
      
      // Method 2: Check for path-based token after /verify/ or /auth/
      const pathMatch = url.match(/\/(verify|auth)\/([^/?#]+)/);
      if (pathMatch && pathMatch[2]) {
        const token = decodeURIComponent(pathMatch[2]);
        console.log('✅ Token found in path:', token);
        return token;
      }
      
      // Method 3: Extract last segment if it looks like a token
      const segments = url.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      
      // Remove query string if present
      const cleanSegment = lastSegment?.split('?')[0];
      
      // Check if it's a token-like string
      if (
        cleanSegment && 
        cleanSegment !== 'verify' && 
        cleanSegment !== 'auth' &&
        /^[a-zA-Z0-9_-]+$/.test(cleanSegment) &&
        cleanSegment.length > 10
      ) {
        const token = decodeURIComponent(cleanSegment);
        console.log('✅ Token found as last segment:', token);
        return token;
      }
      
      console.log('❌ No token found in URL');
      return null;
    } catch (error) {
      console.error('❌ Error parsing URL:', error);
      return null;
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getNetworkErrorMessage = (): string => {
    const baseUrl = apiService.getApiBaseUrl();
    return `Cannot connect to server at ${baseUrl}\n\nPlease check:\n• Backend server is running\n• Network connection is active\n• API URL is correctly configured`;
  };

  const getTimeoutErrorMessage = (): string => {
    const baseUrl = apiService.getApiBaseUrl();
    return `Request timed out while connecting to ${baseUrl}\n\nPlease check:\n• Backend server is running and responsive\n• Network connection is stable\n• Server is not overloaded\n• Try again in a moment`;
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
    dispatch(setError('')); // Clear previous errors

    try {
      const response = await apiService.requestMagicLink(email);

      dispatch(setLoading(false));

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
            `Magic Link Token: ${response.token}\n\nFull Link: ${response.magic_link}\n\nTap "Test Link" to auto-navigate.`,
            [
              {
                text: 'OK',
              },
              {
                text: 'Test Link',
                onPress: () => {
                  console.log('📱 Testing magic link navigation...');
                  navigation.navigate('VerifyEmail', { token: response.token });
                }
              }
            ]
          );
        }, 500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = 'Failed to send login link. Please try again.';
      let alertTitle = 'Error';
      
      // Handle timeout errors specifically
      if (err.code === 'ECONNABORTED') {
        errorMessage = getTimeoutErrorMessage();
        alertTitle = 'Request Timed Out';
      }
      // Handle network errors
      else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = getNetworkErrorMessage();
        alertTitle = 'Connection Error';
      }
      // Handle API response errors
      else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        alertTitle = 'Error';
      }
      // Handle other errors
      else if (err.message) {
        errorMessage = err.message;
      }
      
      dispatch(setLoading(false));
      dispatch(setError(errorMessage));

      Alert.alert(
        alertTitle, 
        errorMessage,
        [
          {
            text: 'OK',
            style: 'cancel'
          },
          __DEV__ ? {
            text: 'View Logs',
            onPress: () => console.log('Full error:', err)
          } : null as any
        ].filter(Boolean)
      );
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
                if (error) {
                  dispatch(setError(''));
                }
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
              editable={!isLoading}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
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
            {__DEV__ && (
              <Text style={styles.devInfo}>
                {'\n'}Dev Mode: API at {apiService.getApiBaseUrl()}
              </Text>
            )}
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
  errorContainer: {
    backgroundColor: '#FF3B3015',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF3B3030',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    lineHeight: 18,
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
  devInfo: {
    fontSize: 11,
    color: '#444444',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
