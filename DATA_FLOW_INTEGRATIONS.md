# StockSpot - Data Flow & Integrations Architecture

## 📊 System Architecture Overview

StockSpot implements a sophisticated multi-layer architecture with intelligent data flows and seamless third-party integrations. The system operates as a distributed microservice architecture with AI-powered agents orchestrating complex workflows.

## 🔄 Core Data Flow Architecture

### **1. Frontend Data Flow**

```
User Interface (React) → State Management (Context API) → API Services → Backend Controllers
```

#### **Component Data Flow**
```
User Input → SearchBar Component → Search Service → API Request → Backend Processing
Results ← SearchResults Component ← API Response ← Processed Data ← Search Controller
```

#### **State Management Flow**
```
AuthContext → User Authentication State → Protected Routes → Merchant Dashboard
NotificationContext → Real-time Alerts → UI Components → User Notifications
```

### **2. Backend Data Flow**

```
API Routes → Controllers → Services → Models → Database (TiDB Cloud)
                ↓
           AI Agents → External APIs → Enhanced Data Processing
```

#### **Request Processing Pipeline**
```
1. HTTP Request → Express Router → Middleware (Auth/Validation)
2. Controller Logic → Service Layer → Business Logic
3. Model Layer → Database Queries → Data Retrieval
4. AI Enhancement → External API Calls → Data Enrichment
5. Response Formation → JSON Response → Frontend Delivery
```

## 🧠 AI Agent Data Flows

### **1. Product Enhancement Agent Flow**

```
Raw Product Data → AI Processing Pipeline → Enhanced Output
```

**Detailed Flow:**
```
1. Input: { name, price, quantity, description, category }
   ↓
2. productDescriptionEnhancer.js → enhanceProductDescription()
   ↓
3. Moonshot AI API Call → enhanceProductWithMoonshot()
   ↓
4. AI Response Processing → JSON parsing, content cleaning
   ↓
5. Output: { enhancedDescription, suggestedCategory, success, error }
```

**Data Transformation:**
```javascript
// Input
{
  name: "Ball",
  price: 25,
  description: null,
  category: null
}

// AI Processing
Moonshot AI Analysis → Enhanced Content Generation

// Output
{
  enhancedDescription: "A versatile sports ball perfect for recreational activities and games",
  suggestedCategory: "Sports & Recreation",
  categoryGenerated: true,
  success: true
}
```

### **2. Search Intelligence Agent Flow**

```
User Query → Query Refinement → Embedding Generation → Multi-Layer Search → Ranked Results
```

**Detailed Flow:**
```
1. User Input: "organic milk"
   ↓
2. Query Refinement: rewriteQueryWithMoonshot() → "organic dairy milk"
   ↓
3. Embedding Generation: getEmbedding() → [0.1, 0.5, 0.8, 0.3]
   ↓
4. Multi-Layer Search:
   - Exact Match Search → Direct name/category matches
   - Partial Match Search → LIKE operations on name/description
   - Vector Similarity Search → VEC_COSINE_DISTANCE() on embeddings
   ↓
5. Result Aggregation → Scoring → Ranking → Final Response
```

**Search Result Data Structure:**
```javascript
{
  results: [
    {
      id: 123,
      name: "Organic Whole Milk",
      price: 4.99,
      quantity: 15,
      match_percentage: 95,
      match_level: "exact",
      distance: 1200,
      merchant: {
        shop_name: "Green Grocers",
        latitude: 40.7128,
        longitude: -74.0060
      }
    }
  ],
  search_info: {
    original_query: "organic milk",
    refined_query: "organic dairy milk",
    total_results: 12,
    exact_matches: 3,
    partial_matches: 5,
    similar_matches: 4
  }
}
```

### **3. Notification Intelligence Agent Flow**

```
Stock Monitoring → Threshold Analysis → AI Enhancement → Notification Delivery
```

**Detailed Flow:**
```
1. Automated Stock Check → NotificationService.processLowStockNotifications()
   ↓
2. Merchant Settings Analysis → Low/Critical thresholds
   ↓
3. Product Inventory Query → Products below thresholds
   ↓
4. AI Enhancement (if enabled):
   - Basic Notification Generation
   - notificationEnhancer.js → enhanceNotificationMessage()
   - Moonshot AI → Context-aware message generation
   ↓
5. Notification Creation → Database storage
   ↓
6. Delivery Orchestration → Frontend notifications, email alerts
```

**Notification Data Transformation:**
```javascript
// Input
{
  products: [
    { name: "Organic Apples", quantity: 2 },
    { name: "Fresh Bread", quantity: 1 }
  ],
  threshold: 5,
  merchantName: "Fresh Market"
}

// AI Processing
Enhanced Message Generation → Business-focused recommendations

// Output
{
  title: "⚠️ 2 Products Need Restocking - Fresh Market",
  message: "Organic Apples (2 left) and Fresh Bread (1 left) are running low. Consider restocking during today's supplier delivery to avoid customer disappointment.",
  isAiEnhanced: true,
  urgency: "medium"
}
```

## 🔗 External Integrations

### **1. TiDB Cloud Database Integration**

**Connection Configuration:**
```javascript
// config/database.js
const pool = mysql.createPool({
  host: process.env.DB_HOST,      // TiDB Cloud endpoint
  user: process.env.DB_USER,      // Database username
  password: process.env.DB_PASSWORD, // Secure password
  database: process.env.DB_NAME,  // Database name
  port: process.env.DB_PORT || 4000, // TiDB Cloud port
  ssl: { rejectUnauthorized: true }, // Secure connection
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
});
```

