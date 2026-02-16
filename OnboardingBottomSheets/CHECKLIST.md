# Setup Checklist

Use this checklist to ensure everything is configured correctly before running the app.

## Prerequisites ✓

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Go 1.22+ installed (`go version`)
- [ ] React Native environment set up
  - [ ] Xcode (Mac, for iOS)
  - [ ] Android Studio (for Android)
  - [ ] CocoaPods (Mac, for iOS): `sudo gem install cocoapods`

## Initial Setup ✓

- [ ] Clone/download the project
- [ ] Navigate to project directory
- [ ] Run `npm install`
- [ ] Run `cd ios && pod install && cd ..` (Mac only)
- [ ] Run `cd backend && go mod download && cd ..`

## Configuration ✓

### Backend Configuration
- [ ] Verify backend port (default: 8080)
- [ ] Check `backend/internal/services/auth_service.go` for JWT secret
- [ ] Review rate limiting settings (default: 5/hour)

### Frontend Configuration
- [ ] Get your local IP address:
  ```bash
  # Mac
  ifconfig | grep "inet " | grep -v 127.0.0.1
  
  # Windows
  ipconfig
  ```
- [ ] Update `src/services/apiService.ts`:
  ```typescript
  const API_BASE_URL = __DEV__ 
    ? 'http://YOUR_IP:8080'  // Replace YOUR_IP
    : 'https://your-production-api.com';
  ```
  Example: `'http://192.168.1.100:8080'`

### Deep Linking Configuration
- [ ] iOS: Verify `ios/OnboardingBottomSheets/Info.plist` has:
  ```xml
  <key>CFBundleURLSchemes</key>
  <array>
    <string>onboardingapp</string>
  </array>
  ```
- [ ] Android: Verify `android/app/src/main/AndroidManifest.xml` has:
  ```xml
  <data android:scheme="onboardingapp" android:host="auth" />
  ```

### Store URLs (Optional)
- [ ] Update `src/screens/BottomSheets/ReviewSheet.tsx`:
  ```typescript
  const APP_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID';
  const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE';
  ```

## Running the App ✓

### Start Backend
- [ ] Open terminal window 1
- [ ] Run: `cd backend && go run main.go`
- [ ] Verify: "Server starting on port 8080" appears
- [ ] Keep this terminal open

### Start React Native
- [ ] Open terminal window 2
- [ ] Run: `npm start` or use `start-dev.sh`
- [ ] Wait for Metro bundler to start

### Launch App
- [ ] Open terminal window 3
- [ ] iOS: Run `npm run ios`
- [ ] Android: Run `npm run android`
- [ ] Or use Xcode/Android Studio

## Testing Flow ✓

### Test Authentication
- [ ] App opens to Email Login screen
- [ ] Enter any email (e.g., test@example.com)
- [ ] Tap "Send Login Link"
- [ ] Success alert appears
- [ ] In dev mode, token alert appears
- [ ] Copy the token from alert

### Test Deep Link
Choose one method:

**iOS Simulator:**
- [ ] Run in terminal:
  ```bash
  xcrun simctl openurl booted "onboardingapp://auth/verify?token=PASTE_TOKEN"
  ```

**Android Emulator:**
- [ ] Run in terminal:
  ```bash
  adb shell am start -W -a android.intent.action.VIEW \
    -d "onboardingapp://auth/verify?token=PASTE_TOKEN" \
    com.onboardingbottomsheets
  ```

### Test Onboarding
- [ ] After deep link, app authenticates
- [ ] OnboardSheet appears automatically
- [ ] Try "Not yet" button
- [ ] FeedbackSheet appears
- [ ] Enter some feedback
- [ ] Tap "Send feedback"
- [ ] Success alert appears
- [ ] Check backend terminal for Slack mock message

### Test Store Redirect
- [ ] Close and reopen app
- [ ] Authentication should persist (no login screen)
- [ ] Manually open OnboardSheet (if you need to test)
- [ ] Tap "Loving it"
- [ ] ReviewSheet appears
- [ ] Tap "Rate us" button
- [ ] Should attempt to open App Store/Play Store

