import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { haptic } from '../../hooks/useTelegramAuth';

interface DigButtonProps {
  onDig: () => void;
  disabled?: boolean;
  toolLevel: number;
}

const TOOL_ICONS = ['🪨', '⛏️', '🔨', '🔩'];

export default function DigButton({ onDig, disabled = false, toolLevel }: DigButtonProps) {
  const { t } = useTranslation();
  const [isSwinging, setIsSwinging] = useState(false);
  const icon = TOOL_ICONS[Math.min(toolLevel - 1, TOOL_ICONS.length - 1)];

  const handleClick = () => {
    if (disabled || isSwinging) return;
    haptic('impact', 'medium');
    setIsSwinging(true);
    setTimeout(() => setIsSwinging(false), 200);
    onDig();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`relative select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
    >
      <div
        className={`w-28 h-28 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border-4 border-amber-500/60 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all duration-150 ${
          isSwinging ? 'scale-90 shadow-[0_2px_8px_rgba(0,0,0,0.5)]' : 'hover:scale-105'
        }`}
      >
        <span
          className={`text-4xl transition-transform duration-150 ${
            isSwinging ? 'rotate-45 scale-110' : '-rotate-12'
          }`}
        >
          {icon}
        </span>
        <span className="text-white text-xs font-bold mt-1 tracking-wide uppercase">
          {t('mining.dig_button')}
        </span>
      </div>

      {/* Ripple on press */}
      {isSwinging && (
        <div className="absolute inset-0 rounded-full border-2 border-amber-400/60 animate-ping" />
      )}

      {/* Dust particles */}
      {isSwinging && (
        <>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-stone-400/70 animate-particle"
              style={{
                top: `${50 + (Math.random() - 0.5) * 80}%`,
                left: `${50 + (Math.random() - 0.5) * 80}%`,
                '--angle': `${i * 90 + Math.random() * 45}deg`,
              } as React.CSSProperties}
            />
          ))}
        </>
      )}
    </button>
  );
}
