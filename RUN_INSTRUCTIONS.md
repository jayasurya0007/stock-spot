# StockSpot - Installation & Run Instructions

## 🚀 Quick Start Guide

This guide will help you set up and run StockSpot locally for development or deploy it to production environments.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### **Required Software**
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (for cloning the repository)
- **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)

### **Required Services**
- **TiDB Cloud Account** (for database services)
- **Moonshot AI API Key** (for AI enhancements)
- **Code Editor** (VS Code recommended)

### **System Requirements**
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **Network**: Stable internet connection for API calls

## 📁 Project Structure

```
stock-spot/
├── frontend/          # React.js frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── vite.config.js # Vite configuration
├── backend/          # Node.js backend application
│   ├── controllers/  # API controllers
│   ├── models/       # Database models
│   ├── services/     # Business logic services
│   ├── utils/        # Utility functions
│   ├── config/       # Configuration files
│   ├── routes/       # API routes
│   ├── middleware/   # Express middleware
│   ├── migrations/   # Database migrations
│   └── package.json  # Backend dependencies
├── README.md         # Main documentation
├── DATA_FLOW_INTEGRATIONS.md # Architecture documentation
├── FEATURES_FUNCTIONALITY.md # Feature documentation
└── RUN_INSTRUCTIONS.md      # This file
```

## 🛠 Local Development Setup

### **Step 1: Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/jayasurya0007/stock-spot.git

# Navigate to the project directory
cd stock-spot
```

### **Step 2: Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Or if you prefer yarn
yarn install
```

### **Step 3: Environment Configuration**

Create a `.env` file in the `backend` directory with the following configuration:

```env
# Database Configuration (TiDB Cloud)
DB_HOST=your-tidb-host.clusters.tidb-cloud.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
DB_PORT=4000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Moonshot AI Configuration
MOONSHOT_API_KEY=your-moonshot-api-key

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### **Step 4: Database Setup**

```bash
# Run database migrations (if you have migration files)
npm run migrate

# Or manually create tables using your TiDB Cloud console
# Refer to migrations/create_notifications_system.sql for table structures
```

### **Step 5: Start Backend Server**

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start

# Server will start on http://localhost:5000
```

### **Step 6: Frontend Setup**

Open a new terminal window/tab:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Or if you prefer yarn
yarn install
```

### **Step 7: Frontend Environment Configuration**

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Google Maps API (optional)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Environment
VITE_NODE_ENV=development
```

### **Step 8: Start Frontend Development Server**

```bash
# Start development server
npm run dev

# Or with yarn
yarn dev

# Frontend will start on http://localhost:5173
```

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (if implemented)

## 🧪 Testing the Setup

### **Test Backend API**

```bash
# Test server health
curl http://localhost:5000/api/health

# Test authentication endpoint
curl -X POST http://localhost:5000/api/auth/test \
  -H "Content-Type: application/json"
```

### **Test Frontend**

1. Open http://localhost:5173 in your browser
2. Try searching for a product
3. Attempt to register as a merchant
4. Test location services

## 📦 Production Deployment

### **Backend Deployment (Render)**

1. **Create Render Account**
   - Sign up at https://render.com
   - Connect your GitHub repository

2. **Configure Web Service**
   ```yaml
   # render.yaml (in project root)
   services:
     - type: web
       name: stockspot-backend
       env: node
       region: oregon
       plan: starter
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: DB_HOST
           value: your-production-db-host
         - key: DB_USER
           value: your-production-db-user
         - key: DB_PASSWORD
           value: your-production-db-password
         - key: DB_NAME
           value: your-production-db-name
         - key: JWT_SECRET
           value: your-production-jwt-secret
         - key: MOONSHOT_API_KEY
           value: your-moonshot-api-key
   ```

3. **Deploy**
   - Push to main branch
   - Render will automatically deploy

### **Frontend Deployment (Vercel)**

