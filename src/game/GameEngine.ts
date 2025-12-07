import { type GameState, type Tile, LETTER_DISTRIBUTION, GRID_ROWS, GRID_COLS, INITIAL_STATE } from './GameState';
import { dictionary } from './Dictionary';

// Letter generation
function getRandomLetter(): string {
    const letters = Object.keys(LETTER_DISTRIBUTION);
    const totalWeight = Object.values(LETTER_DISTRIBUTION).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (const letter of letters) {
        random -= LETTER_DISTRIBUTION[letter];
        if (random <= 0) return letter;
    }
    return 'E'; // Fallback
}

export function getRandomItem(): string {
    return Math.random() < 0.05 ? '💣' : getRandomLetter();
}

export function initGame(): GameState {
    const startQueue = Array(5).fill(null).map(() => getRandomItem());
    return {
        ...INITIAL_STATE,
        queue: startQueue
    };
}

export function dropTile(state: GameState, col: number): GameState {
    if (state.status !== 'playing' && state.status !== 'idle') return state;

    // Find lowest empty row
    let targetRow = GRID_ROWS - 1;
    while (targetRow >= 0 && state.grid[targetRow][col] !== null) {
        targetRow--;
    }

    if (targetRow < 0) {
        // Column full
        if (state.grid[0][col] !== null) {
            return { ...state, status: 'gameover', message: 'Game Over!' };
        }
        return state;
    }

    const newGrid = state.grid.map(row => [...row]);
    const letter = state.queue[0];
    const newQueue = [...state.queue.slice(1), getRandomItem()];
    const isBomb = letter === '💣';

    const newTile: Tile = {
        id: `t-${Date.now()}-${Math.random()}`,
        letter,
        status: 'falling', // Triggers fall animation on entry
        row: targetRow,
        col: col,
        type: isBomb ? 'bomb' : 'letter'
    };

    newGrid[targetRow][col] = newTile;

    return {
        ...state,
        grid: newGrid,
        queue: newQueue,
        status: 'playing', // Starts the game loop
        message: null,
        combo: 0, // Reset combo on new turn
        canHold: true // Reset hold capability
    };
}

export function holdTile(state: GameState): GameState {
    if (!state.canHold || (state.status !== 'playing' && state.status !== 'idle')) return state;

    const currentItem = state.queue[0];
    let newQueue = [...state.queue];
    let newHold = state.holdItem;

    if (state.holdItem === null) {
        // First hold: Move current to hold, shift queue
        newHold = currentItem;
        newQueue = [...state.queue.slice(1), getRandomItem()];
    } else {
        // Swap
        newHold = currentItem;
        newQueue[0] = state.holdItem; // Swap back in
    }

    return {
        ...state,
        queue: newQueue,
        holdItem: newHold,
        canHold: false // Disable until drop
    };
}

export function checkMatches(state: GameState): { newState: GameState, clearedCount: number } {
    const grid = state.grid;
    const toRemove = new Set<string>();
    let wordsFound: string[] = [];

    // Check for Bombs first
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const tile = grid[r][c];
            if (tile && tile.type === 'bomb' && tile.status !== 'popped') {
                toRemove.add(tile.id);
                // Explode neighbors 3x3
                for (let br = r - 1; br <= r + 1; br++) {
                    for (let bc = c - 1; bc <= c + 1; bc++) {
                        if (br >= 0 && br < GRID_ROWS && bc >= 0 && bc < GRID_COLS) {
                            const neighbor = grid[br][bc];
                            if (neighbor && neighbor.status !== 'popped') {
                                toRemove.add(neighbor.id);
                            }
                        }
                    }
                }
                wordsFound.push('BOOM!');
            }
        }
    }

    // Horizontal check
    for (let r = 0; r < GRID_ROWS; r++) {
        let currentSeq: Tile[] = [];
        for (let c = 0; c < GRID_COLS; c++) {
            const tile = grid[r][c];
            if (tile && tile.type === 'letter' && tile.status !== 'popped' && !toRemove.has(tile.id)) {
                currentSeq.push(tile);
            } else {
                processSequence(currentSeq, toRemove, wordsFound);
                currentSeq = [];
            }
        }
        processSequence(currentSeq, toRemove, wordsFound);
    }

    // Vertical check
    for (let c = 0; c < GRID_COLS; c++) {
        let currentSeq: Tile[] = [];
        for (let r = 0; r < GRID_ROWS; r++) {
            const tile = grid[r][c];
            if (tile && tile.type === 'letter' && tile.status !== 'popped' && !toRemove.has(tile.id)) {
                currentSeq.push(tile);
            } else {
                processSequence(currentSeq, toRemove, wordsFound);
                currentSeq = [];
            }
        }
        processSequence(currentSeq, toRemove, wordsFound);
    }

    if (toRemove.size === 0) {
        return { newState: state, clearedCount: 0 };
    }

    let points = 0;
    for (const word of wordsFound) {
        const len = word.length;
        points += len * 10 * (len - 2);
    }

    const newGrid = grid.map(row => row.map(tile =>
        tile && toRemove.has(tile.id) ? { ...tile, status: 'popped' as const } : tile
    ));

    const newScore = state.score + points;
    const newCombo = state.combo + 1;
    const message = wordsFound.length > 0 ? `${wordsFound.join(', ')}! +${points}` : null;

    return {
        newState: {
            ...state,
            grid: newGrid,
            score: newScore,
            combo: newCombo,
            message,
            lastWords: wordsFound
        },
        clearedCount: toRemove.size
    };
}

function processSequence(seq: Tile[], toRemove: Set<string>, wordsFound: string[]) {
    if (seq.length < 3) return;
    const str = seq.map(t => t.letter).join('');

    if (dictionary.isValid(str)) {
        seq.forEach(t => toRemove.add(t.id));
        wordsFound.push(str);
        return;
    }

    let i = 0;
    while (i <= seq.length - 3) {
        let longestMatchLen = -1;
        for (let len = seq.length - i; len >= 3; len--) {
            const sub = str.substring(i, i + len);
            if (dictionary.isValid(sub)) {
                longestMatchLen = len;
                wordsFound.push(sub);
                for (let k = 0; k < len; k++) toRemove.add(seq[i + k].id);
                break;
            }
        }
        if (longestMatchLen !== -1) {
            i += longestMatchLen;
        } else {
            i++;
        }
    }
}

export function applyGravity(state: GameState): GameState {
    const newGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

    for (let c = 0; c < GRID_COLS; c++) {
        let writeRow = GRID_ROWS - 1;
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
            const tile = state.grid[r][c];
            // Skip NULLs and POPPED tiles (they are removed)
            if (tile && tile.status !== 'popped') {
                newGrid[writeRow][c] = { ...tile, row: writeRow, col: c, status: 'stable' };
                writeRow--;
            }
        }
    }

    return {
        ...state,
        grid: newGrid
    };
}

export function checkGameOver(state: GameState): boolean {
    for (let c = 0; c < GRID_COLS; c++) {
        if (state.grid[0][c] === null) {
            return false; // Found an empty spot in top row
        }
    }
    return true; // All top row spots are filled
}