**Vector Operations:**
```sql
-- Vector similarity search
SELECT VEC_COSINE_DISTANCE(embedding, ?) AS similarity
FROM products 
WHERE similarity < 0.5
ORDER BY similarity ASC;

-- Vector storage
INSERT INTO products (name, embedding) 
VALUES (?, JSON_ARRAY(0.1, 0.5, 0.8, 0.3));
```

**Data Flow:**
```
Application → MySQL2 Driver → TiDB Cloud → Vector Operations → Search Results
```

### **2. Moonshot AI Integration**

**Connection Flow:**
```
Backend Service → Moonshot AI API → Enhanced Content → Application
```

**API Configuration:**
```javascript
// utils/moonshot.js
const response = await axios.post('https://api.moonshot.ai/v1/chat/completions', {
  model: 'moonshot-v1-8k',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  max_tokens: maxTokens,
  temperature: temperature
}, {
  headers: {
    'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

**Use Cases:**
- **Query Refinement**: Natural language → Precise search terms
- **Product Enhancement**: Basic info → Engaging descriptions
- **Notification Intelligence**: Stock data → Actionable business advice

### **3. Google Maps Integration**

**Frontend Integration:**
```javascript
// Geolocation Services
const position = await navigator.geolocation.getCurrentPosition();
const { latitude, longitude } = position.coords;

// Maps Integration
const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
window.open(mapsUrl, '_blank');
```

**Data Flow:**
```
User Location → Browser Geolocation API → Application State → Google Maps Direction API
```

### **4. Deployment Integrations**

#### **Frontend (Vercel)**
```
Git Push → Vercel Build → Deployment → CDN Distribution
```

**Configuration:**
```json
// vercel.json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### **Backend (Render)**
```
Git Push → Render Build → Docker Container → Production Deployment
```

**Configuration:**
```yaml
# render.yaml
services:
  - type: web
    name: stockspot-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## 📈 Data Processing Workflows

### **1. Product Ingestion Workflow**

```
Merchant Input → Validation → AI Enhancement → Embedding Generation → Database Storage → Search Indexing
```

**Detailed Steps:**
1. **Input Validation**: Required fields, data types, business rules
2. **AI Enhancement**: Description improvement, category suggestion
3. **Embedding Generation**: Vector representation for semantic search
4. **Database Transaction**: Atomic operation ensuring consistency
5. **Search Index Update**: Real-time search capability activation

### **2. Search Processing Workflow**

```
User Query → Query Analysis → Multi-Stage Search → Result Ranking → Response Formatting
```

**Performance Optimization:**
- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Indexed searches, limit clauses
- **Caching Strategy**: Frequently searched terms
- **Parallel Processing**: Concurrent search operations

### **3. Notification Processing Workflow**

```
Scheduled Check → Merchant Analysis → Stock Evaluation → AI Enhancement → Delivery Pipeline
```

**Automation Features:**
- **Cron-like Scheduling**: Configurable notification times
- **Batch Processing**: Efficient merchant processing
- **State Management**: Prevent duplicate notifications
- **Error Recovery**: Graceful failure handling

## 🔐 Security & Data Flow

### **Authentication Flow**
```
User Credentials → JWT Generation → Token Storage → API Authentication → Protected Routes
```

### **Data Encryption Flow**
```
Sensitive Data → bcrypt Hashing → Secure Storage → Verification → Access Control
```

### **API Security Pipeline**
```
Request → Rate Limiting → Authentication Middleware → Authorization Check → Controller Access
```

## 📊 Monitoring & Analytics

### **Performance Monitoring**
```
Request Metrics → Response Times → Error Rates → Performance Dashboard
```

### **Business Intelligence**
```
User Interactions → Search Patterns → Merchant Activity → Business Insights
```

### **Error Tracking**
```
Application Errors → Logging Service → Alert System → Developer Notification
```

## 🔄 Real-Time Data Synchronization

### **Live Updates Flow**
```
Database Changes → Change Detection → Real-time Updates → Frontend Synchronization
```

### **Notification Delivery**
```
Event Trigger → Notification Queue → Delivery Service → User Interface Update
```

## 📋 Data Models & Relationships

### **Core Entities**
```
Users ←→ Merchants ←→ Products ←→ Notifications
  ↓         ↓         ↓         ↓
Auth     Settings  Embeddings  Alerts
```

### **Relationship Mapping**
```sql
-- User to Merchant (1:1)
users.id → merchants.user_id

-- Merchant to Products (1:Many)
merchants.id → products.merchant_id

-- Merchant to Notifications (1:Many)
merchants.id → notifications.merchant_id

-- Merchant to Settings (1:1)
merchants.id → notification_settings.merchant_id
```

## 🚀 Scalability & Performance

### **Database Scaling**
- **Connection Pooling**: Efficient resource utilization
- **Query Optimization**: Vector operations, indexed searches
- **Data Partitioning**: Geographic and temporal partitioning

### **Application Scaling**
- **Microservice Architecture**: Independent service scaling
- **Caching Layer**: Redis for frequent queries
- **Load Balancing**: Traffic distribution across instances

### **AI Service Scaling**
- **API Rate Limiting**: Controlled AI service usage
- **Caching Strategy**: Common enhancement results
- **Fallback Mechanisms**: Graceful AI service failures

---

*This document provides a comprehensive overview of StockSpot's data flow architecture and integrations. For implementation details, refer to the codebase and API documentation.*