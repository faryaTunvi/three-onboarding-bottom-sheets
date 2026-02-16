# Quick Start Guide

This guide will help you get the app running in 5 minutes.

## Prerequisites Check

Run these commands to verify you have everything:

```bash
# Check Node.js (should be 20+)
node --version

# Check Go (should be 1.22+)
go version

# Check npm
npm --version
```

If any are missing, install them first.

## Step 1: Install Dependencies (One Time)

```bash
# Install Node modules
npm install

# Install Go dependencies
cd backend && go mod download && cd ..

# Install iOS Pods (Mac only)
cd ios && pod install && cd ..
```

## Step 2: Start the Backend

Open a new terminal window:

```bash
cd backend
go run main.go
```

You should see: `Server starting on port 8080`

Keep this terminal open.

## Step 3: Configure API Endpoint

1. Get your local IP address:
   - **Mac**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: `ipconfig`

2. Edit `src/services/apiService.ts`:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://YOUR_IP:8080'  // Replace YOUR_IP with your actual IP
     : 'https://your-production-api.com';
   ```

   Example: `'http://192.168.1.100:8080'`

## Step 4: Run the App

Open a NEW terminal window:

**For iOS:**
```bash
npm run ios
```

**For Android:**
```bash
npm run android
```

## Step 5: Test the Flow

1. App opens → Email Login screen appears
2. Enter any email (e.g., `test@example.com`)
3. Tap "Send Login Link"
4. In development mode, an alert shows the token
5. Copy the token
6. Test the deep link:

   **iOS Simulator:**
   ```bash
   xcrun simctl openurl booted "onboardingapp://auth/verify?token=PASTE_TOKEN_HERE"
   ```

   **Android Emulator:**
   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "onboardingapp://auth/verify?token=PASTE_TOKEN_HERE" com.onboardingbottomsheets
   ```

7. App authenticates → OnboardSheet appears
8. Choose "Not yet" → FeedbackSheet appears
9. Enter feedback → Submit
10. Check backend terminal for the Slack mock message!

## Using the Easy Start Script

Alternatively, use the provided startup script:

```bash
./start-dev.sh
```

This will:
- Start the backend server
- Show your local IP
- Start Metro bundler
- Give you next steps

Then in a new terminal:
```bash
npm run ios
# or
npm run android
```

## Common Issues

### "Connection Refused"
- Backend not running → Start it with `cd backend && go run main.go`
- Wrong IP in apiService.ts → Update with your actual local IP

### "Deep link doesn't work"
- Rebuild the app after changing native configs
- Make sure scheme is `onboardingapp://` not `onboardingapp:`

### "Onboarding doesn't appear"
- You're not a new user → Clear app data and reinstall
- Check Redux DevTools (if using)

## Testing API Directly

You can test the backend API using curl:

```bash
# Request magic link
curl -X POST http://localhost:8080/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# This returns a token, copy it

# Verify the token
curl "http://localhost:8080/api/auth/verify?token=PASTE_TOKEN_HERE"

# This returns a JWT, copy it

# Submit feedback
curl -X POST http://localhost:8080/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_JWT_HERE" \
  -d '{"content":"Great app!","platform":"ios"}'
```

## Next Steps

After you have it working:

1. Read the main [README.md](README.md) for detailed documentation
2. Check [backend/README.md](backend/README.md) for backend API details
3. Customize the UI in `src/screens/` and `src/components/`
4. Update store URLs in `ReviewSheet.tsx`
5. Set up actual email service in the backend

## Getting Help

If you encounter issues:

1. Check both terminal windows for errors
2. Look at Metro bundler logs
3. Check backend logs
4. Verify your IP address is correct
5. Make sure device and computer are on same network

## Development Tips

- **Hot Reload**: Changes to JS files auto-reload
- **Native Changes**: Rebuild app after changing iOS/Android files
- **Backend Changes**: Restart Go server
- **Clear State**: Uninstall app to reset all data
- **Debug Deep Links**: Use `console.log` in `App.tsx` handleDeepLink

## Success Indicators

✅ Backend shows "Server starting on port 8080"
✅ Metro shows "Loading..." then app launches
✅ Login screen appears with email input
✅ Magic link request shows success alert
✅ Deep link opens app and authenticates
✅ OnboardSheet appears automatically
✅ Feedback submits successfully
✅ Backend logs show the Slack mock message

You're all set! 🎉
