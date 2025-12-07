import React, { useReducer, useEffect, useCallback } from 'react';
import { type GameState, INITIAL_STATE } from './GameState';
import { initGame, dropTile, checkMatches, applyGravity, holdTile, checkGameOver } from './GameEngine';
import { dictionary } from './Dictionary';
import { soundManager } from './SoundManager';


type Action =
    | { type: 'INIT' }
    | { type: 'DROP', col: number }
    | { type: 'HOLD' }
    | { type: 'GRAVITY' }
    | { type: 'CHECK_MATCHES' }
    | { type: 'RESOLVE_MATCHES', newState: GameState }
    | { type: 'SET_PROCESSING', processing: boolean }
    ;

function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'INIT':
            return { ...initGame(), status: 'idle' }; // Ensure idle start
        case 'DROP':
            return dropTile(state, action.col); // Should return 'playing'
        case 'HOLD':
            return holdTile(state);
        case 'GRAVITY':
            // applyGravity should return state.
            // We force status to 'playing' to trigger next match check
            return { ...applyGravity(state), status: 'playing' };
        case 'RESOLVE_MATCHES':
            return action.newState; // Should have 'clearing' status
        case 'SET_PROCESSING':
            // If we are done processing, go to idle (unless gameover)
            if (state.status === 'gameover') return state;
            return { ...state, status: 'idle' };
        default:
            return state;
    }
}

export function useWordfallGame() {
    const [gameState, dispatch] = useReducer(gameReducer, INITIAL_STATE);
    const [isProcessing, setIsProcessing] = React.useState(false);

    useEffect(() => {
        dictionary.load().then(() => {
            dispatch({ type: 'INIT' });
        });
    }, []);

    const drop = useCallback((col: number) => {
        if (isProcessing || gameState.status !== 'idle') return;

        setIsProcessing(true);
        dispatch({ type: 'DROP', col });
        soundManager.playDrop();
    }, [gameState.status, isProcessing]);

    // Game Loop State Machine
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const processState = () => {
            if (gameState.status === 'playing') {
                // Check matches
                const { newState, clearedCount } = checkMatches(gameState);

                if (clearedCount > 0) {
                    // Transition to CLEARING (popped state)
                    dispatch({ type: 'RESOLVE_MATCHES', newState: { ...newState, status: 'clearing' } });
                    soundManager.playMatch(clearedCount);
                } else {
                    // No matches, back to idle
                    // But first check if we are gameover?
                    // checkMatches doesn't check gameover. dropTile does.
                    // If we are here, we are stable.
                    setIsProcessing(false);
                    // Check if grid is full (Lockout)
                    if (checkGameOver(gameState)) {
                        dispatch({ type: 'RESOLVE_MATCHES', newState: { ...gameState, status: 'gameover', message: 'Game Over!' } });
                        soundManager.playGameOver();
                        setIsProcessing(false);
                    } else {
                        dispatch({ type: 'SET_PROCESSING', processing: false }); // Logic to set idle
                    }
                }
            } else if (gameState.status === 'clearing') {
                // Wait for animation then Apply Gravity
                timeoutId = setTimeout(() => {
                    dispatch({ type: 'GRAVITY' }); // GRAVITY returns status 'playing' to check again
                }, 500);
            }
        };

        // Small delay for playing state to let render catch up? 
        // Actually, if we just transitioned to 'playing' from Drop or Gravity, check immediately (async).
        if (gameState.status === 'playing' || gameState.status === 'clearing') {
            timeoutId = setTimeout(processState, gameState.status === 'playing' ? 300 : 0);
            // 300ms delay on 'playing' gives a "think" time or visual pause after drop/gravity
            // 'clearing' has its own delay inside.
        }

        return () => clearTimeout(timeoutId);
    }, [gameState.status, gameState.grid, gameState.queue]); // Depend on status primarily

    const reset = () => {
        setIsProcessing(false);
        dispatch({ type: 'INIT' });
    };

    const hold = () => {
        if (isProcessing || gameState.status !== 'idle') return;
        dispatch({ type: 'HOLD' });
        soundManager.playDrop(); // Or a different "swap" sound? reusing drop for feedback
    };

    return { gameState, drop, reset, isProcessing, hold };
}

