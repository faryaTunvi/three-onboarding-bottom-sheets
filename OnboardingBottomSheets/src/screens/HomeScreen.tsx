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
import { useOnboardingFlow } from '../utils';
import { resetOnboarding } from '../redux/slices/onboardingSlice';
import { RootState } from '../redux/store';

export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Get user ID from Redux (in real app, this would come from auth)
  const userId = useAppSelector((state: RootState) => state.user.userId) || 'demo-user-123';
  
  // Refs for bottom sheets
  const welcomeSheetRef = useRef<BottomSheet>(null);
  const feedbackSheetRef = useRef<BottomSheet>(null);
  const reviewSheetRef = useRef<BottomSheet>(null);

  // Use custom hook to manage onboarding flow
  const {
    shouldShowWelcomeSheet,
    shouldShowFeedbackSheet,
    shouldShowReviewSheet,
  } = useOnboardingFlow(userId);

  // Auto open OnboardSheet on app launch
  useEffect(() => {
    // Delay to ensure refs are ready
    const timer = setTimeout(() => {
      welcomeSheetRef.current?.snapToIndex(0);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleWelcomeClose = () => {
    welcomeSheetRef.current?.close();
  };

  const handleShowFeedback = () => {
    feedbackSheetRef.current?.snapToIndex(0);
  };

  const handleShowReview = () => {
    // Close onboard sheet first
    welcomeSheetRef.current?.close();
    
    // Open review sheet after a small delay for smooth animation
    setTimeout(() => {
      reviewSheetRef.current?.snapToIndex(0);
    }, 300);
  };

  const handleFeedbackClose = () => {
    feedbackSheetRef.current?.close();
  };

  const handleReviewClose = () => {
    reviewSheetRef.current?.close();
  };

  // Debug: Reset onboarding (for testing)
  const handleResetOnboarding = () => {
    dispatch(resetOnboarding());
  };

  const handleShowBottomSheet = () => {
    // Close any open sheets first
    feedbackSheetRef.current?.close();
    reviewSheetRef.current?.close();
    
    // Show OnboardSheet
    setTimeout(() => {
      welcomeSheetRef.current?.snapToIndex(0);
    }, 100);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <Button
            title="Show Bottom Sheet"
            onPress={handleShowBottomSheet}
            style={styles.showButton}
            textStyle={styles.showButtonText}
          />
        </View>
      </View>

      {/* Bottom Sheets */}
      <OnboardSheet
        ref={welcomeSheetRef}
        userId={userId}
        onClose={handleWelcomeClose}
        onShowFeedback={handleShowFeedback}
        onShowReview={handleShowReview}
      />

      <FeedbackSheet
        ref={feedbackSheetRef}
        userId={userId}
        onClose={handleFeedbackClose}
      />

      <ReviewSheet
        ref={reviewSheetRef}
        userId={userId}
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
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  showButton: {
    width: 343,
    height: 48,
    opacity: 1,
    gap: 8,
    borderRadius: 100,
    paddingTop: 12,
    paddingRight: 24,
    paddingBottom: 12,
    paddingLeft: 24,
    backgroundColor: '#000000',
  },
  showButtonText: {
    fontFamily: 'Helvetica',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});