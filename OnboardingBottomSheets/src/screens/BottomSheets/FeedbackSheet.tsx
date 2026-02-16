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
import apiService from '../../services/apiService';

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

    const handleSubmitFeedback = useCallback(async () => {
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

        // Submit feedback to backend
        const response = await apiService.submitFeedback(
          feedback.trim(),
          Platform.OS
        );

        if (response.success) {
          console.log('Feedback submitted successfully:', response.feedback_id);

          // Update Redux state
          dispatch(setFeedbackSheetSeen());

          // Show success message
          Alert.alert('Thank You!', 'Your feedback has been submitted successfully.');

          // Clear the feedback
          setFeedback('');

          // Close the sheet after a short delay
          setTimeout(() => {
            onClose();
          }, 300);
        } else {
          throw new Error('Failed to submit feedback');
        }
      } catch (error: any) {
        console.error('Error submitting feedback:', error);
        const errorMessage = 
          error.response?.data?.error || 
          'Failed to submit feedback. Please try again.';
        setError(errorMessage);
        
        // Show error alert with retry option
        Alert.alert(
          'Error',
          errorMessage,
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      } finally {
        // Reset the submission state
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }, [feedback, dispatch, onClose]);

    const handleSkip = useCallback(() => {
      try {
        dispatch(setFeedbackSheetSeen());
        onClose();
      } catch (error) {
        console.error('Error skipping feedback sheet:', error);
      }
    }, [dispatch, onClose]);

    const handleSheetChange = useCallback((index: number) => {
      // When sheet closes (index -1), reset state and trigger onClose
      if (index === -1) {
        setFeedback('');
        setError('');
        onClose();
      }
    }, [onClose]);

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
        onChange={handleSheetChange}
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
              containerStyle={styles.inputContainer}
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
