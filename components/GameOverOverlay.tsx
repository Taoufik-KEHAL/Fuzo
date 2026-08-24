import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '../constants/theme';

interface GameOverOverlayProps {
  colors: ThemeColors;
  finalScore: number;
  isNewBest: boolean;
  onNewGame: () => void;
}

export function GameOverOverlay({ colors, finalScore, isNewBest, onNewGame }: GameOverOverlayProps) {
  return (
    <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Game Over</Text>
        <Text style={[styles.score, { color: colors.accent }]}>{finalScore}</Text>
        {isNewBest && <Text style={[styles.newBest, { color: colors.accentSecondary }]}>New best!</Text>}

        <Pressable
          onPress={onNewGame}
          style={[styles.button, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.buttonText}>New game</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  score: {
    fontSize: 44,
    fontWeight: '900',
    marginTop: 8,
  },
  newBest: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
