import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';
import { loadBestScore } from '../lib/storage';

const LOGO_TILES = [
  { value: 2, bg: '#9A7BFF' },
  { value: 4, bg: '#6A3DFF' },
  { value: 8, bg: '#48D9C4' },
  { value: 16, bg: '#FFD166' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [bestScore, setBestScore] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadBestScore().then((value) => {
        if (!cancelled) setBestScore(value);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoGrid}>
          {LOGO_TILES.map((tile) => (
            <View key={tile.value} style={[styles.logoTile, { backgroundColor: tile.bg }]}>
              <Text style={styles.logoTileText}>{tile.value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Fuzo</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Swipe. Merge. Beat your best.</Text>

        <Pressable
          onPress={() => router.push('/game')}
          style={({ pressed }) => [styles.playButton, { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.playButtonText}>Play</Text>
        </Pressable>

        <View style={[styles.bestPill, { backgroundColor: colors.surface }]}>
          <Text style={[styles.bestLabel, { color: colors.textSecondary }]}>BEST SCORE</Text>
          <Text style={[styles.bestValue, { color: colors.text }]}>{bestScore}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 96,
    height: 96,
    gap: 8,
    marginBottom: 20,
  },
  logoTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTileText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 28,
  },
  playButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 56,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  bestPill: {
    marginTop: 28,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bestLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bestValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
});
