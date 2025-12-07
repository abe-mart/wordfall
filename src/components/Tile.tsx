import React from 'react';
import { type Tile as TileType } from '../game/GameState';

interface Props {
    tile: TileType | null;
}

export const Tile: React.FC<Props> = ({ tile }) => {
    if (!tile) {
        return <div className="tile empty" />;
    }

    return (
        <div className={`tile ${tile.status} ${tile.type || 'letter'}`}>
            {tile.letter}
        </div>
    );
};
