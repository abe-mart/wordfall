import React from 'react';
import { useWordfallGame } from './game/useWordfallGame';
import { GameBoard } from './components/GameBoard';
import './styles/Game.css';
import { RotateCcw, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { HowToPlay } from './components/HowToPlay';
import { soundManager } from './game/SoundManager';
import { ParticleSystem } from './components/ParticleSystem';
import { FloatingWords } from './components/FloatingWords';




function App() {
  const { gameState, drop, reset, hold } = useWordfallGame();
  const [showHowToPlay, setShowHowToPlay] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Load sound preference
  React.useEffect(() => {
    const pref = localStorage.getItem('wordfall_sound');
    if (pref === 'false') {
      setSoundEnabled(false);
      soundManager.toggle(false);
    } else {
      // Default to true if no preference or 'true'
      setSoundEnabled(true);
      soundManager.toggle(true);
    }
  }, []);

  React.useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('wordfall_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowHowToPlay(true);
      localStorage.setItem('wordfall_tutorial_seen', 'true');
    }
    // The soundManager.toggle(true) from original tutorial useEffect is now handled by the new sound preference useEffect.
    // If we want to ensure sound is on by default if no preference is set, the new useEffect handles it.
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('wordfall_sound', String(newState));
    soundManager.toggle(newState);
  };

  const handleColumnClick = (col: number) => {
    if (showHowToPlay) return;
    drop(col);
  };


  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow HOLD even if status is idle? Yes.
      if ((gameState.status !== 'playing' && gameState.status !== 'idle') || showHowToPlay) return;

      if (e.key === 'Shift' || e.key === 'c' || e.key === 'C') {
        hold();
        return;
      }

      const key = parseInt(e.key);
      if (key >= 1 && key <= 5) {
        handleColumnClick(key - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, handleColumnClick, showHowToPlay]);


  return (
    <div className="game-container">
      <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <h1 className={`title ${gameState.status === 'clearing' ? 'shake' : ''}`}>WORDFALL</h1>
        <div className="controls">
          <button className="icon-btn" onClick={toggleSound}>
            {soundEnabled ? <Volume2 size={24} color="#fff" /> : <VolumeX size={24} color="#666" />}
          </button>
          <button className="icon-btn" onClick={() => setShowHowToPlay(true)}>
            <HelpCircle size={24} color="#fff" />
          </button>
        </div>
      </div>


      <div className="score-board">
        <span>Score: {gameState.score}</span>
        <span className="high-score">High: {gameState.highScore}</span>
      </div>

      <div className="status-message">
        {gameState.message && <span className="fade-in">{gameState.message}</span>}
        {gameState.combo > 1 && <span className="combo">Combo x{gameState.combo}</span>}
      </div>

      <div className="queue-container">
        <div className="queue-section hold">
          <span className="queue-label">HOLD</span>
          <div
            className={`tile queue-tile hold-tile ${!gameState.canHold ? 'disabled' : ''} ${gameState.holdItem === '💣' ? 'bomb' : ''}`}
            onClick={() => hold()}
            style={{ cursor: gameState.canHold ? 'pointer' : 'not-allowed', opacity: gameState.canHold ? 1 : 0.5 }}
          >
            {gameState.holdItem}
          </div>
          <span className="key-hint">SHIFT</span>
        </div>

        <div className="queue-section current">
          <span className="queue-label">CURRENT</span>
          {gameState.queue.length > 0 && (
            <div className={`tile queue-tile current-tile ${gameState.queue[0] === '💣' ? 'bomb' : ''}`}>
              {gameState.queue[0]}
            </div>
          )}
        </div>
        <div className="queue-section next">
          <span className="queue-label">NEXT</span>
          <div className="next-tiles">
            {gameState.queue.slice(1).map((letter, i) => (
              <div key={i} className={`tile queue-tile small ${letter === '💣' ? 'bomb' : ''}`}>{letter}</div>
            ))}
          </div>
        </div>
      </div>

      <GameBoard
        grid={gameState.grid}
        onColumnClick={handleColumnClick}
        disabled={gameState.status === 'gameover' || showHowToPlay}
      />


      {gameState.status === 'gameover' && (
        <div className="game-over-modal">
          <h2>Game Over</h2>
          <p className="final-score">Final Score: {gameState.score}</p>
          <button className="restart-btn" onClick={reset}>
            <RotateCcw size={24} /> Play Again
          </button>
        </div>
      )}

      {gameState.status === 'gameover' && (
        <div className="game-over-modal">
          <h2>Game Over</h2>
          <p className="final-score">Final Score: {gameState.score}</p>
          <button className="restart-btn" onClick={reset}>
            <RotateCcw size={24} /> Play Again
          </button>
        </div>
      )}

      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}

      <ParticleSystem active={gameState.status === 'clearing'} count={gameState.combo * 10 + 20} />
      <FloatingWords words={gameState.lastWords} />
    </div>




  );
}

export default App;
