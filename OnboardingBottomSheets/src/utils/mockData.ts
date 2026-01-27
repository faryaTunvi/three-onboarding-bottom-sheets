// Mock API responses for testing without a backend

export const mockOnboardingStatus = {
  isNewUser: true,
  hasCompletedOnboarding: true,
  userId: 'demo-user-123',
  timestamp: Date.now(),
};

export const mockFeedbackResponse = {
  success: true,
  message: 'Feedback received successfully',
  feedbackId: 'feedback-' + Date.now(),
};

// You can import and use these in onboardingService.ts for testing
// Example:
// return mockOnboardingStatus; // Instead of API call
