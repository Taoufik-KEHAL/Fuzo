import {
  applyMove,
  clearRandomTile,
  createEmptyGrid,
  createInitialState,
  getEmptyCells,
  gridToNumbers,
  hasAvailableMoves,
  isGameOver,
  move,
  spawnRandomTile,
} from './gameLogic';
import type { Grid } from './types';

let nextId = 1;
function tile(value: number, row: number, col: number) {
  return { id: nextId++, value, row, col };
}

function gridFrom(rows: (number | null)[][]): Grid {
  return rows.map((row, r) => row.map((value, c) => (value === null ? null : tile(value, r, c))));
}

/** Builds a full 4x4 grid with `row` as row 0 and the rest empty. */
function row4(row: (number | null)[]): Grid {
  return gridFrom([row, [null, null, null, null], [null, null, null, null], [null, null, null, null]]);
}

/** Builds a full 4x4 grid with `col` as column 0 and the rest empty. */
function col4(col: (number | null)[]): Grid {
  return gridFrom(col.map((value) => [value, null, null, null]));
}

beforeEach(() => {
  nextId = 1;
});

describe('createEmptyGrid', () => {
  it('creates a 4x4 grid of nulls', () => {
    const grid = createEmptyGrid();
    expect(grid.length).toBe(4);
    grid.forEach((row) => {
      expect(row.length).toBe(4);
      row.forEach((cell) => expect(cell).toBeNull());
    });
  });
});

