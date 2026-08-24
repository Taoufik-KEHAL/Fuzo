import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerAdSlot } from '../components/BannerAdSlot';
import { Board } from '../components/Board';
import { GameOverOverlay } from '../components/GameOverOverlay';
import { ScoreBoard } from '../components/ScoreBoard';
import { useGameOverAds } from '../hooks/useGameOverAds';
import { useTheme } from '../hooks/useTheme';
import { applyMove, clearRandomTile, createInitialState, isGameOver as checkGameOver } from '../lib/gameLogic';
import { loadBestScore, saveBestScore } from '../lib/storage';
import type { Direction, GameState } from '../lib/types';

const BOARD_MARGIN = 20;
const CELL_GAP = 10;
const MAX_BOARD_SIZE = 420;

export default function GameScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { isRewardedReady, watchRewardedAd, registerDecline } = useGameOverAds();

  const [state, setState] = useState<GameState | null>(null);
  const [paused, setPaused] = useState(false);
  const [mergedTileIds, setMergedTileIds] = useState<number[]>([]);
  const [newTileIds, setNewTileIds] = useState<number[]>([]);
  const [wasNewBest, setWasNewBest] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const bestAtStartRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    loadBestScore().then((best) => {
      if (cancelled) return;
      bestAtStartRef.current = best;
      setState(createInitialState(best));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSwipe = useCallback(
    (direction: Direction) => {
      if (paused) return;
      setState((prev) => {
        if (!prev || prev.isGameOver) return prev;
        const result = applyMove(prev, direction);
        if (!result.moved) return prev;

        setMergedTileIds(result.mergedTileIds);
        setNewTileIds(result.spawnedTileId !== null ? [result.spawnedTileId] : []);

        if (result.bestScore > bestAtStartRef.current) {
          bestAtStartRef.current = result.bestScore;
          setWasNewBest(true);
          saveBestScore(result.bestScore);
        }

        return {
          grid: result.grid,
          score: result.score,
          bestScore: result.bestScore,
          isGameOver: result.isGameOver,
          nextTileId: result.nextTileId,
        };
      });
    },
    [paused]
  );

  const handleNewGame = useCallback(() => {
    setState(createInitialState(bestAtStartRef.current));
    setMergedTileIds([]);
    setNewTileIds([]);
    setWasNewBest(false);
    setIsContinuing(false);
    setPaused(false);
  }, []);

  const handleWatchAd = useCallback(() => {
    setIsContinuing(true);
    const started = watchRewardedAd(() => {
      setState((prev) => {
        if (!prev) return prev;
        const grid = clearRandomTile(prev.grid);
        return { ...prev, grid, isGameOver: checkGameOver(grid) };
      });
      setIsContinuing(false);
    });
    if (!started) setIsContinuing(false);
  }, [watchRewardedAd]);

  const handleDeclineContinue = useCallback(() => {
    registerDecline();
    handleNewGame();
  }, [registerDecline, handleNewGame]);

  const boardSize = Math.min(width - BOARD_MARGIN * 2, MAX_BOARD_SIZE);

  if (!state) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.textSecondary }}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.headerButtonText, { color: colors.accent }]}>← Home</Text>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setPaused((p) => !p)} hitSlop={12} style={styles.headerButtonSpacing}>
            <Text style={[styles.headerButtonText, { color: colors.accent }]}>{paused ? 'Resume' : 'Pause'}</Text>
          </Pressable>
          <Pressable onPress={handleNewGame} hitSlop={12}>
            <Text style={[styles.headerButtonText, { color: colors.danger }]}>Restart</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <ScoreBoard score={state.score} bestScore={state.bestScore} colors={colors} />
      </View>

      <View style={styles.boardWrap}>
        <Board
          grid={state.grid}
          boardSize={boardSize}
          cellGap={CELL_GAP}
          boardColor={colors.board}
          cellColor={colors.cell}
          mergedTileIds={mergedTileIds}
          newTileIds={newTileIds}
          onSwipe={handleSwipe}
          disabled={paused || state.isGameOver}
        />

        {paused && !state.isGameOver && (
          <View style={[styles.pauseOverlay, { backgroundColor: colors.overlay }]}>
            <Text style={styles.pauseText}>Paused</Text>
          </View>
        )}

        {state.isGameOver && (
          <GameOverOverlay
            colors={colors}
            finalScore={state.score}
            isNewBest={wasNewBest}
            isRewardedReady={isRewardedReady}
            isContinuing={isContinuing}
            onWatchAd={handleWatchAd}
            onNewGame={handleDeclineContinue}
          />
        )}
      </View>

      <BannerAdSlot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: BOARD_MARGIN,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonSpacing: {
    marginRight: 18,
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scoreRow: {
    paddingHorizontal: BOARD_MARGIN,
    marginTop: 12,
    marginBottom: 16,
  },
  boardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
});
