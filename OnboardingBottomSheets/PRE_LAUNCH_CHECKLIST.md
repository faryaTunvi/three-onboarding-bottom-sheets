# Pre-Launch Checklist

## Configuration Tasks

### API Configuration
- [ ] Update API base URL in `src/services/apiService.ts`
- [ ] Implement backend endpoints:
  - [ ] `GET /onboarding/status/:userId`
  - [ ] `POST /feedback`
  - [ ] `POST /onboarding/sheet-seen`
- [ ] Test API connectivity
- [ ] Add authentication headers if needed

### Store Configuration
- [ ] Update App Store URL in `src/screens/BottomSheets/ReviewSheet.tsx`
- [ ] Update Google Play URL in `src/screens/BottomSheets/ReviewSheet.tsx`
- [ ] Verify deep linking works on physical devices

### Assets
- [ ] Replace emoji placeholders with actual images
- [ ] Add welcome image to OnboardSheet
- [ ] Add feedback image to FeedbackSheet
- [ ] Add review/rating image to ReviewSheet
- [ ] Add app icon (already configured in Xcode/Android Studio)
- [ ] Add launch screen assets

### Styling
- [ ] Customize colors in `src/utils/constants.ts`
- [ ] Review spacing and font sizes
- [ ] Test on different screen sizes
- [ ] Verify dark mode support (if needed)

## Testing Checklist

### iOS Testing
- [ ] Run on iOS Simulator
- [ ] Test on physical iPhone
- [ ] Test all three bottom sheets
- [ ] Test feedback submission
- [ ] Test App Store redirect
- [ ] Test reset onboarding flow
- [ ] Check gesture handling
- [ ] Verify animations are smooth

### Android Testing
- [ ] Run on Android Emulator
- [ ] Test on physical Android device
- [ ] Test all three bottom sheets
- [ ] Test feedback submission
- [ ] Test Play Store redirect
- [ ] Test reset onboarding flow
- [ ] Check gesture handling
- [ ] Verify animations are smooth

### Functionality Testing
- [ ] Backend API integration works
- [ ] Feedback submission completes before sheet closes
- [ ] Race condition prevention works
- [ ] Error handling displays properly
- [ ] Loading states show correctly
- [ ] Sheet sequence is correct (Welcome → Feedback → Review)
- [ ] Sheets can't be dismissed by swiping down
- [ ] Character counter works in feedback input
- [ ] Validation works (empty feedback)

### State Management
- [ ] Redux state updates correctly
- [ ] Sheet visibility logic works
- [ ] Reset onboarding button works
- [ ] State persists (if implementing persistence)

## Pre-Production Tasks

### Code Quality
- [ ] Run TypeScript type checking: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Fix any warnings
- [ ] Remove console.logs or use proper logging
- [ ] Remove debug tools (or hide in production)

### Performance
- [ ] Test on low-end devices
- [ ] Check memory usage
- [ ] Verify no memory leaks
- [ ] Test with slow network
- [ ] Verify API timeout handling

### Security
- [ ] Sensitive data not in git
- [ ] API keys properly secured
- [ ] User data handled securely
- [ ] HTTPS for all API calls

### Documentation
- [ ] Update README with your specific config
- [ ] Document any custom backend requirements
- [ ] Add troubleshooting section
- [ ] Include deployment instructions

## Build & Deploy

### iOS Build
- [ ] Update version in Xcode
- [ ] Update build number
- [ ] Configure signing & certificates
- [ ] Create archive
- [ ] Submit to App Store Connect
- [ ] Test TestFlight build

### Android Build
- [ ] Update versionCode in `android/app/build.gradle`
- [ ] Update versionName
- [ ] Generate signed APK/AAB
- [ ] Test release build
- [ ] Submit to Google Play Console
- [ ] Test internal testing track

## Edge Cases to Test

- [ ] User skips feedback
- [ ] User skips review
- [ ] API call fails during feedback submission
- [ ] Network timeout
- [ ] App backgrounded during sheet display
- [ ] App killed during feedback submission
- [ ] Multiple rapid taps on buttons
- [ ] Long feedback text (500+ chars)
- [ ] Special characters in feedback
- [ ] Emoji in feedback

## Analytics (Optional)

- [ ] Track sheet impressions
- [ ] Track button clicks
- [ ] Track feedback submissions
- [ ] Track store redirect clicks
- [ ] Track skip rates

## Final Checks

- [ ] All placeholders replaced
- [ ] No TODO comments in code
- [ ] No debug code in production
- [ ] Privacy policy linked (if collecting data)
- [ ] Terms of service linked (if needed)
- [ ] Crash reporting configured
- [ ] Analytics configured

---

## Ready to Launch!

Once all items are checked, your app is ready for production deployment!

### Quick Launch Commands

```bash
# iOS Production Build
cd ios
xcodebuild -workspace OnboardingBottomSheets.xcworkspace \
  -scheme OnboardingBottomSheets \
  -configuration Release \
  -archivePath build/OnboardingBottomSheets.xcarchive \
  archive

# Android Production Build
cd android
./gradlew assembleRelease
# AAB for Play Store:
./gradlew bundleRelease
```

### Support Resources

- React Native Docs: https://reactnative.dev/
- Redux Toolkit Docs: https://redux-toolkit.js.org/
- React Navigation: https://reactnavigation.org/
- Bottom Sheet: https://gorhom.github.io/react-native-bottom-sheet/

---

**Good luck with your launch!**
