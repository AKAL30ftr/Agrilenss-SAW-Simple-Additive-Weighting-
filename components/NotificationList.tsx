'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface NotificationListProps {
  isPopup?: boolean;
  onClose?: () => void;
}

// Generate dates outside the component so they don't violate purity rules
const initialLoadTime = new Date().getTime();
const initialNotifications = [
  {
    id: 1,
    title: 'SAW Analysis Complete',
    timestamp: new Date(initialLoadTime - 10 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: 2,
    title: 'Market Data Updated',
    timestamp: new Date(initialLoadTime - 2 * 60 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: 3,
    title: 'System Maintenance',
    timestamp: new Date(initialLoadTime - 25 * 60 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: 4,
    title: 'Voice Advisory Feedback Received',
    timestamp: new Date(initialLoadTime - 48 * 60 * 60 * 1000).toISOString(),
    unread: false,
  }
];

export default function NotificationList({ isPopup = false, onClose }: NotificationListProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Delay initial state setting slightly to satisfy new React hook purity rules
    const initTimer = setTimeout(() => {
      setNow(new Date());
    }, 0);
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, []);

  function formatNotificationDate(dateString: string) {
    if (!now) return '';
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24 && diffHours >= 1) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffHours < 1 && diffMins > 0) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffMins <= 0 && diffHours <= 0) {
      return 'Just now';
    } else {
      return date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
  }

  return (
    <div className={isPopup ? "flex flex-col w-full max-h-[80vh] overflow-y-auto" : "glass-plate rounded-xl overflow-hidden flex flex-col w-full max-w-2xl mx-auto mt-8"}>
      <div className={`border-b border-white/10 ${isPopup ? 'px-5 py-4' : 'px-6 py-5'}`}>
        <h2 className="text-xl font-bold text-white font-heading tracking-wide">Notification</h2>
      </div>

      <div className="flex flex-col">
        {initialNotifications.map((notif, index) => (
          <div key={notif.id} className={`group flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer ${index !== initialNotifications.length - 1 ? 'border-b border-white/10' : ''} ${isPopup ? 'px-5 py-4' : 'px-6 py-5 gap-4'}`}>
            <div className="pt-[6px] shrink-0 w-2 flex justify-center">
              {notif.unread && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-[#aeb5c1] font-medium leading-tight group-hover:text-emerald-400 transition-colors truncate ${isPopup ? 'text-base' : 'text-lg'}`}>{notif.title}</h3>
              <p className="text-[#64748b] text-sm mt-1">{formatNotificationDate(notif.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`border-t border-white/10 flex justify-end bg-white/[0.02] ${isPopup ? 'px-5 py-3' : 'px-6 py-4'}`}>
        {isPopup ? (
          <Link href="/notifications" onClick={onClose} className="flex items-center gap-1 text-[#64748b] hover:text-white transition-colors font-medium text-sm">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button className="flex items-center gap-1 text-[#64748b] hover:text-white transition-colors font-medium text-sm">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
