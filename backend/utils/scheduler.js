//utils/scheduler.js

import NotificationService from '../services/notificationService.js';

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.processedToday = new Set(); // Track which merchants got notifications today
    this.lastCheckDate = null; // Track when we last reset the daily counter
  }

  /**
   * Start the notification scheduler
   * Runs every minute to check if it's time to send daily notifications
   */
  start() {
    if (this.isRunning) {
      console.log('📅 Notification scheduler is already running');
      return;
    }

    console.log('🚀 Starting notification scheduler...');
    this.isRunning = true;

    // Check immediately on start
    this.checkAndProcessNotifications();

    // Then check every minute for precise timing
    this.intervalId = setInterval(() => {
      this.checkAndProcessNotifications();
    }, 60 * 1000); // 1 minute

    console.log('✅ Notification scheduler started successfully');
  }

  /**
   * Stop the notification scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('📅 Notification scheduler is not running');
      return;
    }

    console.log('🛑 Stopping notification scheduler...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('✅ Notification scheduler stopped successfully');
  }

  /**
   * Reset daily tracking at midnight
   */
  resetDailyTracking() {
    const today = new Date().toDateString();
    if (this.lastCheckDate !== today) {
      console.log('🌅 New day detected - Resetting daily notification tracking');
      this.processedToday.clear();
      this.lastCheckDate = today;
    }
  }

  /**
   * Check time but don't auto-process (let individual merchants trigger their own notifications)
   */
  async checkAndProcessNotifications() {
    const now = new Date();
    
    // Reset daily tracking if it's a new day
    this.resetDailyTracking();
    
    // Only log every 30 minutes to reduce console spam
    const shouldLog = now.getMinutes() % 30 === 0;
    if (shouldLog) {
      console.log(`⏰ Scheduler running: ${now.toLocaleTimeString()} - Individual merchants should check their notification times via frontend`);
    }
    
    // The scheduler now just runs as a heartbeat
    // Individual merchants will call the /notifications/check-time endpoint from their frontend
    // This prevents all merchants getting notifications at once and provides better control
  }

  /**
   * Manually trigger notification processing (for testing)
   */
  async triggerNow() {
    console.log('🧪 Manually triggering notification processing...');
    try {
      const count = await NotificationService.processLowStockNotifications();
      console.log(`✅ Manual trigger completed. Created ${count} notifications.`);
      return count;
    } catch (error) {
      console.error('❌ Error in manual trigger:', error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: this.isRunning ? 'Every 30 minutes' : 'Not scheduled',
      lastCheck: new Date().toISOString()
    };
  }
}

// Create a singleton instance
const notificationScheduler = new NotificationScheduler();

export default notificationScheduler;