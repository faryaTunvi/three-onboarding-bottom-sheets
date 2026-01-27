import React, { useCallback, useMemo, forwardRef, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, CustomInput } from '../../components';
import { useAppDispatch } from '../../redux/hooks';
import { setFeedbackSheetSeen } from '../../redux/slices/onboardingSlice';
import onboardingService from '../../services/onboardingService';

const { width } = Dimensions.get('window');

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

        // Submit feedback to backend - this must complete before closing
        const response = await onboardingService.submitFeedback({
          userId,
          feedback: feedback.trim(),
          timestamp: Date.now(),
          platform: Platform.OS as 'ios' | 'android',
        });

        console.log('Feedback submitted successfully:', response);

        // Only after successful submission, update Redux
        dispatch(setFeedbackSheetSeen());
        
        // Mark sheet as seen in backend (non-blocking)
        onboardingService.markSheetSeen(userId, 'feedback').catch(console.error);

        // Show success message
        Alert.alert('Thank You!', 'Your feedback has been submitted successfully.');

        // Now we can safely close the sheet
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

    const handleSkip = useCallback(async () => {
      try {
        dispatch(setFeedbackSheetSeen());
        onboardingService.markSheetSeen(userId, 'feedback').catch(console.error);
        onClose();
      } catch (error) {
        console.error('Error skipping feedback sheet:', error);
      }
    }, [dispatch, userId, onClose]);

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
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>💬</Text>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>We'd Love Your Feedback</Text>
            <Text style={styles.description}>
              Help us improve by sharing your thoughts and suggestions.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <CustomInput
              label="Your Feedback"
              placeholder="Tell us what you think..."
              value={feedback}
              onChangeText={(text) => {
                setFeedback(text);
                if (error) setError('');
              }}
              multiline
              numberOfLines={4}
              maxCharacters={500}
              showCharacterCount
              error={error}
              containerStyle={styles.input}
              style={styles.textArea}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Send Feedback"
              onPress={handleSubmitFeedback}
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting || !feedback.trim()}
              style={styles.submitButton}
            />
            <Button
              title="Skip for Now"
              onPress={handleSkip}
              variant="outline"
              disabled={isSubmitting}
              style={styles.skipButton}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

FeedbackSheet.displayName = 'FeedbackSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  handleIndicator: {
    backgroundColor: '#E5E5EA',
    width: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  placeholderImage: {
    width: width * 0.3,
    height: width * 0.3,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 60,
  },
  textContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 0,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  submitButton: {
    width: '100%',
    marginBottom: 12,
  },
  skipButton: {
    width: '100%',
  },
});
