import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { EmailLoginScreen } from '../screens/EmailLoginScreen';
import { VerifyEmailScreen } from '../screens/VerifyEmailScreen';
import { useAppSelector } from '../redux/hooks';

export type RootStackParamList = {
  EmailLogin: undefined;
  VerifyEmail: { token?: string };
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, userId, email } = useAppSelector((state) => state.auth);

  // Log navigation state changes
  useEffect(() => {
    console.log('🗺️ RootNavigator state changed:', {
      isAuthenticated,
      userId,
      email,
      willShowHome: isAuthenticated
    });
  }, [isAuthenticated, userId, email]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen 
            name="EmailLogin" 
            component={EmailLoginScreen}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen 
            name="VerifyEmail" 
            component={VerifyEmailScreen}
            options={{ animationEnabled: false }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ animationEnabled: true }}
        />
      )}
    </Stack.Navigator>
  );
};
