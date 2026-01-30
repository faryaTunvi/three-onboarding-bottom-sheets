import React, { useCallback, useMemo, forwardRef, useState, useRef } from 'react';
import {
  View,
  Text,
  Platform,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, CustomInput } from '../../components';
import { useAppDispatch } from '../../redux/hooks';
import { setFeedbackSheetSeen } from '../../redux/slices/onboardingSlice';
import { feedbackSheetStyles as styles } from '../../utils/feedbackSheetStyles';

export interface FeedbackSheetProps {
  userId: string;
  onClose: () => void;
}

export const FeedbackSheet = forwardRef<BottomSheet, FeedbackSheetProps>(
  ({ userId, onClose }, ref) => {
    const dispatch = useAppDispatch();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Use a ref to track if we're currently submitting to prevent race conditions
    const isSubmittingRef = useRef(false);
    
    const snapPoints = useMemo(() => ['70%'], []);

    const handleSubmitFeedback = useCallback(() => {
      // Prevent race conditions - don't allow multiple simultaneous submissions
      if (isSubmittingRef.current) {
        console.log('Feedback submission already in progress');
        return;
      }

      if (!feedback.trim()) {
        setError('Please enter your feedback');
        return;
      }

      try {
        // Set the ref first to prevent race conditions
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setError('');

        // Log feedback locally (UI-only mode)
        console.log('Feedback submitted (UI-only):', {
          userId,
          feedback: feedback.trim(),
          timestamp: Date.now(),
          platform: Platform.OS,
        });

        // Update Redux state
        dispatch(setFeedbackSheetSeen());

        // Show success message
        Alert.alert('Thank You!', 'Your feedback has been recorded.');

        // Close the sheet
        onClose();
      } catch (error) {
        console.error('Error submitting feedback:', error);
        setError('Failed to submit feedback. Please try again.');
        Alert.alert('Error', 'Failed to submit feedback. Please try again.');
      } finally {
        // Reset the submission state
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }, [feedback, userId, dispatch, onClose]);

    const handleSkip = useCallback(() => {
      try {
        dispatch(setFeedbackSheetSeen());
        onClose();
      } catch (error) {
        console.error('Error skipping feedback sheet:', error);
      }
    }, [dispatch, onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Help us improve Rizon</Text>
            <Text style={styles.description}>
              Tell us what didn't feel right, we read every message.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <CustomInput
              placeholder="Type your feedback here..."
              value={feedback}
              onChangeText={(text) => {
                setFeedback(text);
                if (error) setError('');
              }}
              multiline
              numberOfLines={4}
              maxCharacters={500}
              error={error}
              containerStyle={styles.input}
              style={styles.textArea}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Send feedback"
              onPress={handleSubmitFeedback}
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting || !feedback.trim()}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

FeedbackSheet.displayName = 'FeedbackSheet';
