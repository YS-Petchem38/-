import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  unreadCount: number;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenProfile,
  unreadCount,
  currentTab,
  onTabChange,
}) => {
  return (
    <header
      id="top-app-bar"
      className="sticky top-0 z-40 w-full h-14 bg-[#f8f9ff]/90 backdrop-blur-md px-5 flex items-center justify-between border-b border-[#e2e8f0]/40 transition-shadow"
    >
      <button
        id="btn-open-menu"
        onClick={onOpenMenu}
        aria-label="메뉴 열기"
        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#0058be] hover:bg-blue-50 active:scale-95 transition-all"
      >
        <Menu className="w-6 h-6 stroke-[2.2]" />
      </button>

      <button
        id="btn-brand-title"
        onClick={() => onTabChange('home')}
        className="flex items-center gap-1.5 focus:outline-none"
      >
        <h1 className="font-syne text-[22px] font-extrabold tracking-tight text-[#0058be]">
          세일알림
        </h1>
      </button>

      <div className="flex items-center gap-1">
        <button
          id="btn-quick-notif"
          onClick={() => onTabChange('notifications')}
          aria-label="알림함"
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#424754] hover:bg-slate-100 active:scale-95 transition-all md:hidden"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>
        <button
          id="btn-open-profile"
          onClick={onOpenProfile}
          aria-label="마이페이지 열기"
          className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-[#424754] hover:bg-slate-100 active:scale-95 transition-all"
        >
          <User className="w-6 h-6 stroke-[1.8]" />
        </button>
      </div>
    </header>
  );
};
