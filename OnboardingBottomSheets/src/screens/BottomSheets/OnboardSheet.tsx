import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
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
  onShowFeedback: () => void;
}

export const OnboardSheet = forwardRef<BottomSheet, OnboardSheetProps>(
  ({ userId, onClose, onShowFeedback }, ref) => {
    const dispatch = useAppDispatch();
    const snapPoints = useMemo(() => [399], []); // Fixed height per Figma

    const handleFeedback = useCallback(
      (isLovingIt: boolean) => {
        try {
          if (isLovingIt) {
            // User loves it - just close and mark as seen
            console.log('User loves Rizon');
            dispatch(setWelcomeSheetSeen());
            onClose();
          } else {
            // User clicked "Not yet" - show feedback sheet
            console.log('User not yet loving Rizon - showing feedback');
            dispatch(setWelcomeSheetSeen());
            onClose();
            onShowFeedback();
          }
        } catch (error) {
          console.error('Error handling feedback:', error);
        }
      },
      [dispatch, onClose, onShowFeedback]
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
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        style={styles.bottomSheet}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Logo Box */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>RIZON</Text>
            </View>
          </View>

          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Enjoying Rizon so far?</Text>
            <Text style={styles.description}>
              Your feedback helps us build a better money experience.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <Button
              title="Not yet"
              variant="secondary"
              onPress={() => handleFeedback(false)}
              style={styles.outlineButton}
              textStyle={styles.outlineText}
            />
            <Button
              title="Yes, loving it"
              variant="primary"
              onPress={() => handleFeedback(true)}
              style={styles.filledButton}
              textStyle={styles.filledText}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

OnboardSheet.displayName = 'OnboardSheet';
