# Deep Linking Test Guide

## Overview
This guide explains how to test the magic link authentication deep linking feature.

## Understanding Deep Links

### What is a Deep Link?
A deep link is a URL that opens your app directly to a specific screen. In our case: `onboardingapp://auth/verify?token=TOKEN`

### Important Notes
- **Deep links only work on mobile devices** (iOS/Android)
- **Web browsers cannot handle custom URL schemes** like `onboardingapp://`
- **Email clients** (especially web-based like Gmail) may not make the button clickable for security reasons

## Testing Methods

### Method 1: Testing from Device Terminal (Recommended for Development)

#### On iOS Simulator:
```bash
xcrun simctl openurl booted "onboardingapp://auth/verify?token=YOUR_TOKEN_HERE"
```

#### On Android Emulator:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "onboardingapp://auth/verify?token=YOUR_TOKEN_HERE"
```

#### On Physical Android Device:
```bash
# First, make sure device is connected
adb devices

# Then open the deep link
adb shell am start -W -a android.intent.action.VIEW -d "onboardingapp://auth/verify?token=YOUR_TOKEN_HERE"
```

### Method 2: Testing from Email on Mobile Device

1. **Request a magic link** from the app
2. **Open the email on your mobile device** (not on computer)
3. **Tap the "Sign In" button** in the email
4. The app should open and verify automatically

**Note:** If the button doesn't work, copy the link and paste it into:
- iOS: Notes app, then tap the link
- Android: Messaging app or Chrome browser

### Method 3: Testing with Alert Dialog (Development Mode)

When running in development mode (__DEV__), the app shows an alert with the token after requesting a magic link:

1. Launch the app
2. Enter your email
3. Tap "Send Login Link"
4. Note the token from the alert
5. Use Method 1 (terminal command) to test the deep link

### Method 4: Manual Deep Link via Browser (Mobile Only)

1. **On your mobile device**, open the browser (Safari/Chrome)
2. Type or paste the deep link: `onboardingapp://auth/verify?token=YOUR_TOKEN`
3. The browser should prompt to open the app
4. Tap "Open" to open the app

## Testing Flow

### Step-by-Step Testing:

1. **Start the Backend:**
   ```bash
   cd backend
   ./start-with-email.sh
   ```

2. **Start the React Native App:**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

3. **Request a Magic Link:**
   - Open the app in the simulator/emulator
   - Enter your email address
   - Tap "Send Login Link"
   - Check the console for the token (dev mode)

4. **Get the Token:**
   - From the alert dialog (dev mode)
   - From the backend console output
   - From your email if email is configured

5. **Test the Deep Link:**
   - Use one of the methods above to open the deep link
   - Watch the app logs for verification status
   - App should navigate to Home screen on success

## Debugging

### Check App Logs:

```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Look for these log messages:
- `🔗 Deep link received:` - App received the deep link
- `� Extracted token from deep link:` - Token extracted from URL
- `🔄 Verifying token:` - Verification started
- `✅ Verification successful:` - Verification completed
- `🏠 Navigating to Home screen` - Redirecting to Home

### Common Issues:

#### Issue 1: "Button in email doesn't work"
**Cause:** Email clients block custom URL schemes for security

**Solution:** 
- Copy the link from the email
- Paste it into Notes (iOS) or Messages (Android)
- Tap the link from there

#### Issue 2: "Browser says 'Cannot open page'"
**Cause:** Deep links only work on mobile devices

**Solution:**
- Ensure you're testing on a device/simulator
- Use terminal commands to test deep links
- Make sure the app is installed and running

#### Issue 3: "Link opens app but goes to EmailLoginScreen"
**Cause:** Token not being parsed correctly

**Solution:**
- Check app logs for token value
- Ensure URL format is exactly: `onboardingapp://auth/verify?token=TOKEN`
- Try restarting the app
- Check that React Navigation is properly configured

#### Issue 4: "Token verification fails"
**Possible causes:**
- Token already used (can only be used once)
- Token expired (15-minute expiry)
- Backend not running
- Network issue

**Solution:**
- Request a new magic link
- Ensure backend is running on http://localhost:8080
- Check backend logs for errors
- Test verification endpoint directly:
  ```bash
  curl "http://localhost:8080/api/auth/verify?token=YOUR_TOKEN"
  ```

## Production Considerations

### For Production Deployment:

1. **Universal Links (iOS) / App Links (Android):**
   - Set up HTTPS deep links (e.g., `https://yourapp.com/auth/verify?token=TOKEN`)
   - Configure Apple App Site Association (iOS)
   - Configure Digital Asset Links (Android)
   - This ensures links work from any context (email, web, SMS)

2. **Email Configuration:**
   - Configure SMTP settings in backend
   - Test email delivery in production
   - Consider using email service providers (SendGrid, Mailgun, etc.)

3. **Fallback Handling:**
   - Provide web page fallback for desktop users
   - Show QR code that mobile users can scan
   - Offer manual token entry option

## Testing Checklist

- [ ] Backend is running
- [ ] App is running on device/simulator
- [ ] Request magic link succeeds
- [ ] Email contains correct link format
- [ ] Deep link opens app (terminal test)
- [ ] Token is parsed correctly
- [ ] Verification succeeds
- [ ] App navigates to Home screen
- [ ] Auth state persists after app restart
- [ ] Error handling works for invalid tokens
- [ ] Error handling works for expired tokens
- [ ] Error handling works for already-used tokens

## Quick Test Script

Here's a quick test script you can use:

```bash
#!/bin/bash

# 1. Start backend (in separate terminal)
# cd backend && ./start-with-email.sh

# 2. Request magic link
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq -r '.token')

echo "Token: $TOKEN"

# 3. Wait a moment
sleep 2

# 4. Test deep link (iOS)
xcrun simctl openurl booted "onboardingapp://auth/verify?token=$TOKEN"

# Or for Android:
# adb shell am start -W -a android.intent.action.VIEW -d "onboardingapp://auth/verify?token=$TOKEN"
```

## Support

If you continue to have issues:
1. Check all logs for error messages
2. Verify deep linking configuration in Info.plist (iOS) and AndroidManifest.xml
3. Ensure React Navigation linking is properly configured
4. Test with a fresh install of the app
5. Clear app data and try again
