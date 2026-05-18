'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent, Button, ScrollShadow } from '@heroui/react';
import { FaBell } from 'react-icons/fa';
import { getUserNotifications } from '@/actions/notifications/get-user-notifications';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/actions/notifications/mark-notification-read';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, XCircle, FileText, AlertCircle, User, FileCheck, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: Date;
}

const notificationIcons: Record<string, React.ReactNode> = {
  REQUEST_APPROVED: <CheckCircle className="h-4 w-4 text-green-500" />,
  REQUEST_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
  NEW_APPLICATION: <FileText className="h-4 w-4 text-blue-500" />,
  PENDING_DOCUMENTS: <Clock className="h-4 w-4 text-orange-500" />,
  CONTRACT_EXPIRING: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  CREDENTIAL_READY: <FileCheck className="h-4 w-4 text-purple-500" />,
  NEW_USER: <User className="h-4 w-4 text-cyan-500" />,
  REASSIGNMENT: <FileText className="h-4 w-4 text-indigo-500" />,
  INACTIVE_REQUEST: <AlertCircle className="h-4 w-4 text-gray-500" />,
};

export default function NotificationsPanel() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getUserNotifications();
    if (result.ok && result.notifications) {
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount || 0);
    }
    setLoading(false);
  };

  // Carga inicial + polling cada 15 segundos
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      router.refresh();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end">
      <PopoverTrigger>
        <div className="relative cursor-pointer">
          <div className="rounded-full p-4 hover:bg-default-100 transition-colors">
            <FaBell className="h-5 w-5" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 dark:bg-[#282c34] p-0">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-default-200 dark:border-default-700">
            <h3 className="text-lg font-semibold">Notificaciones </h3>
            {unreadCount > 0 && (
              <Button size="sm" variant="flat" onPress={handleMarkAllAsRead}>
                Marcar todas como leídas
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <ScrollShadow className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-default-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-default-500">
                <FaBell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-default-200 dark:divide-default-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-default-100 dark:hover:bg-default-800 dark:hover:text-gray-800 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3 cursor-pointer">
                      <div className="flex-shrink-0 mt-1">
                        {notificationIcons[notification.type] || <FaBell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-default-500 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-default-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollShadow>

          {/* Footer - placeholder for future notifications page */}
        </div>
      </PopoverContent>
    </Popover>
  );
}
