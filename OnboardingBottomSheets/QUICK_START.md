# Quick Start Guide

## Prerequisites
- Node.js >= 20
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS: `sudo gem install cocoapods`)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. iOS Setup
```bash
cd ios
bundle install  # Install Ruby dependencies (first time only)
pod install     # Install CocoaPods dependencies
cd ..
```

### 3. Android Setup
No additional setup required. Gradle will download dependencies automatically.

## Running the Application

### Start Metro Bundler
```bash
npm start
```

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

## Configuration

### API Endpoint
Edit `src/services/apiService.ts`:
```typescript
const API_BASE_URL = 'https://your-api.com'; // Replace with your API
```

### App Store / Play Store URLs
Edit `src/screens/BottomSheets/ReviewSheet.tsx`:
```typescript
const APP_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE';
```

## Testing the Onboarding Flow

1. Launch the app
2. The HomeScreen has a "Reset Onboarding Flow" button
3. Click it to restart the onboarding sequence
4. Three sheets will appear sequentially:
   - **Welcome Sheet** → Introduces the user
   - **Feedback Sheet** → Collects user feedback
   - **Review Sheet** → Prompts for app store review

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   └── CustomInput.tsx
├── navigation/          # React Navigation setup
│   └── RootNavigator.tsx
├── redux/              # State management
│   ├── store.ts
│   ├── hooks.ts
│   └── slices/
│       ├── onboardingSlice.ts
│       └── userSlice.ts
├── screens/
│   ├── BottomSheets/   # Three onboarding sheets
│   │   ├── OnboardSheet.tsx
│   │   ├── FeedbackSheet.tsx
│   │   └── ReviewSheet.tsx
│   └── HomeScreen.tsx
├── services/           # API layer
│   ├── apiService.ts
│   └── onboardingService.ts
└── utils/             # Helpers and hooks
    ├── constants.ts
    └── useOnboardingFlow.ts
```

## Key Features Implemented

### 1. Welcome Sheet (OnboardSheet)
- Shows automatically after user completes onboarding
- Backend integration to check onboarding status
- Dismissible via "Get Started" button

### 2. Feedback Sheet (FeedbackSheet)
- Custom input component with character counter (500 max)
- Race condition prevention using refs
- Backend API call waits before closing
- Skip or submit options

### 3. Review Sheet (ReviewSheet)
- Platform-specific store redirects
- iOS → App Store
- Android → Google Play
- Deep linking implementation

## Backend API Requirements

Your backend should implement these endpoints:

### GET /onboarding/status/:userId
```json
{
  "isNewUser": boolean,
  "hasCompletedOnboarding": boolean,
  "userId": string,
  "timestamp": number
}
```

### POST /feedback
```json
{
  "userId": string,
  "feedback": string,
  "timestamp": number,
  "platform": "ios" | "android"
}
```

### POST /onboarding/sheet-seen
```json
{
  "userId": string,
  "sheetType": "welcome" | "feedback" | "review",
  "timestamp": number
}
```

## Troubleshooting

### iOS Pod Install Issues
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Metro Bundler Cache Issues
```bash
npm start -- --reset-cache
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

## Architecture Highlights

 **Redux Toolkit** for predictable state management
 **TypeScript** for type safety
 **Feature-based structure** for scalability
 **Race condition prevention** in async operations
 **Platform-specific logic** (iOS/Android)
 **Separation of concerns** (UI/Logic/API)

## Next Steps

1. Replace placeholder API URL with your backend
2. Add actual images to replace emoji placeholders
3. Configure App Store and Play Store URLs
4. Customize colors and styling in `src/utils/constants.ts`
5. Add analytics tracking for sheet interactions
6. Implement proper authentication and user management

## Support

For issues or questions:
- Check the PROJECT_README.md for detailed documentation
- Review TypeScript types for API contracts
- Examine Redux DevTools for state debugging

---

**Happy Coding!**
