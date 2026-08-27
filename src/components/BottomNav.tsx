import React from 'react';
import { Home, PlusCircle, Bell, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  unreadCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'add', label: '상품 추가', icon: PlusCircle },
    { id: 'notifications', label: '알림', icon: Bell },
    { id: 'mypage', label: '마이페이지', icon: User },
  ];

  return (
    <nav
      id="bottom-nav-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#e2e8f0]/80 px-3 pt-2 pb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:hidden rounded-t-[24px] max-w-lg mx-auto"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 relative ${
                isActive
                  ? 'bg-[#2170e4] text-white rounded-[22px] scale-95 shadow-md shadow-blue-500/20'
                  : 'text-[#424754] hover:text-[#0058be] active:scale-90'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.id === 'notifications' && unreadCount > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </div>
              <span className={`text-[11px] font-semibold mt-1 tracking-tight ${isActive ? 'text-white' : 'text-[#424754]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
