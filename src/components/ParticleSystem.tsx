import React, { useEffect, useState } from 'react';
import '../styles/Particles.css';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    angle: number;
    speed: number;
    life: number;
}

interface Props {
    active: boolean;
    count?: number;
}

export const ParticleSystem: React.FC<Props> = ({ active, count = 20 }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (active) {
            // Spawn particles
            const newParticles: Particle[] = [];
            const colors = ['#00bcd4', '#ff4081', '#7c4dff', '#ffffff'];

            // Center of screen/grid mostly (simplification)
            // Ideally we'd pass in coordinates of the match, but for now global confetti is nice for any score
            for (let i = 0; i < count; i++) {
                newParticles.push({
                    id: Math.random(),
                    x: 50, // percent
                    y: 50, // percent
                    color: colors[Math.floor(Math.random() * colors.length)],
                    angle: Math.random() * 360,
                    speed: 2 + Math.random() * 5,
                    life: 1.0
                });
            }
            setParticles(prev => [...prev, ...newParticles]);
        }
    }, [active, count]);

    useEffect(() => {
        if (particles.length === 0) return;

        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + Math.cos(p.angle * Math.PI / 180) * p.speed * 0.1,
                y: p.y + Math.sin(p.angle * Math.PI / 180) * p.speed * 0.1,
                life: p.life - 0.05
            })).filter(p => p.life > 0));
        }, 16);

        return () => clearInterval(interval);
    }, [particles.length]);

    if (particles.length === 0) return null;

    return (
        <div className="particle-container">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        backgroundColor: p.color,
                        opacity: p.life,
                        transform: `scale(${p.life})`
                    }}
                />
            ))}
        </div>
    );
};
