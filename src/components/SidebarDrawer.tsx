import React from 'react';
import { Home, PlusCircle, Bell, User, X, Sparkles, TrendingDown, Store, ShieldCheck, Tag } from 'lucide-react';
import { TabType } from '../types';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  productCount: number;
  goalHitCount: number;
  unreadCount: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  productCount,
  goalHitCount,
  unreadCount,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          id="drawer-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        id="side-drawer"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0058be] text-white flex items-center justify-center font-bold text-lg font-syne">
              S
            </div>
            <div>
              <h2 className="font-syne text-lg font-bold text-[#0058be]">세일알림</h2>
              <p className="text-[11px] text-slate-500">스마트 가격 추적기</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick summary banner */}
        <div className="p-4 bg-blue-50/60 m-4 rounded-2xl border border-blue-100/80">
          <div className="text-[12px] font-semibold text-[#0058be] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> 나의 알림 현황
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">추적 중</span>
              <span className="font-syne text-base font-bold text-slate-900">{productCount}개</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-[11px] text-emerald-600 block">목표 달성</span>
              <span className="font-syne text-base font-bold text-emerald-600">{goalHitCount}개</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="px-3 py-2 flex-1 space-y-1">
          <button
            onClick={() => {
              onTabChange('home');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm transition-all ${
              currentTab === 'home'
                ? 'bg-[#2170e4] text-white font-semibold shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>홈</span>
          </button>

          <button
            onClick={() => {
              onTabChange('add');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm transition-all ${
              currentTab === 'add'
                ? 'bg-[#2170e4] text-white font-semibold shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>상품 추가</span>
          </button>

          <button
            onClick={() => {
              onTabChange('notifications');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left font-medium text-sm transition-all ${
              currentTab === 'notifications'
                ? 'bg-[#2170e4] text-white font-semibold shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span>알림</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onTabChange('mypage');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm transition-all ${
              currentTab === 'mypage'
                ? 'bg-[#2170e4] text-white font-semibold shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span>마이페이지</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100 px-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              지원 쇼핑몰
            </span>
            <div className="flex flex-wrap gap-1.5 text-[12px] text-slate-600">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">쿠팡</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">네이버</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">11번가</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">29CM</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg">무신사</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
          <span>세일알림 v1.0</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" /> 실시간 모니터링
          </span>
        </div>
      </div>
    </>
  );
};
