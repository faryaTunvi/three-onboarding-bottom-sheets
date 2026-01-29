# Project File Structure

## Complete File Tree

```
OnboardingBottomSheets/
│
├── Documentation
│   ├── README.md                      (Original React Native readme)
│   ├── PROJECT_README.md             (Complete project documentation)
│   ├── QUICK_START.md                (Quick start guide)
│   ├── IMPLEMENTATION_SUMMARY.md     (What was implemented)
│   ├── ARCHITECTURE_DIAGRAM.md       (Visual flow diagrams)
│   └── PRE_LAUNCH_CHECKLIST.md       (Pre-launch checklist)
│
├── Application Code
│   ├── App.tsx                       (Main app entry with providers)
│   ├── index.js                      (React Native entry point)
│   ├── babel.config.js               (Babel config with reanimated)
│   ├── react-native.config.js        (RN config for worklets)
│   ├── package.json                  (Dependencies)
│   └── tsconfig.json                 (TypeScript config)
│
├── src/
│   │
│   ├── components/
│   │   ├── Button.tsx                (Reusable button component)
│   │   ├── CustomInput.tsx           (Custom input with char counter)
│   │   └── index.ts                  (Component exports)
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx         (Stack navigator setup)
│   │   └── index.ts                  (Navigation exports)
│   │
│   ├── redux/
│   │   ├── store.ts                  (Redux store configuration)
│   │   ├── hooks.ts                  (Typed Redux hooks)
│   │   └── slices/
│   │       ├── onboardingSlice.ts    (Onboarding state management)
│   │       └── userSlice.ts          (User state management)
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx            (Main app screen)
│   │   ├── BottomSheets/
│   │   │   ├── OnboardSheet.tsx      (Sheet 1: Welcome)
│   │   │   ├── FeedbackSheet.tsx     (Sheet 2: Feedback)
│   │   │   ├── ReviewSheet.tsx       (Sheet 3: Review)
│   │   │   └── index.ts              (Sheet exports)
│   │   └── Onboarding/               (For future onboarding screens)
│   │
│   ├── services/
│   │   ├── apiService.ts             (Axios API configuration)
│   │   └── onboardingService.ts      (Onboarding API calls)
│   │
│   ├── utils/
│   │   ├── constants.ts              (App constants & theme)
│   │   ├── useOnboardingFlow.ts      (Custom hook for flow)
│   │   ├── mockData.ts               (Mock data for testing)
│   │   └── index.ts                  (Utils exports)
│   │
│   └── assets/                    (Images, icons - empty for now)
│
├── android/
│   ├── app/
│   │   └── src/main/java/com/onboardingbottomsheets/
│   │       ├── MainActivity.kt       (Updated for gestures)
│   │       └── MainApplication.kt
│   ├── build.gradle
│   └── ...
│
├── ios/
│   ├── OnboardingBottomSheets/
│   │   ├── AppDelegate.swift
│   │   └── ...
│   ├── Podfile                       (CocoaPods config)
│   └── ...
│
└── __tests__/
    └── App.test.tsx
```

## File Statistics

### Source Code Files Created: 26

#### Components (3)
- Button.tsx
- CustomInput.tsx
- index.ts

#### Navigation (2)
- RootNavigator.tsx
- index.ts

#### Redux (5)
- store.ts
- hooks.ts
- onboardingSlice.ts
- userSlice.ts
- (2 slice files)

#### Screens (5)
- HomeScreen.tsx
- OnboardSheet.tsx
- FeedbackSheet.tsx
- ReviewSheet.tsx
- index.ts

#### Services (2)
- apiService.ts
- onboardingService.ts

#### Utils (4)
- constants.ts
- useOnboardingFlow.ts
- mockData.ts
- index.ts

#### Configuration (3)
- App.tsx (updated)
- babel.config.js (updated)
- react-native.config.js (created)

#### Native (1)
- MainActivity.kt (updated)

#### Documentation (5)
- PROJECT_README.md
- QUICK_START.md
- IMPLEMENTATION_SUMMARY.md
- ARCHITECTURE_DIAGRAM.md
- PRE_LAUNCH_CHECKLIST.md

## Key Files Explained

### Entry Points
- **index.js** - React Native entry, registers app
- **App.tsx** - Wraps app with providers (Redux, Navigation, etc.)

### State Management
- **store.ts** - Configures Redux store
- **onboardingSlice.ts** - Manages sheet visibility & progress
- **userSlice.ts** - Manages user state & onboarding status

### Bottom Sheets
- **OnboardSheet.tsx** - First sheet (Welcome)
- **FeedbackSheet.tsx** - Second sheet (with race condition prevention)
- **ReviewSheet.tsx** - Third sheet (store redirects)

### API Layer
- **apiService.ts** - Base Axios configuration
- **onboardingService.ts** - Business logic for onboarding APIs

### Hooks
- **useOnboardingFlow.ts** - Main hook that orchestrates sheet flow

### Theme
- **constants.ts** - Centralized colors, spacing, fonts

## Lines of Code

Approximate breakdown:
- TypeScript/TSX: ~1,800 lines
- Configuration: ~50 lines
- Documentation: ~1,500 lines
- **Total: ~3,350 lines**

## Important Patterns Used

### Component Pattern
```typescript
// All components follow this structure:
import React from 'react';
import { StyleSheet } from 'react-native';

export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Logic
  return (
    // JSX
  );
};

const styles = StyleSheet.create({
  // Styles
});
```

### Redux Pattern
```typescript
// Slice structure:
const slice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Actions
  },
});
```

### Service Pattern
```typescript
// Service class:
class ServiceName {
  async method(params): Promise<ReturnType> {
    try {
      // API call
    } catch (error) {
      // Error handling
    }
  }
}

export default new ServiceName();
```

## How to Navigate the Code

1. **Start with App.tsx** - See how everything is wired together
2. **Check HomeScreen.tsx** - See the main UI and sheet logic
3. **Explore BottomSheets/** - See individual sheet implementations
4. **Review redux/slices/** - Understand state management
5. **Check services/** - See API integration
6. **Look at utils/** - See helper functions and hooks

## Documentation Hierarchy

1. **QUICK_START.md** - First read, get running quickly
2. **PROJECT_README.md** - Full documentation
3. **ARCHITECTURE_DIAGRAM.md** - Visual understanding
4. **IMPLEMENTATION_SUMMARY.md** - What was built
5. **PRE_LAUNCH_CHECKLIST.md** - Production readiness

---

This file structure follows React Native and Redux best practices with clear separation of concerns!
