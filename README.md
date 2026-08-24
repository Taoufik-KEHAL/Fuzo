# Fuzo — Merge Puzzle

A 2048-style merge puzzle game built with Expo (React Native) + TypeScript.

## Stack

- Expo SDK 57 / React Native / TypeScript
- `expo-router` for navigation (Home → Game)
- `@react-native-async-storage/async-storage` for local best-score persistence
- `react-native-gesture-handler` for swipe detection
- `react-native-reanimated` for tile slide/merge animations

## Project layout

```
lib/
  types.ts        Direction, Tile, Grid, GameState types
  gameLogic.ts     pure grid/move/merge/game-over logic — no UI dependencies
  gameLogic.test.ts  unit tests for gameLogic.ts (jest)
  storage.ts       AsyncStorage best-score persistence
app/
  _layout.tsx      root Stack layout, gesture/safe-area providers
  index.tsx        Home screen
  game.tsx         Game screen
components/        Board, TileView, ScoreBoard, GameOverOverlay
hooks/              useTheme
constants/theme.ts  color palette (light/dark) + tile colors
```

## Running

This app uses native modules (`react-native-reanimated`, `react-native-gesture-handler`) that are
**not** available in the plain Expo Go app, so you need a development build:

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

## Explicitly out of scope for this pass

- App store submission / builds
- Backend / accounts / leaderboards
