/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// Suppress InteractionManager deprecation warning from React Navigation
// This is a known issue in React Navigation that will be fixed in a future update
LogBox.ignoreLogs([
  'InteractionManager has been deprecated and will be removed in a future release',
]);

// Enable native screens
enableScreens();

AppRegistry.registerComponent(appName, () => App);
