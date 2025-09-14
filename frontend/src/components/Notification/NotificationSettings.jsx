import React, { useState, useEffect } from 'react';
import { getNotificationSettings, updateNotificationSettings, triggerLowStockCheck } from '../../services/notifications';
import { LoadingSpinner } from '../Loading';
import { Bell, Save, TestTube, Mail, Clock, Zap } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="text-blue-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
            </div>
            <p className="text-gray-600">Configure how and when you receive stock alerts</p>
          </div>

          <div className="p-6">
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                messageType === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-8">
              {/* Basic Notification Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="low_stock_enabled" className="block text-sm font-medium text-gray-700 mb-1">
                        Enable Low Stock Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Receive daily notifications when products are running low
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="low_stock_enabled"
                          className="sr-only"
                          checked={settings.low_stock_enabled}
                          onChange={(e) => handleSettingChange('low_stock_enabled', e.target.checked)}
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${
                          settings.low_stock_enabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          settings.low_stock_enabled ? 'transform translate-x-6' : ''
                        }`}></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        id="low_stock_threshold"
                        min="1"
                        max="100"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        value={settings.low_stock_threshold}
                        onChange={(e) => handleSettingChange('low_stock_threshold', parseInt(e.target.value))}
                        disabled={!settings.low_stock_enabled}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Get notified when stock falls below this number
                      </p>
                    </div>

                    <div>
                      <label htmlFor="critical_stock_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                        Critical Stock Threshold
                      </label>
                      <input
                        type="number"
                        id="critical_stock_threshold"
                        min="1"
                        max="50"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        value={settings.critical_stock_threshold}
                        onChange={(e) => handleSettingChange('critical_stock_threshold', parseInt(e.target.value))}
                        disabled={!settings.low_stock_enabled}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Get urgent notifications when stock is critically low
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Enhancement Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Zap size={18} className="mr-2 text-yellow-500" />
                  AI Enhancement
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label htmlFor="ai_enhanced_notifications" className="block text-sm font-medium text-gray-700 mb-1">
                      AI-Enhanced Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Get smarter, more actionable notifications with AI-generated insights
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="ai_enhanced_notifications"
                        className="sr-only"
                        checked={settings.ai_enhanced_notifications}
                        onChange={(e) => handleSettingChange('ai_enhanced_notifications', e.target.checked)}
                        disabled={!settings.low_stock_enabled}
                      />
                      <div className={`w-12 h-6 rounded-full transition-colors ${
                        settings.ai_enhanced_notifications ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        settings.ai_enhanced_notifications ? 'transform translate-x-6' : ''
                      }`}></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Timing Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Clock size={18} className="mr-2 text-blue-500" />
                  Timing
                </h3>
                
                <div>
                  <label htmlFor="daily_notification_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Notification Time
                  </label>
                  <input
                    type="time"
                    id="daily_notification_time"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={settings.daily_notification_time}
                    onChange={(e) => handleSettingChange('daily_notification_time', e.target.value)}
                    disabled={!settings.low_stock_enabled}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Preferred time to receive daily stock alerts
                  </p>
                </div>
              </div>

              {/* Email Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Mail size={18} className="mr-2 text-gray-500" />
                  Email Notifications
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="email_notifications" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Notifications
                      </label>
                      <p className="text-sm text-gray-500">
                        Also receive notifications via email (coming soon)
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="email_notifications"
                          className="sr-only"
                          checked={settings.email_notifications}
                          onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                          disabled={true}
                        />
                        <div className="w-12 h-6 rounded-full bg-gray-300"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                      </label>
                    </div>
                  </div>

                  {settings.email_notifications && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        value={settings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                        placeholder="your@email.com"
                        disabled={!settings.email_notifications}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  onClick={handleTestNotifications}
                  disabled={testing || !settings.low_stock_enabled}
                >
                  {testing ? (
                    <LoadingSpinner size="small" color="gray" />
                  ) : (
                    <TestTube size={18} />
                  )}
                  {testing ? 'Testing...' : 'Test Notifications'}
                </button>
                
                <button
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;