import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  userId: string | null;
  isNewUser: boolean;
  lastOnboardingCheck: number | null;
}

const initialState: UserState = {
  userId: null,
  isNewUser: false,
  lastOnboardingCheck: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ userId: string; isNewUser: boolean }>) => {
      state.userId = action.payload.userId;
      state.isNewUser = action.payload.isNewUser;
      state.lastOnboardingCheck = Date.now();
    },
    clearUser: (state) => {
      state.userId = null;
      state.isNewUser = false;
      state.lastOnboardingCheck = null;
    },
    updateOnboardingCheck: (state) => {
      state.lastOnboardingCheck = Date.now();
    },
  },
});

export const { setUser, clearUser, updateOnboardingCheck } = userSlice.actions;

export default userSlice.reducer;
