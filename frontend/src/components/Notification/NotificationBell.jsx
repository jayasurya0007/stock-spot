import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, checkNotificationTime } from '../../services/notifications';
import { LoadingSpinner, SkeletonLoader } from '../Loading';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const dropdownRef = useRef(null);

  // Fetch unread count on component mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling for real-time updates and notification time checking
    const interval = setInterval(() => {
      fetchUnreadCount();
      checkForNotificationTime(); // Check if it's notification time
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const checkForNotificationTime = async () => {
    try {
      const response = await checkNotificationTime();
      
      if (response.success && response.data.isNotificationTime && response.data.notificationsCreated > 0) {
        console.log(`🔔 Notification time! Created ${response.data.notificationsCreated} notifications`);
        
        // Refresh unread count to show new notifications
        await fetchUnreadCount();
        
        // Show a subtle notification (optional - you can remove this if you don't want alerts)
        // alert(`New notifications created: ${response.data.notificationsCreated} low stock alerts`);
      }
    } catch (error) {
      // Silently handle errors to avoid spamming console
      // console.error('Error checking notification time:', error);
    }
  };

  const fetchNotifications = async (pageNum = 1, append = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await getNotifications({ page: pageNum, limit: 10 });
      const newNotifications = response.data.notifications;
      
      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      
      setHasMore(response.data.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      fetchNotifications(1);
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const loadMoreNotifications = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === 'low_stock') {
      if (notification.metadata?.is_critical) {
        return '🚨';
      }
      return '⚠️';
    }
    return '📢';
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className="notification-bell-button"
        onClick={handleBellClick}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '1rem' }}>
                <SkeletonLoader type="list" lines={3} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notifications-icon">📭</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-content">
                      <div className="notification-icon">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="notification-body">
                        <div className="notification-title">
                          {notification.title}
                        </div>
                        <div className="notification-message">
                          {notification.message}
                        </div>
                        <div className="notification-meta">
                          <span className="notification-time">
                            {formatNotificationTime(notification.created_at)}
                          </span>
                          {notification.is_ai_enhanced && (
                            <span className="ai-badge">✨ AI Enhanced</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
                
                {hasMore && (
                  <button 
                    className="load-more-btn"
                    onClick={loadMoreNotifications}
                    disabled={loading}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {loading && <LoadingSpinner size="small" color="primary" />}
                      {loading ? 'Loading...' : 'Load more'}
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;