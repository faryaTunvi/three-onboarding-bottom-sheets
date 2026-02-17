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
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/redux/store';
import { RootNavigator } from './src/navigation';
import { useAppDispatch } from './src/redux/hooks';
import { restoreAuth } from './src/redux/slices/authSlice';
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
          <NavigationContainer
            linking={linking}
            onReady={() => {
              console.log('📱 Navigation ready');
              console.log('🔍 Auth state:', store.getState().auth.isAuthenticated);
            }}
            onStateChange={(state) => {
              console.log('📍 Navigation state changed:', JSON.stringify(state, null, 2));
              const currentRoute = state?.routes[state.index];
              console.log('📍 Current route:', currentRoute?.name, 'Params:', JSON.stringify(currentRoute?.params));
              console.log('🔍 Auth state:', store.getState().auth.isAuthenticated);
            }}
          >
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
