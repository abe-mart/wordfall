import React from 'react';
import { type Grid } from '../game/GameState';
import { Tile } from './Tile';

interface Props {
    grid: Grid;
    onColumnClick: (col: number) => void;
    disabled?: boolean;
}

export const GameBoard: React.FC<Props> = ({ grid, onColumnClick, disabled }) => {
    const cols = grid[0].length;


    // We need to render by column for easier click handling? 
    // Visual grid is usually Row based in CSS grid, but our interaction is Column based.
    // Let's stick to standard grid and overlay click handlers or make columns container?
    // CSS Grid `grid-template-columns: repeat(5, 1fr)` matches our state `grid[row][col]`.
    // To detect column click easily, let's wrap columns.

    // Transpose for rendering columns?
    const columns: any[][] = Array(cols).fill(null).map(() => []);
    grid.forEach(row => {
        row.forEach((tile, c) => {
            columns[c].push(tile);
        });
    });

    return (
        <div className="grid">
            {columns.map((colTiles, cIndex) => (
                <div
                    key={cIndex}
                    className="column"
                    onClick={() => !disabled && onColumnClick(cIndex)}
                >
                    {colTiles.map((tile, rIndex) => (
                        <Tile key={tile ? tile.id : `empty-${cIndex}-${rIndex}`} tile={tile} />
                    ))}
                </div>
            ))}
        </div>
    );
};
