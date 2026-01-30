import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  Platform,
  Linking,
  Alert,
  Image,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '../../components';
import { useAppDispatch } from '../../redux/hooks';
import { setReviewSheetSeen } from '../../redux/slices/onboardingSlice';
import { reviewSheetStyles as styles } from '../../utils/reviewSheetStyles';

// URLs for apps
const APP_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID';
const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';

export interface ReviewSheetProps {
  userId: string;
  onClose: () => void;
}

export const ReviewSheet = forwardRef<BottomSheet, ReviewSheetProps>(
  ({ userId, onClose }, ref) => {
    const dispatch = useAppDispatch();
    const snapPoints = useMemo(() => ['40%'], []);

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

        const supported = await Linking.canOpenURL(storeUrl);
        if (supported) {
          await Linking.openURL(storeUrl);
          dispatch(setReviewSheetSeen());
          onClose();
        } else {
          Alert.alert('Error', 'Cannot open store link');
        }
      } catch (error) {
        console.error('Error opening store:', error);
        Alert.alert('Error', 'Failed to open store. Please try again.');
      }
    }, [dispatch, onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
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
          {/* Review Icon Section */}
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={['#000000', '#2A75CF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.iconWrapper}
            >
              <Image
                source={require('../../assets/review.png')}
                style={styles.reviewImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Got a minute to help us grow?</Text>
            <Text style={styles.description}>
              It takes less than a minute and helps us a lot.
            </Text>
          </View>

          {/* Single Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Leave a review"
              onPress={handleRateApp}
              variant="primary"
              style={styles.reviewButton}
              textStyle={styles.reviewButtonText}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ReviewSheet.displayName = 'ReviewSheet';