### Test Persistence
- [ ] Close app completely
- [ ] Reopen app
- [ ] Should go directly to Home screen (authenticated)
- [ ] Onboarding should NOT appear (already completed)

## Verify Backend ✓

### Terminal Checks
In the backend terminal, you should see:
- [ ] "Server starting on port 8080"
- [ ] POST requests to `/api/auth/request-link`
- [ ] GET requests to `/api/auth/verify`
- [ ] POST requests to `/api/feedback/submit`
- [ ] Formatted Slack mock messages

### API Testing (Optional)
Test directly with curl:
- [ ] Request magic link:
  ```bash
  curl -X POST http://localhost:8080/api/auth/request-link \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  ```
- [ ] Verify returns token
- [ ] Use token to verify:
  ```bash
  curl "http://localhost:8080/api/auth/verify?token=TOKEN"
  ```
- [ ] Returns JWT token

## Common Issues ✓

### "Connection Refused" or Network Error
- [ ] Backend is running
- [ ] Correct IP address in apiService.ts
- [ ] Device and computer on same network
- [ ] Firewall not blocking port 8080

### Deep Link Doesn't Work
- [ ] App rebuilt after native config changes
- [ ] Scheme is correct: `onboardingapp://`
- [ ] Check native logs for errors

### Onboarding Doesn't Appear
- [ ] User is authenticated (check Redux state)
- [ ] User is marked as new user
- [ ] hasCompletedOnboarding is false
- [ ] Try uninstalling and reinstalling app

### Feedback Not Submitting
- [ ] Backend is running
- [ ] JWT token is valid
- [ ] Check Metro bundler for errors
- [ ] Check backend logs for errors

### Rate Limiting Error
- [ ] Waited 12 minutes between requests
- [ ] Or restart backend to reset limiter
- [ ] Or use different email

## Production Readiness Checklist ✓

Before deploying to production:

### Backend
- [ ] Change JWT secret
- [ ] Set up database (PostgreSQL/MongoDB)
- [ ] Integrate real email service
- [ ] Replace mock Slack with real webhook
- [ ] Configure environment variables
- [ ] Set up HTTPS/TLS
- [ ] Configure CORS for production domain
- [ ] Add logging and monitoring
- [ ] Set up error tracking

### Frontend
- [ ] Update API endpoint to production URL
- [ ] Remove dev-only magic link displays
- [ ] Update store URLs
- [ ] Set up universal links / app links
- [ ] Add analytics
- [ ] Add crash reporting
- [ ] Test on multiple devices
- [ ] Performance testing
- [ ] Security audit

### Infrastructure
- [ ] Domain configured
- [ ] SSL certificates
- [ ] Load balancer (if needed)
- [ ] Database backups
- [ ] CI/CD pipeline
- [ ] Monitoring and alerts

## Documentation Reviewed ✓

Make sure you've read:
- [ ] README.md - Main documentation
- [ ] QUICKSTART.md - Quick start guide
- [ ] API_TESTING.md - API testing examples
- [ ] IMPLEMENTATION_SUMMARY.md - Technical details
- [ ] backend/README.md - Backend specifics

## Success Criteria ✓

Your setup is complete when:
- [ ] Backend starts without errors
- [ ] App launches on device/simulator
- [ ] Can request magic link
- [ ] Deep link authenticates user
- [ ] Onboarding appears once
- [ ] Feedback submits successfully
- [ ] Slack mock logs message
- [ ] Review sheet opens store
- [ ] Authentication persists
- [ ] No console errors

## Getting Help ✓

If stuck:
1. [ ] Check Metro bundler logs
2. [ ] Check backend terminal logs
3. [ ] Verify network connectivity
4. [ ] Review configuration files
5. [ ] Check documentation
6. [ ] Look for typos in URLs/IPs

## Notes

- Device and computer must be on same WiFi
- Use IP address, not `localhost` for device testing
- Rebuild app after native config changes
- Rate limiter resets on backend restart
- AsyncStorage persists until app uninstall

---

**Status: Ready to test!** ✅

After completing this checklist, your app should be fully functional and ready for development testing.

For production deployment, complete the "Production Readiness Checklist" section.
