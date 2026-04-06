# 📡 AgriTech AI - Complete API Documentation

All API endpoints require `Content-Type: application/json` and (except auth) require JWT token in `Authorization: Bearer <token>` header.

---

## Authentication API

### Register User
**POST** `/api/auth/register`

```json
{
  "name": "Farmer Name",
  "phone": "+919998887776",
  "password": "SecurePass123!",
  "location": "Bangalore, Karnataka"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user123",
      "name": "Farmer Name",
      "phone": "9998887776",
      "location": "Bangalore, Karnataka"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login User
**POST** `/api/auth/login`

```json
{
  "phone": "9998887776",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ...user details },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## Weather API

### Get Current Weather
**GET** `/api/weather/data/current-weather?location=Bangalore`

**Response:**
```json
{
  "success": true,
  "data": {
    "location": "Bangalore",
    "temperature": 28.5,
    "humidity": 65,
    "feelsLike": 27.8,
    "condition": "Partly Cloudy",
    "windSpeed": 12,
    "uvIndex": 6,
    "visibility": 10,
    "pressure": 1013,
    "precipitation": 0,
    "timestamp": "2026-04-06T10:30:00Z"
  }
}
```

### Get 7-Day Forecast
**GET** `/api/weather/data/forecast?location=Bangalore`

**Response:**
```json
{
  "success": true,
  "data": {
    "location": "Bangalore",
    "forecast": [
      {
        "date": "2026-04-07",
        "tempMax": 32,
        "tempMin": 22,
        "condition": "Sunny",
        "precipitation": 0,
        "humidity": 60
      },
      ...
    ]
  }
}
```

### Get Crop Suitability
**GET** `/api/weather/data/crop-suitability?cropName=rice&location=Bangalore`

**Response:**
```json
{
  "success": true,
  "data": {
    "crop": "rice",
    "location": "Bangalore",
    "suitabilityScore": 85,
    "rating": "Excellent",
    "analysis": {
      "temperature": { "ideal": "25-30°C", "current": "28.5°C", "suitable": true },
      "humidity": { "ideal": "60-80%", "current": "65%", "suitable": true },
      "rainfall": { "required": "100-150mm/month", "suitable": true }
    }
  }
}
```

### Get Weather Recommendations
**GET** `/api/weather/data/recommendations?location=Bangalore`

**Response:**
```json
{
  "success": true,
  "data": {
    "location": "Bangalore",
    "recommendations": [
      {
        "crop": "rice",
        "recommendation": "GOOD - Ideal conditions for planting",
        "confidence": 0.92
      },
      {
        "crop": "wheat",
        "recommendation": "MODERATE - Temperature slightly high",
        "confidence": 0.75
      }
    ]
  }
}
```

---

## Predictions API

### Predict Nutrient Deficiency
**POST** `/api/predictions/nutrient-deficiency`

```json
{
  "nitrogen": 45,
  "phosphorus": 35,
  "potassium": 55,
  "pH": 6.5,
  "moisture": 60,
  "temperature": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "deficiencies": ["nitrogen", "phosphorus"],
      "severity": "moderate",
      "recommendations": [
        {
          "nutrient": "nitrogen",
          "fertilizer": "Urea (46% N)",
          "dosage": "100-150 kg/hectare",
          "timing": "Apply in 2 splits"
        }
      ]
    },
    "confidence": 0.85
  }
}
```

### Predict Soil Health
**POST** `/api/predictions/soil-health`

```json
{
  "nitrogen": 50,
  "phosphorus": 40,
  "potassium": 60,
  "pH": 6.5,
  "moisture": 60,
  "organicMatter": 3.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "healthScore": 72,
    "rating": "Good",
    "improvements": [
      "Increase organic matter by 1%",
      "Reduce potassium levels slightly"
    ],
    "timestamp": "2026-04-06T10:30:00Z"
  }
}
```

### Predict Crop Yield
**POST** `/api/predictions/crop-yield`

```json
{
  "cropName": "rice",
  "area": 2.5,
  "nitrogen": 50,
  "phosphorus": 40,
  "potassium": 60,
  "rainfall": 800,
  "temperature": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimatedYield": 5800,
    "unit": "kg/hectare",
    "confidence": 0.78,
    "factors": {
      "climate": 0.85,
      "soil": 0.72,
      "management": 0.80
    },
    "recommendations": [
      "Ensure adequate irrigation during flowering",
      "Apply potassium fertilizer 30 days before harvest"
    ]
  }
}
```

### Predict Disease Risk
**POST** `/api/predictions/disease-risk`

