/**
 * React Native Onboarding Bottom Sheets App
 * 
 * Architecture:
 * - Redux Toolkit for state management
 * - React Navigation for navigation
 * - Feature-based modular structure
 * - TypeScript for type safety
 * - Gorhom Bottom Sheet for modal interactions
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/redux/store';
import { RootNavigator } from './src/navigation';
import { useAppDispatch } from './src/redux/hooks';
import { restoreAuth, setAuthSuccess } from './src/redux/slices/authSlice';
import apiService from './src/services/apiService';

// Deep linking configuration
const linking = {
  prefixes: ['onboardingapp://'],
  config: {
    screens: {
      EmailLogin: 'login',
      VerifyEmail: {
        path: 'auth/verify',
        parse: {
          token: (token: string) => token,
        },
      },
      Home: 'home',
    },
  },
};

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore auth state on app start
    restoreAuthState();
    
    // Add universal deep link handler as fallback
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
    };

    // Listen for deep link events
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  const restoreAuthState = async () => {
    try {
      const authData = await apiService.getAuthData();
      if (authData) {
        dispatch(
          restoreAuth({
            token: authData.token,
            userId: authData.user_id,
            email: authData.email,
            isNewUser: authData.is_new_user,
            hasCompletedOnboarding: !authData.is_new_user,
          })
        );
      }
    } catch (error) {
      console.error('Error restoring auth state:', error);
    }
  };

  return <RootNavigator />;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
            />
            <AppContent />
          </NavigationContainer>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

export default App;
