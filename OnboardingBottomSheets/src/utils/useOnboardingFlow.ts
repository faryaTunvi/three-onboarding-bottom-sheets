import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setUser } from '../redux/slices/userSlice';
import { setOnboardingComplete } from '../redux/slices/onboardingSlice';

/**
 * Custom hook to manage onboarding flow
 * UI-only version without backend integration
 */
export const useOnboardingFlow = (userId: string) => {
  const dispatch = useAppDispatch();
  const onboardingState = useAppSelector((state) => state.onboarding);
  const userState = useAppSelector((state) => state.user);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once when userId is available
    if (!userId || hasChecked.current) return;

    // Simulate onboarding status check with local state
    const checkOnboardingStatus = () => {
      try {
        // Update user state with mock data
        dispatch(setUser({
          userId: userId,
          isNewUser: true,
        }));

        // Simulate user just completed onboarding
        dispatch(setOnboardingComplete(true));

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
