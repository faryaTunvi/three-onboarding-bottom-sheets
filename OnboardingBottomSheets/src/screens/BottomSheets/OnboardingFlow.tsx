import React, { useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { OnboardSheet } from './OnboardSheet';
import { FeedbackSheet } from './FeedbackSheet';
import { ReviewSheet } from './ReviewSheet';

export interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, onComplete }) => {
  const onboardRef = useRef<BottomSheet>(null);
  const feedbackRef = useRef<BottomSheet>(null);
  const reviewRef = useRef<BottomSheet>(null);

  const [activeSheet, setActiveSheet] = useState<'onboard' | 'feedback' | 'review' | null>('onboard');
  // Transition from onboarding → review
  const handleShowReview = useCallback(() => {
    setActiveSheet('review');
  }, []);

  // 🧭 Transition from onboarding → feedback
  const handleShowFeedback = useCallback(() => {
    setActiveSheet('feedback');
  }, []);

  const handleClose = useCallback(() => {
    setActiveSheet(null);
    onComplete();
  }, [onComplete]);

  return (
    <View style={{ flex: 1 }}>
      {activeSheet === 'onboard' && (
        <OnboardSheet
          ref={onboardRef}
          userId={userId}
          onClose={handleClose}
          onShowFeedback={handleShowFeedback}
          onShowReview={handleShowReview}
        />
      )}

      {activeSheet === 'feedback' && (
        <FeedbackSheet
          ref={feedbackRef}
          userId={userId}
          onClose={handleClose}
        />
      )}

      {activeSheet === 'review' && (
        <ReviewSheet
          ref={reviewRef}
          userId={userId}
          onClose={handleClose}
        />
      )}
    </View>
  );
};