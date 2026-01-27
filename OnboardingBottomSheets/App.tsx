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

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/redux/store';
import { RootNavigator } from './src/navigation';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
            />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

export default App;
