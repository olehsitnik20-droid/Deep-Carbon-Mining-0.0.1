import React from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  char: string;
  color: string;
}

interface CoinAnimationProps {
  active: boolean;
  amount?: number;
  isCritical?: boolean;
  originX?: number;
  originY?: number;
}

export default function CoinAnimation({
  active,
  amount = 0,
  isCritical = false,
  originX = 50,
  originY = 50,
}: CoinAnimationProps) {
  if (!active) return null;

  const count = isCritical ? 18 : 8;
  const chars = isCritical
    ? ['💎', '+', '✦', '★', '◆']
    : ['•', '+', '◆', '✦'];

  const particles: Particle[] = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const speed = isCritical ? 2.5 + Math.random() * 2.5 : 1.5 + Math.random() * 1.5;
    return {
      id: i,
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      opacity: 1,
      size: isCritical ? 12 + Math.random() * 8 : 10 + Math.random() * 6,
      char: chars[Math.floor(Math.random() * chars.length)],
      color: isCritical
        ? ['#fbbf24', '#f59e0b', '#34d399', '#60a5fa'][Math.floor(Math.random() * 4)]
        : '#fbbf24',
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute font-bold animate-coin-burst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: p.color,
            '--vx': `${p.vx * 60}px`,
            '--vy': `${p.vy * 60}px`,
            animationDelay: `${Math.random() * 100}ms`,
          } as React.CSSProperties}
        >
          {p.char}
        </span>
      ))}
      {amount > 0 && (
        <div
          className="absolute font-black text-amber-300 text-2xl animate-float-up"
          style={{ left: `${originX}%`, top: `${originY - 10}%`, transform: 'translateX(-50%)' }}
        >
          +{amount}
        </div>
      )}
    </div>
  );
}
