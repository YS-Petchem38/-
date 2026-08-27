import React from 'react';
import { Bell, CheckCheck, Trash2, ChevronRight, Sparkles, TrendingDown } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsScreenProps {
  notifications: AppNotification[];
  onSelectNotification: (notification: AppNotification) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div id="notifications-screen" className="flex flex-col gap-5 pb-28 max-w-md mx-auto">
      {/* Title Bar */}
      <section className="pt-2 flex items-center justify-between">
        <div>
          <h2 className="font-syne text-[26px] font-bold text-[#0b1c30] tracking-tight">
            알림
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {unreadCount > 0
              ? `읽지 않은 알림 ${unreadCount}건이 있습니다.`
              : '모든 알림을 확인했습니다.'}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-[#0058be] font-semibold hover:bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> 모두 읽음
              </button>
            )}
            <button
              onClick={onClearNotifications}
              className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
              title="알림 전체 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0058be] flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">새로운 알림이 없습니다</h3>
            <p className="text-xs text-slate-400 mt-1">
              관심 상품의 가격이 내려가면 즉시 알려드릴게요.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <article
              key={notif.id}
              id={`notification-card-${notif.id}`}
              onClick={() => onSelectNotification(notif)}
              className={`border rounded-xl p-3.5 flex gap-3.5 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                notif.isRead
                  ? 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  : 'bg-[#F8FAFC] border-blue-200/80 shadow-2xs hover:border-[#0058be]'
              }`}
            >
              {/* Product Thumbnail */}
              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-100 relative">
                <img
                  src={notif.imageUrl}
                  alt={notif.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                  }}
                />
                {!notif.isRead && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </div>

              {/* Notification Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[12px] font-bold text-[#0058be] flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 fill-[#0058be]" />
                      <span>{notif.title}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {notif.timeAgo}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs text-[#0b1c30] line-clamp-1 leading-snug">
                    {notif.productName}
                  </h3>
                </div>

                <div className="flex items-end justify-between mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-syne font-extrabold text-[16px] text-[#0058be]">
                      ₩{notif.currentPrice.toLocaleString()}
                    </span>
                    {notif.originalPrice > notif.currentPrice && (
                      <span className="text-[11px] text-slate-400 line-through">
                        ₩{notif.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {notif.type === 'target_hit' ? (
                    <div className="bg-[#0058be] rounded-full px-2.5 py-0.5 shadow-2xs">
                      <span className="font-syne text-[10px] font-extrabold text-white tracking-wider">
                        TARGET HIT
                      </span>
                    </div>
                  ) : (
                    <div className="bg-[#4edea3] rounded-full px-2.5 py-0.5 shadow-2xs">
                      <span className="font-syne text-[10px] font-extrabold text-white tracking-wider">
                        {notif.dropPercentage}% DOWN
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
