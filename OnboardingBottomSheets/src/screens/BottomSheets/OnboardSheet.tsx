import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button } from '../../components';
import { useAppDispatch } from '../../redux/hooks';
import { setWelcomeSheetSeen } from '../../redux/slices/onboardingSlice';
import { onboardSheetStyles as styles } from '../../utils';

const { width } = Dimensions.get('window');

export interface OnboardSheetProps {
  userId: string;
  onClose: () => void;
  onShowFeedback?: () => void;
  onShowReview?: () => void;
}

export const OnboardSheet = forwardRef<BottomSheet, OnboardSheetProps>(
  ({ userId, onClose, onShowFeedback, onShowReview }, ref) => {
    const dispatch = useAppDispatch();
    const snapPoints = useMemo(() => [399], []); // Fixed height per Figma

    const handleFeedback = useCallback(
      (isLovingIt: boolean) => {
        try {
          dispatch(setWelcomeSheetSeen());
          
          // Close current sheet first
          onClose();
          
          // Open next sheet after animation completes
          setTimeout(() => {
            if (isLovingIt) {
              // User loves it - show review sheet
              if (typeof onShowReview === 'function') {
                onShowReview();
              }
            } else {
              // User clicked "Not yet" - show feedback sheet
              if (typeof onShowFeedback === 'function') {
                onShowFeedback();
              }
            }
          }, 300);
        } catch (error) {
          console.error('Error handling feedback:', error);
        }
      },
      [dispatch, onClose, onShowFeedback, onShowReview]
    );

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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo4.png')} 
              style={styles.logo}
            />
          </View>

          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Enjoying Rizon so far?</Text>
            <Text style={styles.description}>
              Your feedback helps us build a better money experience.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              title="Not yet"
              variant="secondary"
              onPress={() => handleFeedback(false)}
              style={styles.leftButton}
              textStyle={styles.leftButtonText}
            />
            <Button
              title="Yes, loving it"
              variant="primary"
              onPress={() => handleFeedback(true)}
              style={styles.rightButton}
              textStyle={styles.rightButtonText}
            />
          </View>

        </BottomSheetView>
      </BottomSheet>
    );
  }
);

OnboardSheet.displayName = 'OnboardSheet';