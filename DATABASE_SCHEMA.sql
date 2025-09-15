-- StockSpot Database Creation Script
-- This script creates the complete database schema for the StockSpot application
-- Including all tables, indexes, relationships, and sample data

-- ====================================
-- DATABASE CREATION
-- ====================================

-- Create database
CREATE DATABASE IF NOT EXISTS stockspot;
USE stockspot;

-- ====================================
-- CORE TABLES CREATION
-- ====================================

-- Create users table (Authentication and user management)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'merchant', 'user') DEFAULT 'user',
  full_name VARCHAR(255),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active),
  INDEX idx_created_at (created_at)
);

-- Create merchants table (Business/store information)
CREATE TABLE IF NOT EXISTS merchants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DOUBLE,
  longitude DOUBLE,
  owner_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  business_hours VARCHAR(255),
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_shop_name (shop_name),
  INDEX idx_location (latitude, longitude),
  INDEX idx_active (is_active),
  INDEX idx_verified (is_verified)
);

-- Create products table (Product catalog with vector embeddings)
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  merchant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  category VARCHAR(100),
  brand VARCHAR(100),
  sku VARCHAR(100),
  embedding VECTOR(4),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_merchant_id (merchant_id),
  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_price (price),
  INDEX idx_quantity (quantity),
  INDEX idx_active (is_active),
  INDEX idx_brand (brand),
  INDEX idx_sku (sku)
);

-- ====================================
-- NOTIFICATION SYSTEM TABLES
-- ====================================

-- Create notifications table (Store all notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    type ENUM('low_stock', 'critical_stock', 'system', 'alert', 'promotion') DEFAULT 'low_stock',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    product_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_ai_enhanced BOOLEAN DEFAULT FALSE,
    original_message TEXT NULL,
    metadata JSON NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    action_required BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at)
);

-- Create notification_settings table (Merchant notification preferences)
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL UNIQUE,
    low_stock_enabled BOOLEAN DEFAULT TRUE,
    low_stock_threshold INT DEFAULT 5,
    critical_stock_threshold INT DEFAULT 2,
    ai_enhanced_notifications BOOLEAN DEFAULT TRUE,
    daily_notification_time TIME DEFAULT '09:00:00',
    email_notifications BOOLEAN DEFAULT FALSE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    notification_frequency ENUM('immediate', 'hourly', 'daily', 'weekly') DEFAULT 'daily',
    weekend_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_daily_time (daily_notification_time)
);

-- Create notification_logs table (Track notification delivery to prevent spam)
CREATE TABLE IF NOT EXISTS notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    notification_date DATE NOT NULL,
    low_stock_notifications_sent INT DEFAULT 0,
    critical_stock_notifications_sent INT DEFAULT 0,
    product_ids JSON NULL,
    last_notification_time TIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Indexes and constraints
    INDEX idx_merchant_date (merchant_id, notification_date),
    UNIQUE KEY unique_merchant_date (merchant_id, notification_date)
);

-- ====================================
-- ANALYTICS AND TRACKING TABLES
-- ====================================

-- Create search_logs table (Track search patterns for analytics)
CREATE TABLE IF NOT EXISTS search_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    search_query VARCHAR(500) NOT NULL,
    refined_query VARCHAR(500) NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    distance INT NULL,
    results_count INT DEFAULT 0,
    search_type ENUM('exact', 'partial', 'semantic', 'combined') DEFAULT 'combined',
    response_time_ms INT NULL,
    user_agent TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (optional user tracking)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for analytics
    INDEX idx_search_query (search_query),
    INDEX idx_user_id (user_id),
    INDEX idx_location (latitude, longitude),
    INDEX idx_created_at (created_at),
    INDEX idx_search_type (search_type)
);

-- Create product_views table (Track product view analytics)
CREATE TABLE IF NOT EXISTS product_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    merchant_id INT NOT NULL,
    user_id INT NULL,
    view_source ENUM('search', 'related', 'direct', 'category') DEFAULT 'search',
    user_agent TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for analytics
    INDEX idx_product_id (product_id),
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_view_source (view_source),
    INDEX idx_created_at (created_at)
);