describe('getEmptyCells', () => {
  it('returns every empty coordinate', () => {
    const grid = gridFrom([
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    expect(getEmptyCells(grid).length).toBe(15);
  });
});

describe('move - slide without merge', () => {
  it('slides tiles left, compacting gaps', () => {
    const grid = gridFrom([
      [null, 2, null, 4],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const result = move(grid, 'left');
    expect(gridToNumbers(result.grid)[0]).toEqual([2, 4, 0, 0]);
    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(0);
  });

  it('slides tiles right', () => {
    const grid = row4([2, null, 4, null]);
    const result = move(grid, 'right');
    expect(gridToNumbers(result.grid)[0]).toEqual([0, 0, 2, 4]);
  });

  it('slides tiles up within a column', () => {
    const grid = col4([null, 2, null, 4]);
    const result = move(grid, 'up');
    expect(gridToNumbers(result.grid).map((r) => r[0])).toEqual([2, 4, 0, 0]);
  });

  it('slides tiles down within a column', () => {
    const grid = col4([2, null, 4, null]);
    const result = move(grid, 'down');
    expect(gridToNumbers(result.grid).map((r) => r[0])).toEqual([0, 0, 2, 4]);
  });

  it('reports moved: false when nothing changes', () => {
    const grid = gridFrom([
      [2, 4, 8, 16],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const result = move(grid, 'left');
    expect(result.moved).toBe(false);
  });
});

describe('move - merging', () => {
  it('merges two equal adjacent tiles into one, doubling the value', () => {
    const grid = row4([2, 2, null, null]);
    const result = move(grid, 'left');
    expect(gridToNumbers(result.grid)[0]).toEqual([4, 0, 0, 0]);
    expect(result.scoreGained).toBe(4);
  });

  it('does not chain-merge an already-merged tile in the same move', () => {
    const grid = row4([2, 2, 2, 2]);
    const result = move(grid, 'left');
    expect(gridToNumbers(result.grid)[0]).toEqual([4, 4, 0, 0]);
    expect(result.scoreGained).toBe(8);
  });

  it('merges only the closest pair, leaving the odd tile out', () => {
    const grid = row4([2, 2, 2, null]);
    const result = move(grid, 'left');
    expect(gridToNumbers(result.grid)[0]).toEqual([4, 2, 0, 0]);
  });

  it('does not merge tiles of different values', () => {
    const grid = row4([2, 4, null, null]);
    const result = move(grid, 'left');
    expect(gridToNumbers(result.grid)[0]).toEqual([2, 4, 0, 0]);
    expect(result.moved).toBe(false);
  });

  it('merges across a gap after sliding', () => {
    const grid = row4([2, null, 2, null]);
    const result = move(grid, 'left');
    expect(gridToNumbers(result.grid)[0]).toEqual([4, 0, 0, 0]);
    expect(result.scoreGained).toBe(4);
  });
});

describe('spawnRandomTile', () => {
  it('places a 2 when rng is above the 4-chance threshold', () => {
    const grid = createEmptyGrid();
    const rng = jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.5);
    const { grid: next } = spawnRandomTile(grid, 1, rng);
    expect(gridToNumbers(next)[0][0]).toBe(2);
  });

  it('places a 4 when rng is below the 4-chance threshold', () => {
    const grid = createEmptyGrid();
    const rng = jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.05);
    const { grid: next } = spawnRandomTile(grid, 1, rng);
    expect(gridToNumbers(next)[0][0]).toBe(4);
  });

  it('is a no-op on a full grid', () => {
    const grid = gridFrom(Array.from({ length: 4 }, () => [2, 2, 2, 2]));
    const { grid: next, nextTileId } = spawnRandomTile(grid, 5);
    expect(next).toBe(grid);
    expect(nextTileId).toBe(5);
  });
});

describe('hasAvailableMoves / isGameOver', () => {
  it('is true when the grid has empty cells', () => {
    const grid = createEmptyGrid();
    expect(hasAvailableMoves(grid)).toBe(true);
    expect(isGameOver(grid)).toBe(false);
  });

  it('is true when a full grid still has an adjacent merge', () => {
    const grid = gridFrom([
      [2, 4, 8, 16],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4],
    ]);
    expect(hasAvailableMoves(grid)).toBe(true);
  });

  it('is false when the grid is full with no possible merges', () => {
    const grid = gridFrom([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(hasAvailableMoves(grid)).toBe(false);
    expect(isGameOver(grid)).toBe(true);
  });
});

describe('createInitialState', () => {
  it('starts with score 0 and exactly two tiles on the board', () => {
    const state = createInitialState(100, () => 0.5);
    expect(state.score).toBe(0);
    expect(state.bestScore).toBe(100);
    expect(state.isGameOver).toBe(false);
    const filled = state.grid.flat().filter(Boolean);
    expect(filled.length).toBe(2);
  });
});

describe('applyMove', () => {
  it('increments score, spawns a tile, and updates bestScore', () => {
    const grid = gridFrom([
      [2, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const state = { grid, score: 10, bestScore: 10, isGameOver: false, nextTileId: 99 };
    const next = applyMove(state, 'left', () => 0.5);
    expect(next.moved).toBe(true);
    expect(next.score).toBe(14);
    expect(next.bestScore).toBe(14);
    expect(next.mergedTileIds).toEqual([1, 2]);
    expect(next.spawnedTileId).toBe(99);
    const filled = next.grid.flat().filter(Boolean);
    expect(filled.length).toBe(2); // merged tile + newly spawned tile
  });

  it('leaves state unchanged when the move is illegal', () => {
    const grid = gridFrom([
      [2, 4, 8, 16],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]);
    const state = { grid, score: 0, bestScore: 0, isGameOver: false, nextTileId: 5 };
    const next = applyMove(state, 'left');
    expect(next.moved).toBe(false);
    expect(next.grid).toBe(state.grid);
    expect(next.score).toBe(state.score);
    expect(next.nextTileId).toBe(state.nextTileId);
    expect(next.mergedTileIds).toEqual([]);
    expect(next.spawnedTileId).toBeNull();
  });
});

describe('clearRandomTile', () => {
  it('removes exactly one occupied cell', () => {
    const grid = gridFrom([[2, 4, null, null]]);
    const cleared = clearRandomTile(grid, () => 0);
    const filled = cleared.flat().filter(Boolean);
    expect(filled.length).toBe(1);
  });

  it('is a no-op on an empty grid', () => {
    const grid = createEmptyGrid();
    const cleared = clearRandomTile(grid);
    expect(cleared).toBe(grid);
  });
});
