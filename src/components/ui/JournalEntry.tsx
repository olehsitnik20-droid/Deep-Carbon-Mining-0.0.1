
import { useTranslation } from 'react-i18next';
import { Lock, BookOpen } from 'lucide-react';
import type { JournalPage } from '../../types';

interface JournalEntryProps {
  page: JournalPage;
  isUnlocked: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export default function JournalEntry({ page, isUnlocked, isNew, onClick }: JournalEntryProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const title = lang === 'en' ? page.titleEn : page.titleUk;
  const content = lang === 'en' ? page.contentEn : page.contentUk;

  if (!isUnlocked) {
    return (
      <div className="bg-stone-800/60 border border-stone-700/50 rounded-xl p-4 flex items-center gap-3 opacity-60">
        <Lock size={18} className="text-stone-500 flex-shrink-0" />
        <div>
          <p className="text-stone-500 text-sm font-medium">???</p>
          <p className="text-stone-600 text-xs mt-0.5">Layer {page.unlockLayer}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-stone-800 border rounded-xl p-4 transition-all ${
        isNew ? 'border-amber-500/60 shadow-[0_0_12px_rgba(251,191,36,0.15)]' : 'border-stone-700'
      } ${onClick ? 'cursor-pointer hover:border-stone-600 active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-900/40 border border-amber-700/30 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-stone-100 font-semibold text-sm">{title}</p>
            {isNew && (
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded px-1.5 py-0.5">
                NEW
              </span>
            )}
          </div>
          <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