-- ====================================
-- VECTOR SEARCH OPTIMIZATION
-- ====================================

-- Enable TiFlash replication for better vector search performance
ALTER TABLE products SET TIFLASH REPLICA 1;

-- Create vector index using HNSW algorithm for fast similarity search
CREATE VECTOR INDEX idx_embedding_cosine 
ON products ((VEC_COSINE_DISTANCE(embedding))) 
USING HNSW;

-- Create additional vector index for L2 distance (alternative similarity metric)
CREATE VECTOR INDEX idx_embedding_l2 
ON products ((VEC_L2_DISTANCE(embedding))) 
USING HNSW;

-- ====================================
-- SAMPLE DATA INSERTION
-- ====================================

-- Insert sample users (merchants and customers)
INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
('admin@stockspot.com', '$2b$10$example.admin.hash', 'admin', 'System Administrator', '1234567890'),
('raj.kumar@toystore.com', '$2b$10$example.merchant.hash1', 'merchant', 'Raj Kumar', '9876543210'),
('priya.sharma@kidsworld.com', '$2b$10$example.merchant.hash2', 'merchant', 'Priya Sharma', '8765432109'),
('arun.patel@funtoys.com', '$2b$10$example.merchant.hash3', 'merchant', 'Arun Patel', '7654321098'),
('sneha.desai@happykids.com', '$2b$10$example.merchant.hash4', 'merchant', 'Sneha Desai', '6543210987'),
('vikram.singh@toykingdom.com', '$2b$10$example.merchant.hash5', 'merchant', 'Vikram Singh', '5432109876'),
('customer1@gmail.com', '$2b$10$example.customer.hash1', 'user', 'Customer One', '4321098765'),
('customer2@gmail.com', '$2b$10$example.customer.hash2', 'user', 'Customer Two', '3210987654');

-- Insert sample merchants (toy stores across different cities)
INSERT INTO merchants (user_id, shop_name, address, latitude, longitude, owner_name, phone, email, business_hours, description) VALUES
(2, 'Toy Store Chennai', '123 Gandhi Nagar, T.Nagar, Chennai, Tamil Nadu 600017', 13.0827, 80.2707, 'Raj Kumar', '9876543210', 'raj.kumar@toystore.com', '9:00 AM - 9:00 PM', 'Premium toy store with educational and fun toys for all ages'),
(3, 'Kids World', '456 Anna Salai, Mount Road, Chennai, Tamil Nadu 600002', 13.0358, 80.2441, 'Priya Sharma', '8765432109', 'priya.sharma@kidsworld.com', '10:00 AM - 8:00 PM', 'Complete destination for children toys, games, and accessories'),
(4, 'Fun Toys Bangalore', '789 MG Road, Brigade Road, Bangalore, Karnataka 560001', 12.9716, 77.5946, 'Arun Patel', '7654321098', 'arun.patel@funtoys.com', '9:30 AM - 9:30 PM', 'Modern toy store featuring latest trends in children entertainment'),
(5, 'Happy Kids Mumbai', '101 Marine Drive, Nariman Point, Mumbai, Maharashtra 400021', 19.0760, 72.8777, 'Sneha Desai', '6543210987', 'sneha.desai@happykids.com', '10:00 AM - 10:00 PM', 'Family-friendly toy store with focus on learning and development'),
(6, 'Toy Kingdom Delhi', '202 Connaught Place, Central Delhi, New Delhi 110001', 28.6139, 77.2090, 'Vikram Singh', '5432109876', 'vikram.singh@toykingdom.com', '11:00 AM - 9:00 PM', 'Largest collection of toys, games, and educational materials in Delhi');

