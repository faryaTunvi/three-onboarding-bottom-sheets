import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { setLoading, setError, setAuthSuccess } from '../redux/slices/authSlice';
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
      verifyToken();
    } else {
      setVerificationState('error');
      setErrorMessage('Invalid verification link - no token found');
      dispatch(setError('Invalid verification link'));
    }
  }, [token]);

  const verifyToken = async () => {
    if (!token) return;

    dispatch(setLoading(true));
    setVerificationState('loading');

    try {
      console.log('Verifying token:', token);
      const authResponse = await apiService.verifyMagicLink(token);

      console.log('Verification successful:', authResponse);

      // Store auth data
      dispatch(
        setAuthSuccess({
          token: authResponse.token,
          userId: authResponse.user_id,
          email: authResponse.email,
          isNewUser: authResponse.is_new_user,
        })
      );

      // Save to persistent storage
      await apiService.saveAuthData(authResponse);

      setVerificationState('success');

      // Navigation will be handled by App.tsx based on auth state
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMsg =
        err.response?.data?.error || 'Failed to verify login link. Please try again.';
      
      setVerificationState('error');
      setErrorMessage(errorMsg);
      dispatch(setError(errorMsg));
    }
  };

  const handleBackToLogin = () => {
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
          <Text style={styles.subText}>Redirecting you to the app...</Text>
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
