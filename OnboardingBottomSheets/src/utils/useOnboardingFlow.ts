import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setUser } from '../redux/slices/userSlice';
import { setOnboardingComplete } from '../redux/slices/onboardingSlice';
import onboardingService from '../services/onboardingService';

/**
 * Custom hook to manage onboarding flow
 * Checks backend for user's onboarding status
 */
export const useOnboardingFlow = (userId: string) => {
  const dispatch = useAppDispatch();
  const onboardingState = useAppSelector((state) => state.onboarding);
  const userState = useAppSelector((state) => state.user);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once when userId is available
    if (!userId || hasChecked.current) return;

    const checkOnboardingStatus = async () => {
      try {
        const status = await onboardingService.checkOnboardingStatus(userId);
        
        // Update user state
        dispatch(setUser({
          userId: status.userId,
          isNewUser: status.isNewUser,
        }));

        // If user just completed onboarding, show the first sheet
        if (status.hasCompletedOnboarding && status.isNewUser) {
          dispatch(setOnboardingComplete(true));
        }

        hasChecked.current = true;
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [userId, dispatch]);

  return {
    shouldShowWelcomeSheet:
      onboardingState.isOnboardingComplete &&
      !onboardingState.hasSeenWelcomeSheet,
    shouldShowFeedbackSheet:
      onboardingState.hasSeenWelcomeSheet &&
      !onboardingState.hasSeenFeedbackSheet,
    shouldShowReviewSheet:
      onboardingState.hasSeenFeedbackSheet &&
      !onboardingState.hasSeenReviewSheet,
    currentSheetIndex: onboardingState.currentSheetIndex,
  };
};
