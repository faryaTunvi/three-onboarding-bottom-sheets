import React, { useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { OnboardSheet } from './OnboardSheet';
import { FeedbackSheet } from './FeedbackSheet';

export interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, onComplete }) => {
  const onboardRef = useRef<BottomSheet>(null);
  const feedbackRef = useRef<BottomSheet>(null);

  const [activeSheet, setActiveSheet] = useState<'onboard' | 'feedback' | null>('onboard');

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
        />
      )}

      {activeSheet === 'feedback' && (
        <FeedbackSheet
          ref={feedbackRef}
          userId={userId}
          onClose={handleClose}
        />
      )}
    </View>
  );
};
