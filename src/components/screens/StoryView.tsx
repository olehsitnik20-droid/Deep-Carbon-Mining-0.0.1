
import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/GameContext';
import JournalEntry from '../ui/JournalEntry';
import { JOURNAL_PAGES, getActForDepth } from '../../utils/gameLogic';

export default function StoryView() {
  const { t } = useTranslation();
  const { gameProgress, storyProgress } = useGame();
  const currentLayer = gameProgress?.current_layer ?? 1;
  const pagesFound = storyProgress?.journal_pages_found ?? [];
  const currentAct = getActForDepth(currentLayer);

  return (
    <div className="px-4 py-4">
      {/* Intro card */}
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📖</span>
          <p className="text-amber-300 font-bold text-base">{t('story.journal')}</p>
        </div>
        <p className="text-stone-400 text-sm leading-relaxed">{t('story.intro')}</p>
      </div>

      {/* Acts breakdown */}
      {([1, 2, 3, 4, 5] as const).map((act) => {
        const isActUnlocked = currentAct >= act;
        const actPages = JOURNAL_PAGES.filter((p) => p.act === act);
        const actTitleKey = `story.act_titles.${act}`;

        return (
          <div key={act} className="mb-5">
            <div className={`flex items-center gap-2 mb-3 ${!isActUnlocked ? 'opacity-40' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isActUnlocked ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-500'
              }`}>
                {act}
              </div>
              <div>
                <p className={`text-sm font-bold ${isActUnlocked ? 'text-stone-100' : 'text-stone-600'}`}>
                  {t('story.act')} {act}: {t(actTitleKey)}
                </p>
                {!isActUnlocked && (
                  <p className="text-stone-600 text-xs">
                    {t('story.unlock_at')} {[1, 11, 26, 51, 71][act - 1]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-stone-800">
              {actPages.map((page) => {
                const isUnlocked = page.unlockLayer <= currentLayer;
                const isNew = isUnlocked && !pagesFound.includes(page.id);
                return (
                  <JournalEntry
                    key={page.id}
                    page={page}
                    isUnlocked={isUnlocked}
                    isNew={isNew}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
