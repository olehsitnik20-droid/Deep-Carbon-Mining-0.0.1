import { useState } from 'react';
import BottomNav from '../ui/BottomNav';
import TopBar from '../ui/TopBar';
import MiningView from './MiningView';
import ShopView from './ShopView';
import StoryView from './StoryView';
import DailyRewardView from './DailyRewardView';
import ProfileView from './ProfileView';
import { usePlayTime } from '../../hooks/usePlayTime';

type Tab = 'mine' | 'shop' | 'story' | 'daily' | 'profile';

export default function GameScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('mine');
  usePlayTime();

  const renderView = () => {
    switch (activeTab) {
      case 'mine': return <MiningView />;
      case 'shop': return <ShopView />;
      case 'story': return <StoryView />;
      case 'daily': return <DailyRewardView />;
      case 'profile': return <ProfileView />;
      default: return <MiningView />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <TopBar />
      <main className="flex-1 pt-16 pb-20 overflow-y-auto overflow-x-hidden">
        {renderView()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
