import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react'
import { notificationService } from '../../services/notificationService'

// Interface pour les notifications
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: string;
  link?: string;
}

interface NotificationSystemProps {
  onNavigate?: (page: string) => void;
  className?: string;
}

export default function NotificationSystem({ onNavigate, className = '' }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Charger les notifications réelles
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const realNotifications = await notificationService.getCurrentNotifications();
        setNotifications(realNotifications);
        setUnreadCount(realNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        // Fallback vers des notifications par défaut en cas d'erreur
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    loadNotifications();

    // S'abonner aux mises à jour en temps réel
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    // Démarrer le polling des notifications
    notificationService.startPolling(30000); // Vérifier toutes les 30 secondes

    return () => {
      unsubscribe();
      notificationService.stopPolling();
    };
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-700/20'
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  }

  const markAllAsRead = async () => {
    try {
      // Marquer toutes les notifications non lues comme lues
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.id)));
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays}j`
  }

  const handleNotificationAction = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.link && onNavigate) {
      onNavigate(notification.link)
    }
    setShowNotifications(false)
  }

  // Fermer les notifications si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showNotifications && !target.closest('.notification-system')) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  return (
    <div className={`relative notification-system ${className}`}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menu des notifications */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg mb-2 border-l-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      getNotificationColor(notification.type)
                    } ${notification.read ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          {notification.action && (
                            <button
                              onClick={() => handleNotificationAction(notification)}
                              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              {notification.action} →
                            </button>
                          )}
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                                title="Marquer comme lu"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                              title="Supprimer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