-- Insert sample products with realistic embeddings and comprehensive details
INSERT INTO products (merchant_id, name, description, price, quantity, category, brand, sku, embedding, image_url) VALUES
-- Toy Store Chennai Products
(1, 'Teddy Bear', 'Soft brown teddy bear perfect for cuddling. Made with premium materials, safe for children of all ages. Hypoallergenic and machine washable.', 250.00, 12, 'Soft Toys', 'Cuddle Friends', 'TOY-TB-001', '[0.1,0.2,0.3,0.4]', 'https://example.com/teddy-bear.jpg'),
(1, 'Building Blocks Set', 'Colorful wooden building blocks set with 50 pieces. Develops creativity and motor skills. Non-toxic paint and smooth edges.', 350.00, 8, 'Educational Toys', 'Smart Build', 'TOY-BB-002', '[0.7,0.4,0.6,0.3]', 'https://example.com/building-blocks.jpg'),
(1, 'Stuffed Bear Large', 'Extra large stuffed bear toy, perfect companion for bedtime. Super soft and durable construction with safety tested materials.', 450.00, 5, 'Soft Toys', 'Cuddle Friends', 'TOY-SB-003', '[0.11,0.21,0.31,0.41]', 'https://example.com/stuffed-bear.jpg'),

-- Kids World Products
(2, 'Soft Toy Rabbit', 'Adorable white fluffy rabbit toy with pink ears. Perfect size for toddlers. Certified safe and non-allergenic materials.', 180.00, 15, 'Soft Toys', 'Bunny Hop', 'TOY-R-004', '[0.15,0.25,0.35,0.45]', 'https://example.com/rabbit-toy.jpg'),
(2, 'Educational Puzzle Game', 'Interactive puzzle game with 100 pieces featuring world map. Enhances geographical knowledge and problem-solving skills.', 200.00, 25, 'Educational Toys', 'Brain Boost', 'TOY-PG-005', '[0.12,0.22,0.32,0.42]', 'https://example.com/puzzle-game.jpg'),
(2, 'Wooden Train Set', 'Classic wooden train set with tracks, stations, and multiple train cars. Develops imagination and storytelling abilities.', 650.00, 6, 'Wooden Toys', 'Railway Dreams', 'TOY-TS-006', '[0.45,0.35,0.55,0.25]', 'https://example.com/train-set.jpg'),

-- Fun Toys Bangalore Products
(3, 'Action Figure Superhero', 'Detailed superhero action figure with moveable joints and accessories. Includes cape, weapons, and collector card.', 300.00, 20, 'Action Figures', 'Hero Force', 'TOY-AF-007', '[0.8,0.3,0.5,0.2]', 'https://example.com/action-figure.jpg'),
(3, 'Remote Control Car', 'High-speed remote control sports car with LED lights and sound effects. Rechargeable battery with 30-minute run time.', 850.00, 12, 'RC Toys', 'Speed Racer', 'TOY-RC-008', '[0.65,0.45,0.35,0.55]', 'https://example.com/rc-car.jpg'),
(3, 'Science Experiment Kit', 'Complete science lab kit with 20+ experiments. Includes safety goggles, test tubes, and detailed instruction manual.', 750.00, 10, 'Educational Toys', 'Little Scientist', 'TOY-SK-009', '[0.55,0.65,0.45,0.75]', 'https://example.com/science-kit.jpg'),

-- Happy Kids Mumbai Products
(4, 'Barbie Doll Set', 'Premium Barbie doll set with 5 outfits, accessories, and styling tools. Promotes creativity and fashion sense.', 500.00, 8, 'Dolls', 'Fashion Dreams', 'TOY-BD-010', '[0.2,0.1,0.4,0.3]', 'https://example.com/barbie-set.jpg'),
(4, 'Musical Keyboard', 'Electronic keyboard with 37 keys, multiple instrument sounds, and built-in learning songs. Develops musical skills.', 950.00, 7, 'Musical Toys', 'Melody Maker', 'TOY-KB-011', '[0.85,0.25,0.65,0.15]', 'https://example.com/keyboard.jpg'),
(4, 'Art Supplies Set', 'Complete art set with crayons, markers, colored pencils, drawing paper, and stencils. Encourages artistic expression.', 420.00, 15, 'Art & Craft', 'Creative Kids', 'TOY-AS-012', '[0.35,0.55,0.25,0.65]', 'https://example.com/art-set.jpg'),

