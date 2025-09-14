import React, { useState, useEffect } from 'react';
import { getNotificationSettings, updateNotificationSettings, triggerLowStockCheck } from '../../services/notifications';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    low_stock_enabled: true,
    low_stock_threshold: 5,
    critical_stock_threshold: 2,
    ai_enhanced_notifications: true,
    daily_notification_time: '09:00',
    email_notifications: false,
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getNotificationSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Failed to load notification settings');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Validate settings
      if (settings.low_stock_threshold <= 0 || settings.low_stock_threshold > 100) {
        throw new Error('Low stock threshold must be between 1 and 100');
      }
      
      if (settings.critical_stock_threshold <= 0 || settings.critical_stock_threshold > 50) {
        throw new Error('Critical stock threshold must be between 1 and 50');
      }
      
      if (settings.critical_stock_threshold >= settings.low_stock_threshold) {
        throw new Error('Critical stock threshold must be less than low stock threshold');
      }
      
      if (settings.email_notifications && !settings.email) {
        throw new Error('Email address is required when email notifications are enabled');
      }

      const response = await updateNotificationSettings(settings);
      setSettings(response.data);
      setMessage('Settings saved successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage(error.response?.data?.message || error.message || 'Failed to save settings');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotifications = async () => {
    setTesting(true);
    setMessage('');
    
    try {
      const response = await triggerLowStockCheck();
      setMessage(`Test completed! Created ${response.data.notificationsCreated} notifications.`);
      setMessageType('success');
    } catch (error) {
      console.error('Error testing notifications:', error);
      setMessage(error.response?.data?.message || 'Failed to test notifications');
      setMessageType('error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="notification-settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h2>🔔 Notification Settings</h2>
        <p>Configure how and when you receive stock alerts</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="settings-form">
        {/* Basic Notification Settings */}
        <div className="settings-section">
          <h3>Basic Settings</h3>
          
          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="low_stock_enabled">
                Enable Low Stock Notifications
              </label>
              <p className="setting-description">
                Receive daily notifications when products are running low
              </p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="low_stock_enabled"
                  checked={settings.low_stock_enabled}
                  onChange={(e) => handleSettingChange('low_stock_enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="low_stock_threshold">
                Low Stock Threshold
              </label>
              <p className="setting-description">
                Get notified when stock falls below this number
              </p>
            </div>
            <div className="setting-control">
              <input
                type="number"
                id="low_stock_threshold"
                min="1"
                max="100"
                value={settings.low_stock_threshold}
                onChange={(e) => handleSettingChange('low_stock_threshold', parseInt(e.target.value))}
                disabled={!settings.low_stock_enabled}
              />
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="critical_stock_threshold">
                Critical Stock Threshold
              </label>
              <p className="setting-description">
                Get urgent notifications when stock is critically low
              </p>
            </div>
            <div className="setting-control">
              <input
                type="number"
                id="critical_stock_threshold"
                min="1"
                max="50"
                value={settings.critical_stock_threshold}
                onChange={(e) => handleSettingChange('critical_stock_threshold', parseInt(e.target.value))}
                disabled={!settings.low_stock_enabled}
              />
            </div>
          </div>
        </div>

        {/* AI Enhancement Settings */}
        <div className="settings-section">
          <h3>✨ AI Enhancement</h3>
          
          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="ai_enhanced_notifications">
                AI-Enhanced Notifications
              </label>
              <p className="setting-description">
                Get smarter, more actionable notifications with AI-generated insights
              </p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="ai_enhanced_notifications"
                  checked={settings.ai_enhanced_notifications}
                  onChange={(e) => handleSettingChange('ai_enhanced_notifications', e.target.checked)}
                  disabled={!settings.low_stock_enabled}
                />
                <span className="toggle-slider ai-toggle"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="settings-section">
          <h3>⏰ Timing</h3>
          
          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="daily_notification_time">
                Daily Notification Time
              </label>
              <p className="setting-description">
                Preferred time to receive daily stock alerts
              </p>
            </div>
            <div className="setting-control">
              <input
                type="time"
                id="daily_notification_time"
                value={settings.daily_notification_time}
                onChange={(e) => handleSettingChange('daily_notification_time', e.target.value)}
                disabled={!settings.low_stock_enabled}
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="settings-section">
          <h3>📧 Email Notifications</h3>
          
          <div className="setting-item">
            <div className="setting-label">
              <label htmlFor="email_notifications">
                Email Notifications
              </label>
              <p className="setting-description">
                Also receive notifications via email (coming soon)
              </p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  disabled={true} // Disabled for now
                />
                <span className="toggle-slider disabled"></span>
              </label>
            </div>
          </div>

          {settings.email_notifications && (
            <div className="setting-item">
              <div className="setting-label">
                <label htmlFor="email">
                  Email Address
                </label>
                <p className="setting-description">
                  Email address to receive notifications
                </p>
              </div>
              <div className="setting-control">
                <input
                  type="email"
                  id="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                  placeholder="your@email.com"
                  disabled={!settings.email_notifications}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button
            className="test-btn"
            onClick={handleTestNotifications}
            disabled={testing || !settings.low_stock_enabled}
          >
            {testing ? 'Testing...' : '🧪 Test Notifications'}
          </button>
          
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;