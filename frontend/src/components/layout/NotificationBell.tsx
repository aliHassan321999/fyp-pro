import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../../features/notification/notification.api';
import { useAuth } from '../../hooks/useAuth';

const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: response, isLoading } = useGetNotificationsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000, // Poll every minute to simulate real-time updates without WebSockets
  });
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = response?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm font-medium text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Bell className="w-10 h-10 mb-3 opacity-20 text-gray-400" />
                <p className="text-sm font-medium">You're all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((notif: any) => (
                  <li 
                    key={notif._id} 
                    className={`p-4 transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-indigo-50/30' : 'opacity-70'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            notif.type === 'sla_breach' ? 'bg-red-500' :
                            notif.type === 'assignment' ? 'bg-indigo-500' : 'bg-emerald-500'
                          }`}></span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {notif.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${!notif.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">{formatTime(notif.createdAt)}</p>
                      </div>
                      {!notif.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(notif._id);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 rounded-full transition-colors shrink-0 mt-4"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
