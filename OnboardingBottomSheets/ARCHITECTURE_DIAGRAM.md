# Application Flow Diagram

## Complete Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         App Startup                             │
│                              ↓                                  │
│                    Redux Provider Init                          │
│                              ↓                                  │
│                  Navigation Container                           │
│                              ↓                                  │
│                        HomeScreen                               │
│                              ↓                                  │
│                  useOnboardingFlow Hook                         │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                ┌──────────────┴──────────────┐
                │                             │
                ↓                             ↓
   ┌────────────────────┐         ┌─────────────────────┐
   │  Backend API Call  │         │   Redux Store       │
   │  checkOnboarding   │────────→│   User State        │
   │  Status            │         │   Onboarding State  │
   └────────────────────┘         └─────────────────────┘
                                              ↓
                    ┌─────────────────────────┴─────────────────────────┐
                    │         Determine Which Sheet to Show             │
                    └─────────────────────────┬─────────────────────────┘
                                              ↓
        ┌─────────────────────┬──────────────┴──────────────┬─────────────────────┐
        │                     │                              │                     │
        ↓                     ↓                              ↓                     ↓
┌───────────────┐    ┌───────────────┐           ┌───────────────┐      ┌──────────────┐
│ SHEET 1:      │    │ SHEET 2:      │           │ SHEET 3:      │      │ No Sheet     │
│ OnboardSheet  │    │ FeedbackSheet │           │ ReviewSheet   │      │ (Complete)   │
│               │    │               │           │               │      │              │
│ - Welcome msg │    │ - Feedback    │           │ - App Store   │      │ - Normal app │
│ - Get Started │    │   input       │           │   redirect    │      │   experience │
│   button      │    │ - Submit/Skip │           │ - Rate/Later  │      │              │
└───────┬───────┘    └───────┬───────┘           └───────┬───────┘      └──────────────┘
        │                    │                           │
        │ User clicks        │ User submits              │ User rates
        │ "Get Started"      │ feedback                  │ or skips
        ↓                    ↓                           ↓
┌───────────────────┐ ┌──────────────────┐    ┌───────────────────┐
│ dispatch(         │ │ API POST         │    │ Linking.openURL   │
│ setWelcomeSeen()) │ │ /feedback        │    │ (App Store/Play)  │
└────────┬──────────┘ └────────┬─────────┘    └────────┬──────────┘
         │                     │                       │
         │ Redux State         │ Wait for response     │ dispatch(
         │ Updated             │ (Race prevention)     │ setReviewSeen())
         ↓                     ↓                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              Redux Store Updates & Triggers Next Sheet          │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
Redux Store State Structure:
{
  onboarding: {
    isOnboardingComplete: boolean,
    hasSeenWelcomeSheet: boolean,
    hasSeenFeedbackSheet: boolean,
    hasSeenReviewSheet: boolean,
    currentSheetIndex: number
  },
  user: {
    userId: string | null,
    isNewUser: boolean,
    lastOnboardingCheck: number | null
  }
}
```

## Sheet Visibility Logic

```typescript
// Sheet 1 (Welcome) shows when:
isOnboardingComplete === true && hasSeenWelcomeSheet === false

// Sheet 2 (Feedback) shows when:
hasSeenWelcomeSheet === true && hasSeenFeedbackSheet === false

// Sheet 3 (Review) shows when:
hasSeenFeedbackSheet === true && hasSeenReviewSheet === false

// No sheets show when:
hasSeenReviewSheet === true
```

## Race Condition Prevention (FeedbackSheet)

```
User clicks "Send Feedback"
        ↓
┌───────────────────────┐
│ Check isSubmittingRef │ ← Prevents duplicate submissions
└───────┬───────────────┘
        ↓ (if false)
┌───────────────────────┐
│ Set isSubmittingRef   │
│ = true                │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ Show loading state    │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ API POST /feedback    │ ← MUST complete before next step
└───────┬───────────────┘
        ↓ (await)
┌───────────────────────┐
│ Response received     │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ Update Redux state    │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ Close sheet (onClose) │ ← Only after successful API call
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ Set isSubmittingRef   │
│ = false               │
└───────────────────────┘
```

## API Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                     apiService.ts                       │
│                (Axios Configuration)                    │
│                                                         │
│  - Base URL configuration                               │
│  - Request interceptors (add auth token)                │
│  - Response interceptors (handle errors)                │
│  - Timeout: 10s                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│                 onboardingService.ts                    │
│              (Business Logic Layer)                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ checkOnboardingStatus(userId)                     │ │
│  │ → GET /onboarding/status/:userId                  │ │
│  │ → Returns: OnboardingStatus                       │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ submitFeedback(payload)                           │ │
│  │ → POST /feedback                                  │ │
│  │ → Returns: FeedbackResponse                       │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ markSheetSeen(userId, sheetType)                  │ │
│  │ → POST /onboarding/sheet-seen                     │ │
│  │ → Non-blocking (fire & forget)                    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
  └─ GestureHandlerRootView
      └─ ReduxProvider (Redux Store)
          └─ SafeAreaProvider
              └─ NavigationContainer
                  └─ RootNavigator (Stack)
                      └─ HomeScreen
                          ├─ ScrollView (main content)
                          │   ├─ Header
                          │   ├─ Features Section
                          │   └─ Debug Tools
                          │
                          └─ Bottom Sheets (conditionally rendered)
                              ├─ OnboardSheet (if shouldShowWelcomeSheet)
                              ├─ FeedbackSheet (if shouldShowFeedbackSheet)
                              └─ ReviewSheet (if shouldShowReviewSheet)
```

## Styling Architecture

```
constants.ts
  ├─ COLORS (primary, secondary, text, background, etc.)
  ├─ SPACING (xs, sm, md, lg, xl)
  └─ FONT_SIZES (xs, sm, md, lg, xl, xxl)
       ↓
  Used in all components via:
  import { COLORS, SPACING, FONT_SIZES } from '../utils/constants'
```

## Development Flow

```
1. Development:
   npm start         → Start Metro bundler
   npm run ios       → Build & run iOS
   npm run android   → Build & run Android

2. Testing:
   - Use "Reset Onboarding" button in HomeScreen
   - Sequential sheet testing
   - Backend API integration testing

3. Production:
   - Update API URLs
   - Add real images
   - Configure store URLs
   - Test on physical devices
```

---

This diagram provides a visual reference for understanding the complete application flow!
