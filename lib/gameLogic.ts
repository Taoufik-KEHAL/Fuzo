import type { Cell, Direction, GameState, Grid, MoveResult, Tile } from './types';

export const GRID_SIZE = 4;
export const NEW_TILE_FOUR_CHANCE = 0.1;

export function createEmptyGrid(size: number = GRID_SIZE): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null as Cell));
}

export function getEmptyCells(grid: Grid): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === null) cells.push({ row, col });
    }
  }
  return cells;
}

/**
 * Maps a (lineIndex, distanceFromWall) pair to a grid coordinate for a given
 * slide direction. `lineIndex` is the row (for left/right) or column (for
 * up/down) being processed; `pos` is the distance from the wall tiles slide
 * toward.
 */
function coordFor(direction: Direction, lineIndex: number, pos: number, size: number): { row: number; col: number } {
  switch (direction) {
    case 'left':
      return { row: lineIndex, col: pos };
    case 'right':
      return { row: lineIndex, col: size - 1 - pos };
    case 'up':
      return { row: pos, col: lineIndex };
    case 'down':
      return { row: size - 1 - pos, col: lineIndex };
  }
}

function mergeLine(tiles: Tile[]): { line: Tile[]; scoreGained: number; mergedIds: number[] } {
  const line: Tile[] = [];
  const mergedIds: number[] = [];
  let scoreGained = 0;
  let i = 0;
  while (i < tiles.length) {
    const current = tiles[i];
    const next = tiles[i + 1];
    if (next && next.value === current.value) {
      const mergedValue = current.value * 2;
      line.push({ id: current.id, value: mergedValue, row: current.row, col: current.col });
      scoreGained += mergedValue;
      mergedIds.push(current.id, next.id);
      i += 2;
    } else {
      line.push(current);
      i += 1;
    }
  }
  return { line, scoreGained, mergedIds };
}

function gridValuesEqual(a: Grid, b: Grid): boolean {
  for (let row = 0; row < a.length; row++) {
    for (let col = 0; col < a[row].length; col++) {
      const av = a[row][col]?.value ?? null;
      const bv = b[row][col]?.value ?? null;
      if (av !== bv) return false;
    }
  }
  return true;
}

export function move(grid: Grid, direction: Direction): MoveResult {
  const size = grid.length;
  const newGrid = createEmptyGrid(size);
  let scoreGained = 0;
  const mergedTileIds: number[] = [];

  for (let lineIndex = 0; lineIndex < size; lineIndex++) {
    const tiles: Tile[] = [];
    for (let pos = 0; pos < size; pos++) {
      const { row, col } = coordFor(direction, lineIndex, pos, size);
      const tile = grid[row][col];
      if (tile) tiles.push(tile);
    }

    const { line, scoreGained: gained, mergedIds } = mergeLine(tiles);
    scoreGained += gained;
    mergedTileIds.push(...mergedIds);

    line.forEach((tile, pos) => {
      const { row, col } = coordFor(direction, lineIndex, pos, size);
      newGrid[row][col] = { ...tile, row, col };
    });
  }

  return {
    grid: newGrid,
    moved: !gridValuesEqual(grid, newGrid),
    scoreGained,
    mergedTileIds,
  };
}

export function spawnRandomTile(
  grid: Grid,
  nextTileId: number,
  rng: () => number = Math.random
): { grid: Grid; nextTileId: number } {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return { grid, nextTileId };

  const { row, col } = emptyCells[Math.floor(rng() * emptyCells.length)];
  const value = rng() < NEW_TILE_FOUR_CHANCE ? 4 : 2;

  const newGrid = grid.map((r) => r.slice());
  newGrid[row][col] = { id: nextTileId, value, row, col };

  return { grid: newGrid, nextTileId: nextTileId + 1 };
}

export function hasAvailableMoves(grid: Grid): boolean {
  const size = grid.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const tile = grid[row][col];
      if (!tile) return true;

      const right = col + 1 < size ? grid[row][col + 1] : null;
      if (right && right.value === tile.value) return true;

      const down = row + 1 < size ? grid[row + 1][col] : null;
      if (down && down.value === tile.value) return true;
    }
  }
  return false;
}

export function isGameOver(grid: Grid): boolean {
  return !hasAvailableMoves(grid);
}

export function createInitialState(bestScore: number = 0, rng: () => number = Math.random): GameState {
  let grid = createEmptyGrid();
  let nextTileId = 1;

  for (let i = 0; i < 2; i++) {
    const spawned = spawnRandomTile(grid, nextTileId, rng);
    grid = spawned.grid;
    nextTileId = spawned.nextTileId;
  }

  return { grid, score: 0, bestScore, isGameOver: false, nextTileId };
}

export interface ApplyMoveResult extends GameState {
  /** Whether the move actually changed the board. */
  moved: boolean;
  /** Ids of tiles that were the surviving half of a merge this turn (for a "pop" animation). */
  mergedTileIds: number[];
  /** Id of the tile spawned after this move, if any (for a "spawn" animation). */
  spawnedTileId: number | null;
}

/**
 * Applies a full turn: slide/merge in `direction`, then (if the board
 * actually changed) spawn a new random tile and re-evaluate game-over state.
 */
export function applyMove(state: GameState, direction: Direction, rng: () => number = Math.random): ApplyMoveResult {
  const result = move(state.grid, direction);
  if (!result.moved) {
    return { ...state, moved: false, mergedTileIds: [], spawnedTileId: null };
  }

  const score = state.score + result.scoreGained;
  const spawned = spawnRandomTile(result.grid, state.nextTileId, rng);
  const spawnedTileId = spawned.nextTileId > state.nextTileId ? state.nextTileId : null;

  return {
    grid: spawned.grid,
    score,
    bestScore: Math.max(state.bestScore, score),
    isGameOver: isGameOver(spawned.grid),
    nextTileId: spawned.nextTileId,
    moved: true,
    mergedTileIds: result.mergedTileIds,
    spawnedTileId,
  };
}

/** Clears one random occupied cell on the board (rewarded-ad continue). */
export function clearRandomTile(grid: Grid, rng: () => number = Math.random): Grid {
  const occupied: { row: number; col: number }[] = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col]) occupied.push({ row, col });
    }
  }
  if (occupied.length === 0) return grid;

  const { row, col } = occupied[Math.floor(rng() * occupied.length)];
  const newGrid = grid.map((r) => r.slice());
  newGrid[row][col] = null;
  return newGrid;
}

export function gridToNumbers(grid: Grid): number[][] {
  return grid.map((row) => row.map((cell) => cell?.value ?? 0));
}
