import React, { useEffect, useState } from 'react';
import '../styles/FloatingWords.css';

interface FloatingWord {
    id: number;
    text: string;
    x: number;
    y: number;
}

interface Props {
    words: string[];
}

export const FloatingWords: React.FC<Props> = ({ words }) => {
    const [visibleWords, setVisibleWords] = useState<FloatingWord[]>([]);

    useEffect(() => {
        if (words.length > 0) {
            const newWords = words.map(word => ({
                id: Math.random(),
                text: word,
                x: 30 + Math.random() * 40, // Center-ish
                y: 40 + Math.random() * 20
            }));
            setVisibleWords(prev => [...prev, ...newWords]);
        }
    }, [words]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (visibleWords.length > 0) {
                // Cleanup old words? 
                // Using CSS animation for fading, but we should remove from state eventually
                // Actually, let's just use key so new ones re-render?
                // Better: simple timeout cleanup
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [visibleWords]);

    // Cleanup hook
    useEffect(() => {
        if (visibleWords.length > 0) {
            const timer = setTimeout(() => {
                setVisibleWords([]);
            }, 2000); // Clear after animation
            return () => clearTimeout(timer);
        }
    }, [visibleWords]);

    return (
        <div className="floating-words-container">
            {visibleWords.map(w => (
                <div
                    key={w.id}
                    className="floating-word"
                    style={{ left: `${w.x}%`, top: `${w.y}%` }}
                >
                    {w.text}
                </div>
            ))}
        </div>
    );
};
