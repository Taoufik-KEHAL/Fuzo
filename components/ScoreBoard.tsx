import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '../constants/theme';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  colors: ThemeColors;
}

function ScorePill({ label, value, colors }: { label: string; value: number; colors: ThemeColors }) {
  return (
    <View style={[styles.pill, { backgroundColor: colors.surface }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export function ScoreBoard({ score, bestScore, colors }: ScoreBoardProps) {
  return (
    <View style={styles.row}>
      <ScorePill label="SCORE" value={score} colors={colors} />
      <ScorePill label="BEST" value={bestScore} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    minWidth: 84,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
});
