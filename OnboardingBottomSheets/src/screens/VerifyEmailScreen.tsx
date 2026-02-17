import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { setLoading, setError, setAuthSuccess } from '../redux/slices/authSlice';
import { resetOnboarding } from '../redux/slices/onboardingSlice';
import { Button } from '../components';
import apiService from '../services/apiService';

interface VerifyEmailScreenProps {
  route: {
    params: {
      token?: string;
    };
  };
  navigation: any;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ route, navigation }) => {
  const dispatch = useAppDispatch();
  const { token } = route.params || {};
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('📧 VerifyEmailScreen mounted');
    console.log('📧 Route params:', route.params);
    console.log('📧 Token:', token);
    
    if (token) {
      console.log('✅ Token found, starting verification...');
      verifyToken();
    } else {
      console.log('❌ No token found in route params');
      setVerificationState('error');
      setErrorMessage('Invalid verification link - no token found');
      dispatch(setError('Invalid verification link'));
      dispatch(setLoading(false));
    }

    // Cleanup on unmount
    return () => {
      console.log('📧 VerifyEmailScreen unmounting');
    };
  }, [token]);

  const verifyToken = async () => {
    if (!token) return;

    console.log('🔄 Starting verification process...');
    dispatch(setLoading(true));
    setVerificationState('loading');

    try {
      console.log('🔄 Calling API with token:', token);
      const authResponse = await apiService.verifyMagicLink(token);

      console.log('✅ API response received:', authResponse);

      // Reset onboarding state for new users
      if (authResponse.is_new_user) {
        console.log('🎉 New user detected - resetting onboarding state');
        dispatch(resetOnboarding());
      }

      console.log('💾 Saving auth data to persistent storage...');
      await apiService.saveAuthData(authResponse);
      console.log('✅ Auth data saved to storage');

      // Update Redux state - this will trigger RootNavigator to show Home screen
      console.log('📝 Updating Redux auth state...');
      dispatch(
        setAuthSuccess({
          token: authResponse.token,
          userId: authResponse.user_id,
          email: authResponse.email,
          isNewUser: authResponse.is_new_user,
        })
      );
      console.log('✅ Redux state updated');

      // Clear loading state
      dispatch(setLoading(false));

      // Update UI state
      setVerificationState('success');
      
      console.log('🏠 Verification complete - RootNavigator will automatically navigate to Home');
      // DO NOT manually navigate - RootNavigator will handle it based on isAuthenticated state

    } catch (err: any) {
      console.error('❌ Verification error:', err);
      const errorMsg =
        err.response?.data?.error || 'Failed to verify login link. Please try again.';
      
      setVerificationState('error');
      setErrorMessage(errorMsg);
      dispatch(setError(errorMsg));
      dispatch(setLoading(false));
    }
  };

  const handleBackToLogin = () => {
    console.log('🔙 Navigating back to login');
    navigation.navigate('EmailLogin');
  };

  return (
    <View style={styles.container}>
      {verificationState === 'loading' && (
        <>
          <ActivityIndicator size="large" color="#2A75CF" />
          <Text style={styles.text}>Verifying your login...</Text>
        </>
      )}

      {verificationState === 'success' && (
        <>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>Verification Successful!</Text>
          <Text style={styles.subText}>Loading your account...</Text>
          <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 16 }} />
        </>
      )}

      {verificationState === 'error' && (
        <>
          <Text style={styles.errorIcon}>✕</Text>
          <Text style={styles.errorText}>Verification Failed</Text>
          <Text style={styles.errorSubText}>{errorMessage}</Text>
          <Button
            title="Back to Login"
            onPress={handleBackToLogin}
            style={styles.button}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 64,
    color: '#4CAF50',
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 64,
    color: '#FF6B6B',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    marginTop: 16,
    minWidth: 200,
  },
});
