export type TileStatus = 'falling' | 'stable' | 'popped' | 'clearing';

export interface Tile {
    id: string;
    letter: string;
    status: TileStatus;
    row: number;
    col: number;
    type: 'letter' | 'bomb';
}

export type Grid = (Tile | null)[][];

export type GameStatus = 'idle' | 'playing' | 'gameover' | 'won' | 'clearing';

export interface GameState {
    grid: Grid;
    queue: string[]; // Upcoming letters
    score: number;
    highScore: number;
    combo: number;
    status: GameStatus;
    message: string | null; // For "Combo x3!" etc
    lastWords: string[]; // For FloatingWords display
    holdItem: string | null;
    canHold: boolean;
}

export const GRID_ROWS = 6;
export const GRID_COLS = 5;

// Scrabble-like distribution tuned for fun (more vowels/common letters)
export const LETTER_DISTRIBUTION: Record<string, number> = {
    A: 12, B: 2, C: 2, D: 5, E: 15, F: 2, G: 3, H: 3, I: 11, J: 1, K: 1, L: 5, M: 3,
    N: 8, O: 10, P: 3, Q: 1, R: 8, S: 6, T: 8, U: 6, V: 2, W: 2, X: 1, Y: 3, Z: 1
};

export const INITIAL_STATE: GameState = {
    grid: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null)),
    queue: [],
    score: 0,
    highScore: parseInt(localStorage.getItem('wordfall_highscore') || '0'),
    combo: 1,
    status: 'idle',
    message: null,
    lastWords: [],
    holdItem: null,
    canHold: true
};
