# 🚀 AgriTech AI - Production Deployment & Setup Guide

Complete guide for deploying AgriTech AI to production environments.

---

## Pre-Deployment Checklist

- [ ] All services running locally without errors
- [ ] `.env` file configured with production values
- [ ] API keys obtained (Weather, OpenAI, News API, etc.)
- [ ] Database setup (MongoDB or using local JSON)
- [ ] SSL certificates ready
- [ ] Backup strategy documented
- [ ] Monitoring service configured (Sentry, New Relic, etc.)
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated

---

## Environment Setup

### 1. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
npm run build
```

#### Backend
```bash
cd backend
npm install
```

#### ML Service
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `/backend/.env` with production values:

```bash
# Server
PORT=5000
NODE_ENV=production

# Authentication
JWT_SECRET=<change-to-strong-random-key>
JWT_EXPIRES_IN=7d

# Database
MONGODB_URI=<your-mongodb-connection-string>
LOCAL_DB=false  # Switch to MongoDB in production

# Weather API
WEATHER_API_KEY=<your-weatherapi-key>

# OpenAI API
OPENAI_API_KEY=<your-openai-key>

# ML Service
ML_SERVICE_URL=http://localhost:5001
ML_SERVICE_TIMEOUT=8000

# Frontend
CLIENT_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Cache TTL
WEATHER_CACHE_TTL=600000
MARKET_CACHE_TTL=600000

# Logging
LOG_LEVEL=info

# Security
DEBUG=false
ENABLE_SWAGGER_UI=false
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build Images:**
```bash
docker-compose build
```

2. **Start Services:**
```bash
docker-compose up -d
```

3. **View Logs:**
```bash
docker-compose logs -f
```

4. **Stop Services:**
```bash
docker-compose down
```

### Individual Docker Images

#### Build Backend
```bash
cd backend
docker build -t agritech-backend:latest .
docker run -d -p 5000:5000 --name agritech-backend agritech-backend:latest
```

#### Build ML Service
```bash
cd ml-service
docker build -t agritech-ml:latest .
docker run -d -p 5001:5001 --name agritech-ml agritech-ml:latest
```

#### Build Frontend
```bash
cd frontend
docker build -t agritech-frontend:latest .
docker run -d -p 80:5173 --name agritech-frontend agritech-frontend:latest
```

---

## AWS Deployment

### Using Elastic Beanstalk

#### 1. Backend Deployment
```bash
cd backend

# Initialize EB
eb init -p "Node.js 20 running on 64bit Amazon Linux 2" agritech-backend

# Create environment
eb create agritech-backend-prod

# Configure environment variables
eb setenv \
  NODE_ENV=production \
  JWT_SECRET=<your-secret> \
  WEATHER_API_KEY=<your-key> \
  MONGODB_URI=<your-mongodb-uri>

# Deploy
eb deploy
```

#### 2. ML Service Deployment
```bash
cd ml-service

# Initialize EB
eb init -p "Python 3.11" agritech-ml

# Create environment
eb create agritech-ml-prod

# Deploy
eb deploy
```

#### 3. Frontend Deployment (S3 + CloudFront)
```bash
cd frontend

# Build
npm run build

# Create S3 bucket
aws s3 mb s3://agritech-ai-frontend-prod

# Upload
aws s3 sync dist/ s3://agritech-ai-frontend-prod

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name agritech-ai-frontend-prod.s3.amazonaws.com \
  --default-root-object index.html
```

### Database Setup (AWS RDS - MongoDB Atlas)

```bash
# If using MongoDB Atlas (recommended)
# 1. Create cluster at https://cloud.mongodb.com
# 2. Configure network access
# 3. Set connection string in .env

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agritech-ai
```

---

## Nginx Configuration

Create `/etc/nginx/sites-available/agritech.conf`:

```nginx
upstream backend {
    server localhost:5000;
}

upstream ml_service {
    server localhost:5001;
}

upstream frontend {
    server localhost:5173;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeout for ML service calls
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }

    # ML Service (for debugging)
    location /ml-service/ {
        proxy_pass http://ml_service/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health checks
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/agritech.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL Certificates (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Monitoring & Logging

### Setup Error Tracking (Sentry)

1. Create account at https://sentry.io
2. Add to backend:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({ dsn: "your-sentry-dsn" });
app.use(Sentry.Handlers.errorHandler());
```

