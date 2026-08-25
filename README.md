# Fuzo — Merge Puzzle

A 2048-style merge puzzle game built with Expo (React Native) + TypeScript.

## Stack

- Expo SDK 57 / React Native / TypeScript
- `expo-router` for navigation (Home → Game)
- `@react-native-async-storage/async-storage` for local best-score persistence
- `react-native-gesture-handler` for swipe detection
- `react-native-reanimated` for tile slide/merge animations
- `react-native-google-mobile-ads` for banner / rewarded / interstitial ads (**TEST ad unit IDs only**, via the library's `TestIds`)
- `firebase` (JS SDK, not `@react-native-firebase`) for anonymous session/user management

## Project layout

```
lib/
  types.ts        Direction, Tile, Grid, GameState types
  gameLogic.ts     pure grid/move/merge/game-over logic — no UI dependencies
  gameLogic.test.ts  unit tests for gameLogic.ts (jest)
  storage.ts       AsyncStorage best-score persistence
  ads.ts           Mobile Ads SDK init + TEST ad unit id constants
  firebase.ts      Firebase app/auth init + anonymous session helper
app/
  _layout.tsx      root Stack layout, gesture/safe-area providers, ads + session init
  index.tsx        Home screen
  game.tsx         Game screen
components/        Board, TileView, ScoreBoard, GameOverOverlay, BannerAdSlot
hooks/              useTheme, useGameOverAds, useAuth
constants/theme.ts  color palette (light/dark) + tile colors
```

## Running

This app uses native modules (`react-native-google-mobile-ads`, `react-native-reanimated`,
`react-native-gesture-handler`) that are **not** available in the plain Expo Go app, so you need
a development build:

```bash
npm install
npx expo run:android   # or: npx expo run:ios (macOS only)
```

`npx expo start` also works once you have a dev-client build installed on a device/simulator.

## Testing & typechecking

```bash
npm test        # jest — game logic unit tests
npm run typecheck
```

## Ads

All ad unit IDs come from `react-native-google-mobile-ads`'s built-in `TestIds` (see `lib/ads.ts`),
and the AdMob App IDs in `app.json` are Google's public sample app IDs. **Nothing here is a real
ad account** — swap in your own AdMob app/ad unit IDs before any production build. Every ad call
is wrapped in try/catch with a graceful fallback (banner silently disappears on failure, "Watch ad
to continue" just won't be shown as ready, interstitial is skipped if it fails to load).

- Banner: bottom of the Game screen.
- Rewarded: "Watch ad to continue" on Game Over — clears one random tile and lets the player continue.
- Interstitial: shown after every 3rd Game Over where the player declines/skips the rewarded option.

## Session/user management

Every install gets a silent, anonymous Firebase session on first launch — no login screen, no
password. The session's `uid` is stable across app restarts (persisted via AsyncStorage) and is
the identity to hang future features off (per-user cloud scores, leaderboards, etc.), though
nothing currently reads or writes to it beyond creating the session.

Uses the **Firebase JS SDK** (`firebase` npm package), not `@react-native-firebase` — the JS SDK
is pure JavaScript with no native module/Gradle config to maintain, unlike the native SDK.

**One-time setup** (the placeholder config in `lib/firebase.ts` won't authenticate against a real
project):
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. In that project, add a **Web app** (the `</>` icon on the project overview page) — you don't
   need Android/iOS-specific registration since the JS SDK talks to Firebase over HTTPS. Give it
   any nickname.
3. Copy the `firebaseConfig` object Firebase shows you and paste its values into
   `lib/firebase.ts`, replacing the `REPLACE_WITH_*` placeholders.
4. In the Firebase console, go to **Build → Authentication → Sign-in method** and enable the
   **Anonymous** provider (it's off by default).

- `lib/firebase.ts` — initializes the Firebase app/auth instance and exports
  `ensureAnonymousSession()`, called once from `app/_layout.tsx` on startup.
- `hooks/useAuth.ts` — `{ user, uid, isLoading }` for any component that needs the current session.

## Explicitly out of scope for this pass

- App store submission / builds
- Real AdMob account & production ad unit IDs
- Non-anonymous sign-in (email/Google/etc.), cloud-synced scores, leaderboards
