import React, { useState } from 'react';
import { User, Bell, Shield, Smartphone, Mail, MessageSquare, RotateCcw, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface MyPageScreenProps {
  products: Product[];
  onResetData: () => void;
}

export const MyPageScreen: React.FC<MyPageScreenProps> = ({
  products,
  onResetData,
}) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [kakaoEnabled, setKakaoEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const goalReachedCount = products.filter((p) => p.currentPrice <= p.targetPrice).length;

  const totalSaved = products.reduce((acc, curr) => {
    if (curr.originalPrice > curr.currentPrice) {
      return acc + (curr.originalPrice - curr.currentPrice);
    }
    return acc;
  }, 0);

  return (
    <div id="mypage-screen" className="flex flex-col gap-5 pb-28 max-w-md mx-auto">
      {/* Title */}
      <section className="pt-2">
        <h2 className="font-syne text-[26px] font-bold text-[#0b1c30] tracking-tight">
          마이페이지
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          세일알림 계정 및 알림 환경설정
        </p>
      </section>

      {/* Profile Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4.5 flex items-center gap-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0058be] to-blue-400 text-white flex items-center justify-center font-syne font-bold text-xl shadow-md shadow-blue-500/20">
          S
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-base text-[#0b1c30]">스마트 쇼퍼 님</h3>
            <span className="bg-blue-100 text-[#0058be] text-[10px] font-bold px-2 py-0.5 rounded-full">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">sale.hunter@example.com</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">추적 중</span>
          <span className="font-syne text-lg font-extrabold text-[#0058be] block mt-0.5">
            {products.length}개
          </span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] text-emerald-600 font-medium block">목표 달성</span>
          <span className="font-syne text-lg font-extrabold text-emerald-600 block mt-0.5">
            {goalReachedCount}개
          </span>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3.5 text-center shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium block">누적 절약</span>
          <span className="font-syne text-[14px] font-extrabold text-[#0b1c30] block mt-1 truncate">
            ₩{(totalSaved / 10000).toFixed(0)}만원
          </span>
        </div>
      </div>

      {/* Notification Channel Preferences */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4.5 flex flex-col gap-3.5 shadow-xs">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          알림 수신 채널 설정
        </h4>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0058be] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800 block">앱 푸시 알림</span>
              <span className="text-[11px] text-slate-400">목표가 도달 시 즉시 알림</span>
            </div>
          </div>
          <button
            onClick={() => setPushEnabled(!pushEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              pushEnabled ? 'bg-[#0058be]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                pushEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800 block">카카오톡 알림톡</span>
              <span className="text-[11px] text-slate-400">카카오톡 메시지로 최저가 수신</span>
            </div>
          </div>
          <button
            onClick={() => setKakaoEnabled(!kakaoEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              kakaoEnabled ? 'bg-[#0058be]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                kakaoEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800 block">이메일 알림</span>
              <span className="text-[11px] text-slate-400">주간 가격 리포트 요약</span>
            </div>
          </div>
          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              emailEnabled ? 'bg-[#0058be]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                emailEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* App Data Settings */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col gap-2 shadow-xs">
        <button
          onClick={() => {
            if (confirm('예시 데이터를 초기 상태로 복원하시겠습니까?')) {
              onResetData();
              alert('데이터가 초기화되었습니다.');
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>기본 예시 데이터 다시 불러오기</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
