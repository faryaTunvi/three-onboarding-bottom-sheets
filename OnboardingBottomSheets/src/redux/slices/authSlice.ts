import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  email: string | null;
  isNewUser: boolean;
  isLoading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  userId: null,
  email: null,
  isNewUser: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAuthSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        userId: string;
        email: string;
        isNewUser: boolean;
      }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.isNewUser = action.payload.isNewUser;
      state.isLoading = false;
      state.error = null;
      // New users haven't completed onboarding
      state.hasCompletedOnboarding = !action.payload.isNewUser;
    },
    setOnboardingCompleted: (state) => {
      state.hasCompletedOnboarding = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.userId = null;
      state.email = null;
      state.isNewUser = false;
      state.error = null;
      state.hasCompletedOnboarding = false;
    },
    restoreAuth: (
      state,
      action: PayloadAction<{
        token: string;
        userId: string;
        email: string;
        isNewUser: boolean;
        hasCompletedOnboarding: boolean;
      }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.isNewUser = action.payload.isNewUser;
      state.hasCompletedOnboarding = action.payload.hasCompletedOnboarding;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setAuthSuccess,
  setOnboardingCompleted,
  logout,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;
