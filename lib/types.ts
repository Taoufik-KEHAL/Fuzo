export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
}

export type Cell = Tile | null;

export type Grid = Cell[][];

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  isGameOver: boolean;
  nextTileId: number;
}

export interface MoveResult {
  grid: Grid;
  moved: boolean;
  scoreGained: number;
  mergedTileIds: number[];
}
