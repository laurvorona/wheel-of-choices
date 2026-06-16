# Wheel of Choices

A simple iOS/Android spinner wheel app built with Expo, React Native, and TypeScript.

Add your options on **Manage**, spin on **Spin**, and the wheel picks one at random with equal slices. Your list is saved locally on device.

## Setup

Requires [Node.js](https://nodejs.org/) LTS.

```bash
npm install
```

## Run

```bash
npm start
```

Then press `a` for Android emulator, or scan the QR code with **Expo Go** on your phone.

```bash
npm run android
npm run ios   # requires macOS for simulator; use Expo Go on iPhone otherwise
```

## Stack

- Expo SDK 54 + Expo Router (tabs) — matches App Store / Play Store Expo Go
- React Native Reanimated + react-native-svg (wheel)
- AsyncStorage (persist single option list)
- expo-haptics (feedback on win)

## Store builds (later)

Use [EAS Build](https://docs.expo.dev/build/introduction/) when ready for TestFlight / Play Store.
