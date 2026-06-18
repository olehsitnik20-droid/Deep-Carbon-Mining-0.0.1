import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pickaxe, ShoppingBag, BookOpen, Gift, User } from 'lucide-react';

type Tab = 'mine' | 'shop' | 'story' | 'daily' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; icon: React.ElementType; key: string }[] = [
  { id: 'mine', icon: Pickaxe, key: 'nav.mine' },
  { id: 'shop', icon: ShoppingBag, key: 'nav.shop' },
  { id: 'story', icon: BookOpen, key: 'nav.story' },
  { id: 'daily', icon: Gift, key: 'nav.daily' },
  { id: 'profile', icon: User, key: 'nav.profile' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-700 z-50 safe-area-bottom">
      <div className="flex">
        {TABS.map(({ id, icon: Icon, key }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all active:scale-95 ${
                active
                  ? 'text-amber-400'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <Icon
                size={22}
                className={`transition-transform ${active ? 'scale-110' : ''}`}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span className={`text-xs font-medium ${active ? 'text-amber-400' : 'text-stone-500'}`}>
                {t(key)}
              </span>
              {active && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
