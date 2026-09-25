import React from 'react';
import { NotificationItem, ViewTab } from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  Bell, 
  X, 
  ShoppingBag, 
  TrendingUp, 
  Sparkles, 
  Check, 
  ChevronRight,
  Clock
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNavigateTab: (tab: ViewTab) => void;
  currentLang: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNavigateTab,
  currentLang,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="notifications-drawer-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div
        id="notifications-drawer-content"
        className="w-full max-w-md bg-ivory border-l border-[#E8DFC8] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFC8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E07A5F]/15 text-[#E07A5F]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2C241E]">
                {getTranslation(currentLang, 'notifications')}
              </h3>
              <p className="text-xs text-[#7A6E65]">
                {notifications.filter((n) => !n.read).length} new updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-semibold text-[#E07A5F] hover:underline cursor-pointer"
            >
              {getTranslation(currentLang, 'markAllRead')}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F4EFEA] text-[#7A6E65] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#7A6E65]">
              <Bell className="w-10 h-10 mx-auto text-[#D9C3B0] mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No new notifications</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const getIcon = () => {
                switch (notif.type) {
                  case 'enquiry':
                  case 'order':
                    return <ShoppingBag className="w-4 h-4 text-[#E07A5F]" />;
                  case 'listing':
                    return <TrendingUp className="w-4 h-4 text-[#81B29A]" />;
                  case 'pricing':
                    return <Sparkles className="w-4 h-4 text-[#F4A261]" />;
                  default:
                    return <Bell className="w-4 h-4 text-[#3D405B]" />;
                }
              };

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.actionUrl) {
                      onNavigateTab(notif.actionUrl as ViewTab);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    !notif.read
                      ? 'bg-white border-[#E07A5F]/40 shadow-xs ring-1 ring-[#E07A5F]/15'
                      : 'bg-ivory hover:bg-white border-[#E8DFC8]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-ivory border border-[#E8DFC8]">
                      {getIcon()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#2C241E]">
                          {currentLang === 'hi' && notif.hindiTitle
                            ? notif.hindiTitle
                            : notif.title}
                        </h4>
                        <span className="text-[10px] text-[#9C8E84] flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {notif.time}
                        </span>
                      </div>

                      <p className="text-xs text-brown mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.actionUrl && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#E07A5F]">
                          <span>Take action</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
