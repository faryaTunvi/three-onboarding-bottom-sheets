import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OnboardingState {
  isOnboardingComplete: boolean;
  hasSeenWelcomeSheet: boolean;
  hasSeenFeedbackSheet: boolean;
  hasSeenReviewSheet: boolean;
  currentSheetIndex: number;
}

const initialState: OnboardingState = {
  isOnboardingComplete: false,
  hasSeenWelcomeSheet: false,
  hasSeenFeedbackSheet: false,
  hasSeenReviewSheet: false,
  currentSheetIndex: 0,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
    },
    setWelcomeSheetSeen: (state) => {
      state.hasSeenWelcomeSheet = true;
      state.currentSheetIndex = 1;
    },
    setFeedbackSheetSeen: (state) => {
      state.hasSeenFeedbackSheet = true;
      state.currentSheetIndex = 2;
    },
    setReviewSheetSeen: (state) => {
      state.hasSeenReviewSheet = true;
      state.currentSheetIndex = 3;
    },
    resetOnboarding: (state) => {
      state.isOnboardingComplete = false;
      state.hasSeenWelcomeSheet = false;
      state.hasSeenFeedbackSheet = false;
      state.hasSeenReviewSheet = false;
      state.currentSheetIndex = 0;
    },
  },
});

export const {
  setOnboardingComplete,
  setWelcomeSheetSeen,
  setFeedbackSheetSeen,
  setReviewSheetSeen,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
