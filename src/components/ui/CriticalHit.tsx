import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CriticalHitProps {
  active: boolean;
  amount?: number;
}

export default function CriticalHit({ active, amount = 0 }: CriticalHitProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <>
      {/* Flash overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 animate-flash bg-amber-400/20" />
      {/* Critical hit text */}
      <div className="fixed inset-x-0 top-1/3 flex flex-col items-center pointer-events-none z-50">
        <p className="text-4xl font-black text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-crit-text">
          {t('mining.critical_hit')}
        </p>
        {amount > 0 && (
          <p className="text-2xl font-bold text-amber-400 mt-2 animate-crit-text">
            +{amount} {t('mining.carbonance')}
          </p>
        )}
      </div>
    </>
  );
}
