// Mock API responses for testing without a backend
// Note: This file is kept for reference but is no longer used.
// The app now integrates with a real Go backend server.

export const mockOnboardingStatus = {
  isNewUser: true,
  hasCompletedOnboarding: false,
  userId: 'demo-user-123',
  timestamp: Date.now(),
};

export const mockFeedbackResponse = {
  success: true,
  message: 'Feedback received successfully',
  feedbackId: 'feedback-' + Date.now(),
};

export const mockAuthResponse = {
  token: 'mock-jwt-token',
  user_id: 'demo-user-123',
  email: 'demo@example.com',
  is_new_user: true,
};

// For testing purposes, you can use these mock responses
// by temporarily modifying apiService.ts to return these instead of making API calls
