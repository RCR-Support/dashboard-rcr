'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent, Button, ScrollShadow } from '@heroui/react';
import { FaBell } from 'react-icons/fa';
import { getUserNotifications } from '@/actions/notifications/get-user-notifications';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/actions/notifications/mark-notification-read';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, XCircle, FileText, AlertCircle, User, FileCheck, Clock, Link2, Trash2 } from 'lucide-react';

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
  SUBCONTRACT_REQUEST: <Link2 className="h-4 w-4 text-teal-500" />,
};

type TabFilter = 'all' | 'unread';

export default function NotificationsPanel() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getUserNotifications();
    if (result.ok && result.notifications) {
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount || 0);
    }
    setLoading(false);
  };

  // Carga inicial + polling cada 60 segundos
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar al abrir el panel
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) loadNotifications();
  };

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

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    setDeletingId(notificationId);
    await deleteNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => {
      const deleted = notifications.find((n) => n.id === notificationId);
      return deleted && !deleted.read ? Math.max(0, prev - 1) : prev;
    });
    setDeletingId(null);
  };

  const visibleNotifications = useMemo(
    () => tab === 'unread' ? notifications.filter((n) => !n.read) : notifications,
    [notifications, tab]
  );

  return (
    <Popover isOpen={isOpen} onOpenChange={handleOpenChange} placement="bottom-end">
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
            <h3 className="text-lg font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button size="sm" variant="flat" onPress={handleMarkAllAsRead}>
                Marcar todas como leídas
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-default-200 dark:border-default-700">
            <button
              onClick={() => setTab('all')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'all'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-default-500 hover:text-default-700'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setTab('unread')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'unread'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-default-500 hover:text-default-700'
              }`}
            >
              No leídas {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          </div>

          {/* Notifications List */}
          <ScrollShadow className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-default-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Cargando...</p>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="p-8 text-center text-default-500">
                <FaBell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{tab === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}</p>
              </div>
            ) : (
              <div className="divide-y divide-default-200 dark:divide-default-700">
                {visibleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-default-100 dark:hover:bg-default-800 dark:hover:text-gray-800 transition-colors cursor-pointer group ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {notificationIcons[notification.type] || <FaBell className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification.id)}
                              disabled={deletingId === notification.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-default-400 hover:text-red-500"
                              title="Eliminar notificación"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-default-200 dark:border-default-700 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/applications');
                }}
                className="text-xs text-primary hover:underline"
              >
                Ver mis solicitudes
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

