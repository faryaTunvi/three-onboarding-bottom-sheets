import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button } from '../../components';
import { useAppDispatch } from '../../redux/hooks';
import { setWelcomeSheetSeen } from '../../redux/slices/onboardingSlice';
import onboardingService from '../../services/onboardingService';

const { width } = Dimensions.get('window');

export interface OnboardSheetProps {
  userId: string;
  onClose: () => void;
}

export const OnboardSheet = forwardRef<BottomSheet, OnboardSheetProps>(
  ({ userId, onClose }, ref) => {
    const dispatch = useAppDispatch();
    const snapPoints = useMemo(() => ['65%'], []);

    const handleClose = useCallback(async () => {
      try {
        // Mark sheet as seen in Redux
        dispatch(setWelcomeSheetSeen());
        
        // Mark sheet as seen in backend (non-blocking)
        onboardingService.markSheetSeen(userId, 'welcome').catch(console.error);
        
        onClose();
      } catch (error) {
        console.error('Error closing welcome sheet:', error);
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
            {/* Replace with your actual welcome image */}
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎉</Text>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to Our App!</Text>
            <Text style={styles.description}>
              We're excited to have you here. Let's get started with a quick
              tour to help you make the most of your experience.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Get Started"
              onPress={handleClose}
              variant="primary"
              style={styles.button}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

OnboardSheet.displayName = 'OnboardSheet';

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
    marginBottom: 24,
  },
  placeholderImage: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  textContainer: {
    marginBottom: 32,
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
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    width: '100%',
  },
});