-- Toy Kingdom Delhi Products
(5, 'Toy Sports Car', 'Die-cast metal sports car with opening doors and detailed interior. Perfect for car enthusiasts and collectors.', 280.00, 18, 'Vehicles', 'Speed Collection', 'TOY-SC-013', '[0.05,0.15,0.25,0.35]', 'https://example.com/sports-car.jpg'),
(5, 'Board Game Family', 'Classic family board game for 2-6 players. Develops strategy skills and provides hours of family entertainment.', 380.00, 12, 'Board Games', 'Family Fun', 'TOY-BG-014', '[0.75,0.55,0.85,0.45]', 'https://example.com/board-game.jpg'),
(5, 'Robot Programming Kit', 'Advanced programming robot kit that teaches coding basics. Build and program your own robot with visual programming.', 1200.00, 4, 'STEM Toys', 'Code Master', 'TOY-RK-015', '[0.95,0.85,0.75,0.65]', 'https://example.com/robot-kit.jpg');

-- Insert default notification settings for all merchants
INSERT INTO notification_settings (merchant_id, low_stock_threshold, critical_stock_threshold, daily_notification_time, ai_enhanced_notifications)
SELECT id, 10, 3, '09:00:00', TRUE FROM merchants;

-- Insert sample search logs for analytics
INSERT INTO search_logs (search_query, refined_query, latitude, longitude, distance, results_count, search_type, response_time_ms) VALUES
('teddy bear', 'soft teddy bear toy', 13.0827, 80.2707, 5000, 3, 'combined', 245),
('toy car', 'remote control car vehicle', 12.9716, 77.5946, 3000, 5, 'semantic', 189),
('educational toys', 'learning educational toys children', 19.0760, 72.8777, 10000, 8, 'partial', 312),
('doll barbie', 'barbie fashion doll set', 28.6139, 77.2090, 2000, 2, 'exact', 156),
('science kit', 'experiment science learning kit', 13.0358, 80.2441, 8000, 4, 'combined', 278);

-- ====================================
-- DATABASE VIEWS FOR ANALYTICS
-- ====================================

-- Create view for merchant dashboard analytics
CREATE OR REPLACE VIEW merchant_dashboard_stats AS
SELECT 
    m.id as merchant_id,
    m.shop_name,
    COUNT(p.id) as total_products,
    COUNT(CASE WHEN p.quantity <= ns.low_stock_threshold THEN 1 END) as low_stock_products,
    COUNT(CASE WHEN p.quantity <= ns.critical_stock_threshold THEN 1 END) as critical_stock_products,
    AVG(p.price) as average_price,
    SUM(p.quantity) as total_inventory,
    COUNT(pv.id) as total_views_today
FROM merchants m
LEFT JOIN products p ON m.id = p.merchant_id AND p.is_active = TRUE
LEFT JOIN notification_settings ns ON m.id = ns.merchant_id
LEFT JOIN product_views pv ON m.id = pv.merchant_id AND DATE(pv.created_at) = CURDATE()
WHERE m.is_active = TRUE
GROUP BY m.id, m.shop_name;

-- Create view for popular products analytics
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    m.shop_name,
    COUNT(pv.id) as view_count,
    COUNT(sl.id) as search_mentions
FROM products p
JOIN merchants m ON p.merchant_id = m.id
LEFT JOIN product_views pv ON p.id = pv.product_id
LEFT JOIN search_logs sl ON sl.search_query LIKE CONCAT('%', p.name, '%')
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.category, p.price, m.shop_name
ORDER BY view_count DESC, search_mentions DESC;

