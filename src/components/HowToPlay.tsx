import React from 'react';
import { X } from 'lucide-react';
import '../styles/Game.css';

interface HowToPlayProps {
    onClose: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>How to Play</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="instructions">
                    <p><strong>WORDFALL</strong> is a word puzzle game where gravity is your friend (and enemy).</p>
                    <ul>
                        <li><strong>Drop Tiles:</strong> Click a column (or use 1-5 keys) to drop the next letter.</li>
                        <li><strong>Make Words:</strong> Connect 3 or more letters horizontally or vertically to clear them.</li>
                        <li><strong>Combos:</strong> Cleared tiles cause letters above to fall. Create chain reactions for massive points!</li>
                        <li><strong>Game Over:</strong> If a column fills up to the top, the game is over.</li>
                    </ul>
                    <div className="tip">
                        💡 Tip: Look for chain reactions to boost your multiplier!
                    </div>
                    <button className="play-btn-large" onClick={onClose}>
                        Start Playing
                    </button>
                </div>
            </div>
        </div>
    );
};
