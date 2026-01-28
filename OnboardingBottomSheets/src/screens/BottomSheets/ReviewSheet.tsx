import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button } from '../../components';
import { useAppDispatch } from '../../redux/hooks';
import { setReviewSheetSeen } from '../../redux/slices/onboardingSlice';

const { width } = Dimensions.get('window');

// App Store / Google Play URLs
const APP_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID'; // Replace with your App Store ID
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME'; // Replace with your package name

export interface ReviewSheetProps {
  userId: string;
  onClose: () => void;
}

export const ReviewSheet = forwardRef<BottomSheet, ReviewSheetProps>(
  ({ userId, onClose }, ref) => {
    const dispatch = useAppDispatch();
    const snapPoints = useMemo(() => ['60%'], []);

    const handleRateApp = useCallback(async () => {
      try {
        const storeUrl = Platform.select({
          ios: APP_STORE_URL,
          android: GOOGLE_PLAY_URL,
        });

        if (!storeUrl) {
          Alert.alert('Error', 'Store URL not configured for this platform');
          return;
        }

        // Check if the URL can be opened
        const supported = await Linking.canOpenURL(storeUrl);

        if (supported) {
          await Linking.openURL(storeUrl);
          
          // Mark sheet as seen after user attempts to rate
          dispatch(setReviewSheetSeen());
          
          // Close the sheet
          onClose();
        } else {
          Alert.alert('Error', `Cannot open ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'}`);
        }
      } catch (error) {
        console.error('Error opening store:', error);
        Alert.alert('Error', 'Failed to open store. Please try again.');
      }
    }, [dispatch, onClose]);

    const handleMaybeLater = useCallback(() => {
      try {
        dispatch(setReviewSheetSeen());
        onClose();
      } catch (error) {
        console.error('Error closing review sheet:', error);
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
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>⭐️</Text>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Enjoying the App?</Text>
            <Text style={styles.description}>
              Your feedback helps us improve and reach more people. Take a
              moment to rate us on the {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}!
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={`Rate on ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'}`}
              onPress={handleRateApp}
              variant="primary"
              style={styles.rateButton}
            />
            <Button
              title="Maybe Later"
              onPress={handleMaybeLater}
              variant="outline"
              style={styles.laterButton}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ReviewSheet.displayName = 'ReviewSheet';

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
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 70,
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
    paddingHorizontal: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  rateButton: {
    width: '100%',
    marginBottom: 12,
  },
  laterButton: {
    width: '100%',
  },
});
