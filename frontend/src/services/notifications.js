//services/notifications.js

import api from './api.js';

// Get notifications for the authenticated merchant
export const getNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.unread) queryParams.append('unread', 'true');
    
    const queryString = queryParams.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Get a specific notification by ID
export const getNotificationById = async (id) => {
  try {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings = async () => {
  try {
    const response = await api.get('/notifications/settings/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

// Check if it's notification time and process if needed
export const checkNotificationTime = async () => {
  try {
    const response = await api.post('/notifications/check-time');
    return response.data;
  } catch (error) {
    console.error('Error checking notification time:', error);
    throw error;
  }
};

// Manually trigger low stock check (for testing)
export const triggerLowStockCheck = async () => {
  try {
    const response = await api.post('/notifications/trigger-check');
    return response.data;
  } catch (error) {
    console.error('Error triggering low stock check:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  checkNotificationTime,
  triggerLowStockCheck
};