3. Add to frontend:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({ dsn: "your-sentry-dsn" });
```

### Setup Application Performance Monitoring

```bash
# Using New Relic
npm install newrelic

# Add to first line of server.js
require('newrelic');
```

### Structured Logging

```bash
npm install winston

# Configure in backend
const logger = require('./config/logger');
logger.info('Server started');
```

---

## Database Backup Strategy

### MongoDB Atlas
- Automated daily backups enabled
- Retention: 7 days
- Point-in-time restore available

### Local JSON Database
```bash
# Daily backup script
#!/bin/bash
cp /path/to/agritech-ai/backend/data/localdb.json \
   /path/to/backups/localdb_$(date +%Y%m%d).json

# Add to crontab
0 0 * * * /path/to/backup.sh
```

---

## Health Checks

### Endpoint Status
```bash
# Backend
curl https://yourdomain.com/health

# ML Service (internal)
curl http://localhost:5001/health

# Check all services
curl https://yourdomain.com/api/predictions/health/ml-service
```

### Setup Monitoring
Use services like:
- **Datadog** - Full stack monitoring
- **New Relic** - APM
- **Prometheus + Grafana** - Open source monitoring
- **CloudWatch** (AWS) - Native monitoring

---

## Scaling Strategies

### Horizontal Scaling
```bash
# Run multiple backend instances
NODE_ENV=production PORT=5000 npm start
NODE_ENV=production PORT=5001 npm start
NODE_ENV=production PORT=5002 npm start

# Use nginx load balancing
upstream backend_cluster {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}
```

### Database Optimization
- Create indexes on frequently queried fields
- Enable query caching (Redis)
- Archive old data regularly
- Monitor slow queries

### Frontend Optimization
```bash
# Build optimization
npm run build
# Outputs minified bundle in dist/

# Enable gzip in nginx
gzip on;

# Enable HTTP/2
listen 443 ssl http2;
```

---

## Troubleshooting Production Issues

### 504 Gateway Timeout
- **Cause**: ML service taking too long
- **Fix**: Increase `ML_SERVICE_TIMEOUT` in .env (max 30s)
- **Monitor**: Check ML service logs

### High Memory Usage
- **Cause**: Memory leaks or unbounded caches
- **Fix**: Restart services nightly
- **Monitor**: Set up memory alerts

### Database Connection Errors
- **Cause**: Connection pool exhausted
- **Fix**: Increase pool size in MongoDB connection string
- **Example**: `maxPoolSize=100`

### Slow API Responses
- **Cause**: Inefficient queries or network latency
- **Fix**: Enable caching, optimize queries, add CDN
- **Monitor**: APM metrics

---

## Post-Deployment Validation

1. **Test all critical flows:**
   ```bash
   # Login
   curl -X POST https://yourdomain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"phone":"9998887776","password":"password123"}'
   
   # Weather endpoint
   curl https://yourdomain.com/api/weather/data/current-weather?location=Bangalore \
     -H "Authorization: Bearer <token>"
   
   # Predictions
   curl -X POST https://yourdomain.com/api/predictions/soil-health \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"nitrogen":50,"phosphorus":40,"potassium":60}'
   ```

2. **Performance testing:**
   ```bash
   npm install -g artillery
   artillery quick -c 100 -d 60 https://yourdomain.com
   ```

3. **Security scanning:**
   ```bash
   npm audit
   npm install -g snyk
   snyk test
   ```

---

## Maintenance Schedule

| Task | Frequency | Duration |
|------|-----------|----------|
| Update dependencies | Monthly | 1-2 hours |
| Security patches | Immediately | 30 min |
| Database maintenance | Weekly | 15 min |
| Log cleanup | Daily | Automatic |
| Backup verification | Weekly | 10 min |

---

## Support & Rollback

### If issues occur in production:

1. **Check service health:**
```bash
curl https://yourdomain.com/health
```

2. **Review recent logs:**
```bash
tail -f logs/error.log
```

3. **Rollback previous version:**
```bash
git revert HEAD
npm run build
docker-compose up -d
```

---

**Last Updated:** April 6, 2026 | **Status:** Production Ready
