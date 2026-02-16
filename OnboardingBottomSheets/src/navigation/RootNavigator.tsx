import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { EmailLoginScreen } from '../screens/EmailLoginScreen';
import { VerifyEmailScreen } from '../screens/VerifyEmailScreen';
import { useAppSelector } from '../redux/hooks';

export type RootStackParamList = {
  EmailLogin: undefined;
  VerifyEmail: { token: string };
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        </>
      ) : (
        // Main App Stack
        <Stack.Screen name="Home" component={HomeScreen} />
      )}
    </Stack.Navigator>
  );
};
