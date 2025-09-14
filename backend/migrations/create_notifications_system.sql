-- notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    type ENUM('low_stock', 'system', 'alert') DEFAULT 'low_stock',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    product_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_ai_enhanced BOOLEAN DEFAULT FALSE,
    original_message TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- notification_settings table for merchant preferences
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL UNIQUE,
    low_stock_enabled BOOLEAN DEFAULT TRUE,
    low_stock_threshold INT DEFAULT 5,
    critical_stock_threshold INT DEFAULT 2,
    ai_enhanced_notifications BOOLEAN DEFAULT TRUE,
    daily_notification_time TIME DEFAULT '09:00:00',
    email_notifications BOOLEAN DEFAULT FALSE,
    email VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

-- notification_logs table to track daily notification sends (prevent spam)
CREATE TABLE IF NOT EXISTS notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    notification_date DATE NOT NULL,
    low_stock_notifications_sent INT DEFAULT 0,
    product_ids JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_merchant_date (merchant_id, notification_date),
    UNIQUE KEY unique_merchant_date (merchant_id, notification_date),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

-- Insert default notification settings for existing merchants
INSERT IGNORE INTO notification_settings (merchant_id)
SELECT id FROM merchants;