import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  OnboardSheet,
  FeedbackSheet,
  ReviewSheet,
} from './BottomSheets';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { useOnboardingFlow } from '../utils';
import { resetOnboarding } from '../redux/slices/onboardingSlice';
import { COLORS, SPACING } from '../utils/constants';
import { RootState } from '../redux/store';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  
  // Get user ID from Redux (in real app, this would come from auth)
  const userId = useAppSelector((state: RootState) => state.user.userId) || 'demo-user-123';
  
  // Refs for bottom sheets
  const welcomeSheetRef = useRef<BottomSheet>(null);
  const feedbackSheetRef = useRef<BottomSheet>(null);
  const reviewSheetRef = useRef<BottomSheet>(null);

  // Use custom hook to manage onboarding flow
  const {
    shouldShowWelcomeSheet,
    shouldShowFeedbackSheet,
    shouldShowReviewSheet,
  } = useOnboardingFlow(userId);

  // Show appropriate sheet based on flow
  useEffect(() => {
    if (shouldShowWelcomeSheet) {
      welcomeSheetRef.current?.snapToIndex(0);
    } else if (shouldShowFeedbackSheet) {
      feedbackSheetRef.current?.snapToIndex(0);
    } else if (shouldShowReviewSheet) {
      reviewSheetRef.current?.snapToIndex(0);
    }
  }, [shouldShowWelcomeSheet, shouldShowFeedbackSheet, shouldShowReviewSheet]);

  const handleWelcomeClose = () => {
    welcomeSheetRef.current?.close();
  };

  const handleFeedbackClose = () => {
    feedbackSheetRef.current?.close();
  };

  const handleReviewClose = () => {
    reviewSheetRef.current?.close();
  };

  // Debug: Reset onboarding (for testing)
  const handleResetOnboarding = () => {
    dispatch(resetOnboarding());
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Your App</Text>
          <Text style={styles.subtitle}>
            This is your main screen. The onboarding bottom sheets will appear
            automatically based on your onboarding status.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎨 Beautiful Design</Text>
            <Text style={styles.cardDescription}>
              Clean and modern UI with smooth animations
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚡️ Fast Performance</Text>
            <Text style={styles.cardDescription}>
              Optimized for speed and efficiency
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔒 Secure</Text>
            <Text style={styles.cardDescription}>
              Your data is safe with us
            </Text>
          </View>
        </View>

        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Tools</Text>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={handleResetOnboarding}
          >
            <Text style={styles.debugButtonText}>Reset Onboarding Flow</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sheets */}
      {shouldShowWelcomeSheet && (
        <OnboardSheet
          ref={welcomeSheetRef}
          userId={userId}
          onClose={handleWelcomeClose}
        />
      )}

      {shouldShowFeedbackSheet && (
        <FeedbackSheet
          ref={feedbackSheetRef}
          userId={userId}
          onClose={handleFeedbackClose}
        />
      )}

      {shouldShowReviewSheet && (
        <ReviewSheet
          ref={reviewSheetRef}
          userId={userId}
          onClose={handleReviewClose}
        />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  debugSection: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: SPACING.md,
  },
  debugButton: {
    backgroundColor: '#FFC107',
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
