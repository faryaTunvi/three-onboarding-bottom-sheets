import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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
  
  // Get auth state
  const { userId, isNewUser, hasCompletedOnboarding } = useAppSelector(
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

  // Auto open OnboardSheet for new users who haven't seen it
  useEffect(() => {
    // Show onboarding only for authenticated users who are new and haven't completed onboarding
    if (userId && !hasCompletedOnboarding && !hasSeenWelcomeSheet) {
      // Delay to ensure refs are ready
      const timer = setTimeout(() => {
        welcomeSheetRef.current?.snapToIndex(0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [userId, hasCompletedOnboarding, hasSeenWelcomeSheet]);

  const handleWelcomeClose = () => {
    welcomeSheetRef.current?.close();
    // Mark onboarding as completed when they close the welcome sheet
    dispatch(setOnboardingCompleted());
  };

  const handleShowFeedback = () => {
    feedbackSheetRef.current?.snapToIndex(0);
  };

  const handleShowReview = () => {
    // Close onboard sheet first
    welcomeSheetRef.current?.close();
    
    // Mark onboarding as completed
    dispatch(setOnboardingCompleted());
    
    // Open review sheet after a small delay for smooth animation
    setTimeout(() => {
      reviewSheetRef.current?.snapToIndex(0);
    }, 300);
  };

  const handleFeedbackClose = () => {
    feedbackSheetRef.current?.close();
    
    // Mark onboarding as completed after feedback
    dispatch(setOnboardingCompleted());
  };

  const handleReviewClose = () => {
    reviewSheetRef.current?.close();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.content}>
        {/* Empty content - sheets will appear automatically */}
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
});