-- ====================================
-- STORED PROCEDURES
-- ====================================

DELIMITER //

-- Procedure to get nearby products with vector similarity
CREATE PROCEDURE GetNearbyProducts(
    IN search_embedding VARCHAR(1000),
    IN user_lat DOUBLE,
    IN user_lng DOUBLE,
    IN search_distance INT,
    IN result_limit INT
)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.quantity,
        p.category,
        m.shop_name,
        m.address,
        m.latitude,
        m.longitude,
        VEC_COSINE_DISTANCE(p.embedding, CAST(search_embedding AS VECTOR(4))) AS similarity,
        (6371000 * ACOS(
            COS(RADIANS(user_lat)) * COS(RADIANS(m.latitude)) *
            COS(RADIANS(user_lng) - RADIANS(m.longitude)) +
            SIN(RADIANS(user_lat)) * SIN(RADIANS(m.latitude))
        )) AS distance_meters
    FROM products p
    JOIN merchants m ON p.merchant_id = m.id
    WHERE p.is_active = TRUE 
        AND m.is_active = TRUE
        AND p.quantity > 0
        AND (6371000 * ACOS(
            COS(RADIANS(user_lat)) * COS(RADIANS(m.latitude)) *
            COS(RADIANS(user_lng) - RADIANS(m.longitude)) +
            SIN(RADIANS(user_lat)) * SIN(RADIANS(m.latitude))
        )) <= search_distance
    ORDER BY similarity ASC, distance_meters ASC
    LIMIT result_limit;
END //

-- Procedure to update product embeddings (for AI enhancement)
CREATE PROCEDURE UpdateProductEmbedding(
    IN product_id INT,
    IN new_embedding VARCHAR(1000)
)
BEGIN
    UPDATE products 
    SET embedding = CAST(new_embedding AS VECTOR(4)),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = product_id;
END //

DELIMITER ;

-- ====================================
-- TRIGGERS
-- ====================================

DELIMITER //

-- Trigger to automatically create notification settings for new merchants
CREATE TRIGGER after_merchant_insert 
    AFTER INSERT ON merchants
    FOR EACH ROW
BEGIN
    INSERT INTO notification_settings (merchant_id) 
    VALUES (NEW.id);
END //

-- Trigger to log low stock products for notifications
CREATE TRIGGER after_product_update_stock
    AFTER UPDATE ON products
    FOR EACH ROW
BEGIN
    DECLARE low_threshold INT DEFAULT 5;
    
    -- Get merchant's low stock threshold
    SELECT low_stock_threshold INTO low_threshold 
    FROM notification_settings 
    WHERE merchant_id = NEW.merchant_id;
    
    -- If quantity dropped to or below threshold, log for notification
    IF NEW.quantity <= low_threshold AND OLD.quantity > low_threshold THEN
        INSERT INTO notification_logs (merchant_id, notification_date, product_ids)
        VALUES (NEW.merchant_id, CURDATE(), JSON_ARRAY(NEW.id))
        ON DUPLICATE KEY UPDATE 
        product_ids = JSON_ARRAY_APPEND(IFNULL(product_ids, JSON_ARRAY()), '$', NEW.id);
    END IF;
END //

DELIMITER ;

-- ====================================
-- FINAL SETUP AND VERIFICATION
-- ====================================

-- Show all created tables
SHOW TABLES;

-- Verify table structures
DESCRIBE users;
DESCRIBE merchants;
DESCRIBE products;
DESCRIBE notifications;
DESCRIBE notification_settings;

-- Verify sample data
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_merchants FROM merchants;
SELECT COUNT(*) as total_products FROM products;

-- Test vector search functionality
SELECT 
    name, 
    category, 
    price,
    VEC_COSINE_DISTANCE(embedding, '[0.1,0.2,0.3,0.4]') as similarity
FROM products 
ORDER BY similarity ASC 
LIMIT 5;

-- Display completion message
SELECT 'StockSpot database created successfully! Ready for application deployment.' as Status;