import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { Button } from '../components';
import {
  OnboardSheet,
  FeedbackSheet,
  ReviewSheet,
} from './BottomSheets';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setOnboardingCompleted } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';

export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get auth state
  const { userId, isNewUser, hasCompletedOnboarding, email } = useAppSelector(
    (state: RootState) => state.auth
  );
  
  // Get onboarding state
  const { hasSeenWelcomeSheet } = useAppSelector(
    (state: RootState) => state.onboarding
  );
  
  // Refs for bottom sheets
  const welcomeSheetRef = useRef<BottomSheet>(null);
  const feedbackSheetRef = useRef<BottomSheet>(null);
  const reviewSheetRef = useRef<BottomSheet>(null);

  // Initialize screen
  useEffect(() => {
    console.log('📱 HomeScreen mounted with state:', {
      userId,
      email,
      isNewUser,
      hasCompletedOnboarding,
      hasSeenWelcomeSheet
    });

    // Delay to ensure Redux state is fully loaded and navigation is complete
    const initTimer = setTimeout(() => {
      console.log('✅ HomeScreen initialized');
      setIsInitialized(true);
    }, 500);

    return () => {
      console.log('📱 HomeScreen unmounting');
      clearTimeout(initTimer);
    };
  }, []);

  // Auto open OnboardSheet for new users who haven't seen it
  useEffect(() => {
    if (!isInitialized) {
      console.log('⏳ HomeScreen not yet initialized, waiting...');
      return;
    }

    // Show onboarding only for authenticated users who are new and haven't completed onboarding
    if (userId && isNewUser && !hasCompletedOnboarding && !hasSeenWelcomeSheet) {
      console.log('🎊 Opening OnboardSheet for new user:', {
        userId,
        isNewUser,
        hasCompletedOnboarding,
        hasSeenWelcomeSheet
      });
      
      // Additional delay to ensure refs are ready and screen is fully rendered
      const timer = setTimeout(() => {
        console.log('📱 Triggering OnboardSheet open...');
        welcomeSheetRef.current?.snapToIndex(0);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('ℹ️ OnboardSheet conditions not met:', {
        userId: !!userId,
        isNewUser,
        hasCompletedOnboarding,
        hasSeenWelcomeSheet,
        reason: !userId 
          ? 'No userId' 
          : !isNewUser 
          ? 'Not a new user' 
          : hasCompletedOnboarding 
          ? 'Already completed onboarding'
          : hasSeenWelcomeSheet
          ? 'Already seen welcome sheet'
          : 'Unknown'
      });
    }
  }, [userId, isNewUser, hasCompletedOnboarding, hasSeenWelcomeSheet, isInitialized]);

  const handleWelcomeClose = () => {
    console.log('👋 Closing welcome sheet');
    welcomeSheetRef.current?.close();
    dispatch(setOnboardingCompleted());
  };

  const handleShowFeedback = () => {
    console.log('💬 Opening feedback sheet');
    welcomeSheetRef.current?.close();
    dispatch(setOnboardingCompleted());
    
    setTimeout(() => {
      feedbackSheetRef.current?.snapToIndex(0);
    }, 300);
  };

  const handleShowReview = () => {
    console.log('⭐ Opening review sheet');
    welcomeSheetRef.current?.close();
    dispatch(setOnboardingCompleted());
    
    setTimeout(() => {
      reviewSheetRef.current?.snapToIndex(0);
    }, 300);
  };

  const handleFeedbackClose = () => {
    console.log('💬 Closing feedback sheet');
    feedbackSheetRef.current?.close();
  };

  const handleReviewClose = () => {
    console.log('⭐ Closing review sheet');
    reviewSheetRef.current?.close();
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={[styles.content, styles.centered]}>
          <ActivityIndicator size="large" color="#2A75CF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.content}>
        {/* Fallback content when no sheets are open */}
        <View style={styles.centered}>
          <Text style={styles.welcomeText}>Welcome to the App</Text>
          {email && (
            <Text style={styles.emailText}>{email}</Text>
          )}
          {hasCompletedOnboarding && (
            <Text style={styles.statusText}>You're all set! 🎉</Text>
          )}
        </View>
      </View>

      {/* Bottom Sheets */}
      <OnboardSheet
        ref={welcomeSheetRef}
        userId={userId || 'unknown'}
        onClose={handleWelcomeClose}
        onShowFeedback={handleShowFeedback}
        onShowReview={handleShowReview}
      />

      <FeedbackSheet
        ref={feedbackSheetRef}
        userId={userId || 'unknown'}
        onClose={handleFeedbackClose}
      />

      <ReviewSheet
        ref={reviewSheetRef}
        userId={userId || 'unknown'}
        onClose={handleReviewClose}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#2A75CF',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  loadingText: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 16,
  },
});