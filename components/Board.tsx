import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { GRID_SIZE } from '../lib/gameLogic';
import type { Direction, Grid } from '../lib/types';
import { TileView } from './TileView';

interface BoardProps {
  grid: Grid;
  boardSize: number;
  cellGap: number;
  boardColor: string;
  cellColor: string;
  mergedTileIds: number[];
  newTileIds: number[];
  onSwipe: (direction: Direction) => void;
  disabled: boolean;
}

const SWIPE_DISTANCE_THRESHOLD = 24;

export function Board({
  grid,
  boardSize,
  cellGap,
  boardColor,
  cellColor,
  mergedTileIds,
  newTileIds,
  onSwipe,
  disabled,
}: BoardProps) {
  const cellSize = (boardSize - cellGap * (GRID_SIZE + 1)) / GRID_SIZE;

  const handleSwipe = (direction: Direction) => {
    if (!disabled) onSwipe(direction);
  };

  const panGesture = Gesture.Pan()
    .minDistance(SWIPE_DISTANCE_THRESHOLD)
    .onEnd((event) => {
      'worklet';
      const { translationX, translationY } = event;
      const direction: Direction =
        Math.abs(translationX) > Math.abs(translationY)
          ? translationX > 0
            ? 'right'
            : 'left'
          : translationY > 0
            ? 'down'
            : 'up';
      runOnJS(handleSwipe)(direction);
    });

  const tiles = grid.flat().filter((cell): cell is NonNullable<typeof cell> => cell !== null);

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
            backgroundColor: boardColor,
          },
        ]}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;
          return (
            <View
              key={`cell-${row}-${col}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  left: cellGap + col * (cellSize + cellGap),
                  top: cellGap + row * (cellSize + cellGap),
                  backgroundColor: cellColor,
                },
              ]}
            />
          );
        })}
        {tiles.map((tile) => (
          <TileView
            key={tile.id}
            tile={tile}
            cellSize={cellSize}
            gap={cellGap}
            isNew={newTileIds.includes(tile.id)}
            isMerged={mergedTileIds.includes(tile.id)}
          />
        ))}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
    borderRadius: 12,
  },
});