```json
{
  "cropName": "wheat",
  "temperature": 22,
  "humidity": 75,
  "rainfall": 120
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskLevel": "moderate",
    "riskScore": 65,
    "potentialDiseases": [
      {
        "disease": "Powdery Mildew",
        "probability": 0.72,
        "severity": "medium"
      },
      {
        "disease": "Rust",
        "probability": 0.45,
        "severity": "low"
      }
    ],
    "preventionMeasures": [
      "Spray sulfur or synthetic fungicide early",
      "Improve air circulation by reducing plant density",
      "Monitor humidity levels"
    ]
  }
}
```

### Get Comprehensive Recommendation
**POST** `/api/predictions/recommendation`

```json
{
  "farmArea": 5.0,
  "soilData": {
    "nitrogen": 50,
    "phosphorus": 40,
    "potassium": 60,
    "pH": 6.5
  },
  "weatherData": {
    "temperature": 25,
    "rainfall": 800,
    "humidity": 65
  },
  "cropPreferences": ["rice", "wheat", "cotton"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendedCrops": [
      {
        "crop": "rice",
        "suitabilityScore": 92,
        "expectedYield": 5800,
        "profitMargin": "₹85,000-₹95,000 per hectare"
      },
      {
        "crop": "wheat",
        "suitabilityScore": 78,
        "expectedYield": 4500,
        "profitMargin": "₹60,000-₹70,000 per hectare"
      }
    ],
    "bestCrop": "rice",
    "seasonalPlan": [...]
  }
}
```

### Check ML Service Health
**GET** `/api/predictions/health/ml-service`

**Response:**
```json
{
  "success": true,
  "data": {
    "mlService": {
      "status": "operational",
      "uptime": "2 hours",
      "timestamp": "2026-04-06T10:30:00Z"
    }
  }
}
```

---

## Farm Management API

### Create Farm
**POST** `/api/farms`

```json
{
  "name": "Green Valley Farm",
  "location": "Bangalore, Karnataka",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "area": 5.0,
  "soilType": "loamy"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "farm": {
      "_id": "farm123",
      "name": "Green Valley Farm",
      "location": "Bangalore, Karnataka",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "area": 5.0,
      "createdAt": "2026-04-06T10:30:00Z"
    }
  }
}
```

### Get All Farms
**GET** `/api/farms`

**Response:**
```json
{
  "success": true,
  "data": {
    "farms": [
      { ...farm details },
      { ...farm details }
    ]
  }
}
```

### Update Farm
**PUT** `/api/farms/:farmId`

```json
{
  "name": "Updated Farm Name",
  "area": 6.0
}
```

### Delete Farm
**DELETE** `/api/farms/:farmId`

---

## Soil Analysis API

### Add Soil Reading
**POST** `/api/soil/readings`

```json
{
  "farmId": "farm123",
  "nitrogen": 45,
  "phosphorus": 35,
  "potassium": 55,
  "pH": 6.5,
  "moisture": 60,
  "temperature": 25,
  "organicMatter": 3.5
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "reading": {
      "_id": "reading123",
      "farmId": "farm123",
      "healthScore": 72,
      "rating": "Good",
      "timestamp": "2026-04-06T10:30:00Z"
    }
  }
}
```

### Get Soil Readings
**GET** `/api/soil/readings?farmId=farm123`

**Response:**
```json
{
  "success": true,
  "data": {
    "readings": [ ...reading data ],
    "trend": "improving",
    "lastReading": { ...latest reading }
  }
}
```

---

## Error Responses

### Validation Error
**Status: 400**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2026-04-06T10:30:00Z",
    "details": {
      "fields": [
        { "field": "email", "message": "must be a valid email" }
      ]
    }
  }
}
```

### Authentication Error
**Status: 401**
```json
{
  "success": false,
  "error": {
    "message": "Invalid token",
    "code": "INVALID_TOKEN",
    "statusCode": 401,
    "timestamp": "2026-04-06T10:30:00Z"
  }
}
```

### ML Service Timeout
**Status: 504**
```json
{
  "success": false,
  "error": {
    "message": "ML Service request timed out after 8000ms",
    "code": "TIMEOUT_ERROR",
    "statusCode": 504,
    "timestamp": "2026-04-06T10:30:00Z",
    "details": {
      "service": "ML Service",
      "timeout": 8000
    }
  }
}
```

### Rate Limit Exceeded
**Status: 429**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP",
    "code": "RATE_LIMIT_EXCEEDED",
    "statusCode": 429,
    "timestamp": "2026-04-06T10:30:00Z"
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Predictions | 30 requests | 1 minute |

---

## Authentication Header Format

All requests (except `/api/auth/login` and `/api/auth/register`) require:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

**Last Updated:** April 6, 2026