1. **Create Vercel Account**
   - Sign up at https://vercel.com
   - Connect your GitHub repository

2. **Configure Project Settings**
   ```json
   // vercel.json (in project root)
   {
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "https://your-backend-url.render.com/api/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.render.com/api
   VITE_NODE_ENV=production
   ```

4. **Deploy**
   - Push to main branch
   - Vercel will automatically deploy

## 🔧 Development Tools & Scripts

### **Backend Scripts**

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Run tests (if implemented)
npm test

# Database migrations
npm run migrate

# Lint code
npm run lint

# Format code
npm run format
```

### **Frontend Scripts**

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Backend Won't Start**
```bash
# Check if ports are in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Kill process using port
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # macOS/Linux
```

#### **Database Connection Issues**
- Verify TiDB Cloud credentials
- Check network connectivity
- Ensure SSL is properly configured
- Verify database exists and user has permissions

#### **Frontend API Calls Failing**
- Check CORS configuration in backend
- Verify API URL in frontend environment
- Check network requests in browser dev tools
- Ensure backend server is running

#### **AI Services Not Working**
- Verify Moonshot API key is valid
- Check API rate limits
- Monitor API usage dashboard
- Implement fallback mechanisms

### **Debugging Tips**

#### **Backend Debugging**
```bash
# Enable detailed logging
DEBUG=* npm run dev

# Check logs
tail -f logs/application.log

# Use Node.js debugger
node --inspect server.js
```

#### **Frontend Debugging**
- Open browser developer tools (F12)
- Check Console tab for JavaScript errors
- Use Network tab to monitor API calls
- Use React Developer Tools extension

### **Performance Optimization**

#### **Backend Performance**
```bash
# Monitor memory usage
node --inspect --max-old-space-size=4096 server.js

# Profile performance
npm install -g clinic
clinic doctor -- node server.js
```

#### **Frontend Performance**
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npm install -g depcheck
depcheck
```

## 📊 Monitoring & Logs

### **Application Logs**

#### **Backend Logs**
```bash
# View real-time logs
tail -f backend/logs/app.log

# Search logs
grep "ERROR" backend/logs/app.log
```

#### **Frontend Logs**
- Browser console logs
- Network request logs
- Performance monitoring in browser dev tools

### **Production Monitoring**

#### **Render Monitoring**
- Built-in metrics dashboard
- Log streaming
- Performance monitoring

#### **Vercel Analytics**
- Core Web Vitals
- Page performance
- User analytics

## 🔐 Security Considerations

### **Development Security**
- Never commit `.env` files
- Use strong JWT secrets
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production

### **Production Security**
- Enable security headers
- Use environment variables for secrets
- Implement proper CORS
- Monitor for security vulnerabilities
- Regular dependency updates

## 🚀 Advanced Configuration

### **Custom Domains**

#### **Backend (Render)**
1. Purchase domain
2. Configure DNS records
3. Add custom domain in Render dashboard
4. Update CORS configuration

#### **Frontend (Vercel)**
1. Add domain in Vercel dashboard
2. Configure DNS records
3. SSL certificate automatically provisioned

### **Environment-Specific Configurations**

#### **Staging Environment**
```env
NODE_ENV=staging
DB_HOST=staging-db-host
API_URL=https://staging-api.yourdomain.com
```

#### **Production Environment**
```env
NODE_ENV=production
DB_HOST=production-db-host
API_URL=https://api.yourdomain.com
```

## 📚 Additional Resources

### **Documentation**
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud)
- [Moonshot AI API Documentation](https://api.moonshot.ai/docs)
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)

### **Development Tools**
- [VS Code Extensions for React](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [Postman for API Testing](https://www.postman.com)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)

### **Support**
- Create GitHub issues for bugs
- Check existing issues before creating new ones
- Follow coding standards and contribution guidelines

---

*This guide covers the complete setup and deployment process for StockSpot. For additional help, refer to the troubleshooting section or create an issue in the GitHub repository.*