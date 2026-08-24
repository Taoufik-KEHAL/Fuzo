import { memo, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { tileStyleFor } from '../constants/theme';
import type { Tile } from '../lib/types';

interface TileViewProps {
  tile: Tile;
  cellSize: number;
  gap: number;
  isNew: boolean;
  isMerged: boolean;
}

function TileViewImpl({ tile, cellSize, gap, isNew, isMerged }: TileViewProps) {
  const step = cellSize + gap;
  // Board renders with no padding of its own, so tiles must include the
  // leading gap themselves to line up with the background cell grid.
  const xFor = (col: number) => gap + col * step;
  const yFor = (row: number) => gap + row * step;
  const translateX = useSharedValue(xFor(tile.col));
  const translateY = useSharedValue(yFor(tile.row));
  const scale = useSharedValue(isNew ? 0 : 1);

  useEffect(() => {
    translateX.value = withTiming(xFor(tile.col), { duration: 110 });
    translateY.value = withTiming(yFor(tile.row), { duration: 110 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tile.row, tile.col]);

  useEffect(() => {
    if (isNew) {
      scale.value = 0;
      scale.value = withTiming(1, { duration: 150 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  useEffect(() => {
    if (isMerged) {
      scale.value = withSequence(withTiming(1.15, { duration: 90 }), withTiming(1, { duration: 90 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMerged]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  const tileStyle = tileStyleFor(tile.value);
  const fontSize = tile.value >= 1000 ? cellSize * 0.32 : cellSize * 0.42;

  return (
    <Animated.View
      style={[
        styles.tile,
        { width: cellSize, height: cellSize, backgroundColor: tileStyle.bg },
        animatedStyle,
      ]}
    >
      <Text style={[styles.value, { color: tileStyle.text, fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
        {tile.value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontWeight: '800',
  },
});

export const TileView = memo(TileViewImpl);
