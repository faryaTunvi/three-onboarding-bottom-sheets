import apiService from './apiService';

export interface OnboardingStatus {
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  userId: string;
  timestamp: number;
}

export interface FeedbackPayload {
  userId: string;
  feedback: string;
  timestamp: number;
  platform: 'ios' | 'android';
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId: string;
}

class OnboardingService {
  /**
   * Check if user has just completed onboarding
   */
  async checkOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    try {
      const response = await apiService.get<OnboardingStatus>(
        `/onboarding/status/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Return default values if API fails
      return {
        isNewUser: false,
        hasCompletedOnboarding: false,
        userId,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    try {
      const response = await apiService.post<FeedbackResponse>(
        '/feedback',
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Mark onboarding sheet as seen
   */
  async markSheetSeen(
    userId: string,
    sheetType: 'welcome' | 'feedback' | 'review'
  ): Promise<void> {
    try {
      await apiService.post('/onboarding/sheet-seen', {
        userId,
        sheetType,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error marking sheet as seen:', error);
      // Don't throw - this is not critical
    }
  }
}

export default new OnboardingService();
