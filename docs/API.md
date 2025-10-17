# RoutePool API Documentation

## Overview

The RoutePool API provides endpoints for smart ridesharing with AI-powered route matching. The API enables drivers to create route offers and passengers to find and join matching routes with real-time tracking.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.routepool.app/api`

## Authentication

Most endpoints require JWT authentication via OTP verification. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Getting Started

1. Request OTP code via SMS
2. Verify OTP to receive JWT token
3. Use token for authenticated requests

## Endpoints

### Health Check

#### GET /health
Returns API status and version information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-17T18:53:00.000Z",
  "environment": "development",
  "version": "0.1.0",
  "service": "RoutePool"
}
```

### Authentication

#### POST /auth/otp
Request OTP verification code via SMS.

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

#### POST /auth/verify
Verify OTP code and login/register user.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_uuid",
    "name": "User 7890",
    "phone": "+1234567890",
    "role": "passenger",
    "rating": 5.0
  }
}
```

### Route Management

#### POST /routes
Create a new route offer (driver only, requires authentication).

**Request Body:**
```json
{
  "startLat": 34.05,
  "startLng": -118.25,
  "endLat": 34.10,
  "endLng": -118.30,
  "startAddress": "123 Main St, City",
  "endAddress": "456 Oak Ave, City",
  "departTime": "2024-01-01T10:00:00Z",
  "seatsTotal": 3,
  "vehicleId": "vehicle_uuid",
  "polylineString": "encoded_polyline",
  "estimatedDistance": 10.5,
  "estimatedDuration": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "route_uuid",
    "creatorId": "user_uuid",
    "startPoint": {"type": "Point", "coordinates": [-118.25, 34.05]},
    "endPoint": {"type": "Point", "coordinates": [-118.30, 34.10]},
    "departTime": "2024-01-01T10:00:00Z",
    "seatsTotal": 3,
    "seatsLeft": 3,
    "baseFare": 25.75,
    "status": "active"
  }
}
```

#### GET /routes/nearby
Find nearby routes matching your travel needs (requires authentication).

**Query Parameters:**
- `startLat` - Pickup latitude (required)
- `startLng` - Pickup longitude (required)
- `endLat` - Dropoff latitude (required)
- `endLng` - Dropoff longitude (required)
- `timeWindow` - Time window in minutes (default: 120)
- `departTime` - Desired departure time (ISO format)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "route_uuid",
      "creator": {
        "id": "user_uuid",
        "name": "John Doe",
        "rating": 4.8,
        "totalRides": 42
      },
      "vehicle": {
        "id": "vehicle_uuid",
        "model": "Toyota Camry",
        "color": "Silver",
        "plate": "ABC123"
      },
      "startPoint": {"type": "Point", "coordinates": [-118.24, 34.04]},
      "endPoint": {"type": "Point", "coordinates": [-118.31, 34.11]},
      "departTime": "2024-01-01T10:15:00Z",
      "seatsLeft": 2,
      "baseFare": 25.00,
      "status": "active"
    }
  ]
}
```

#### GET /routes/:id
Get detailed information about a specific route (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "route_uuid",
    "creator": {
      "id": "user_uuid",
      "name": "John Doe",
      "phone": "+1234567890",
      "rating": 4.8,
      "totalRides": 42
    },
    "vehicle": {
      "model": "Toyota Camry",
      "color": "Silver",
      "plate": "ABC123",
      "capacity": 4
    },
    "polyline": "encoded_polyline_string",
    "startAddress": "123 Main St",
    "endAddress": "456 Oak Ave",
    "departTime": "2024-01-01T10:00:00Z",
    "seatsTotal": 3,
    "seatsLeft": 1,
    "baseFare": 25.00,
    "status": "active",
    "requests": [
      {
        "id": "request_uuid",
        "user": {
          "id": "user_uuid",
          "name": "Jane Smith",
          "rating": 5.0
        },
        "status": "accepted",
        "seats": 2
      }
    ]
  }
}
```

#### POST /routes/:id/join
Join a route as a passenger (requires authentication).

**Request Body:**
```json
{
  "pickupLat": 34.06,
  "pickupLng": -118.26,
  "dropLat": 34.09,
  "dropLng": -118.29,
  "pickupAddress": "789 Pine St",
  "dropAddress": "321 Elm St",
  "seats": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "request_uuid",
    "userId": "user_uuid",
    "routeId": "route_uuid",
    "pickupAddress": "789 Pine St",
    "dropAddress": "321 Elm St",
    "status": "pending",
    "price": 25.00,
    "detourTime": 5,
    "seats": 1
  }
}
```

### Trip Management

#### POST /trips/:id/start
Start a trip (driver only, requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trip_uuid",
    "routeId": "route_uuid",
    "driverId": "user_uuid",
    "startTime": "2024-01-01T10:05:00Z",
    "status": "in_progress"
  }
}
```

#### PUT /trips/:id/location
Update trip location for real-time tracking (driver only).

**Request Body:**
```json
{
  "lat": 34.07,
  "lng": -118.27
}
```

#### POST /trips/:id/complete
Complete a trip (driver only).

**Request Body:**
```json
{
  "totalDistance": 10.8,
  "totalTime": 28
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trip_uuid",
    "endTime": "2024-01-01T10:33:00Z",
    "totalDistance": 10.8,
    "totalTime": 28,
    "status": "completed"
  }
}
```

#### GET /trips/:id
Get trip details (requires authentication).

### WebSocket Events (Real-time Tracking)

Connect to WebSocket at: `ws://localhost:3000` (or production URL)

#### Client → Server Events

**join-trip**: Join a trip room to receive updates
```javascript
socket.emit('join-trip', 'trip_uuid');
```

**leave-trip**: Leave a trip room
```javascript
socket.emit('leave-trip', 'trip_uuid');
```

**location-update**: Driver sends location update
```javascript
socket.emit('location-update', {
  tripId: 'trip_uuid',
  lat: 34.07,
  lng: -118.27
});
```

#### Server → Client Events

**driver-location**: Broadcast driver location to passengers
```javascript
socket.on('driver-location', (data) => {
  // data: { lat, lng, timestamp }
});
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created successfully  
- `400` - Bad request / validation error
- `401` - Unauthorized / missing or invalid token
- `403` - Forbidden / insufficient permissions
- `404` - Resource not found
- `429` - Too many requests (rate limited)
- `500` - Internal server error

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication endpoints: Limited to prevent OTP abuse
- Route searching: 60 requests per minute per user

## Data Models

### User
- **id**: UUID
- **name**: String
- **phone**: String (unique)
- **role**: enum (passenger, driver, both)
- **rating**: Decimal (0-5)
- **totalRides**: Integer

### Vehicle
- **id**: UUID
- **driverId**: UUID (foreign key)
- **capacity**: Integer (1-8)
- **plate**: String (unique)
- **model**: String
- **color**: String

### Route
- **id**: UUID
- **creatorId**: UUID (foreign key)
- **polyline**: Text (encoded polyline)
- **startPoint**: Point (PostGIS geometry)
- **endPoint**: Point (PostGIS geometry)
- **departTime**: DateTime
- **seatsTotal**: Integer
- **seatsLeft**: Integer
- **baseFare**: Decimal
- **status**: enum (active, full, started, completed, cancelled)

### Request
- **id**: UUID
- **userId**: UUID (foreign key)
- **routeId**: UUID (foreign key)
- **pickupPoint**: Point (PostGIS geometry)
- **dropPoint**: Point (PostGIS geometry)
- **status**: enum (pending, accepted, rejected, completed, cancelled)
- **price**: Decimal
- **detourTime**: Integer (minutes)
- **seats**: Integer

### Trip
- **id**: UUID
- **routeId**: UUID (foreign key)
- **driverId**: UUID (foreign key)
- **startTime**: DateTime
- **endTime**: DateTime
- **totalDistance**: Decimal (km)
- **totalTime**: Integer (minutes)
- **status**: enum (scheduled, in_progress, completed, cancelled)
- **currentLocation**: Point (PostGIS geometry)

### Payment
- **id**: UUID
- **userId**: UUID (foreign key)
- **tripId**: UUID (foreign key)
- **amount**: Decimal
- **status**: enum (pending, completed, failed, refunded)
- **method**: enum (cash, card, wallet)
- **timestamp**: DateTime

## Route Matching Algorithm

The AI service evaluates routes based on:

1. **Proximity**: Distance from pickup/dropoff to route path
   - Max pickup radius: 2 km (configurable)
   
2. **Detour Time**: Estimated extra time for pickup
   - Max detour: 15 minutes (configurable)
   - Min extra time: 5 minutes (configurable)

3. **Match Score**: 0-100 rating based on:
   - Distance score: Closer = higher score
   - Detour score: Less detour = higher score
   
4. **Constraints**:
   - Available seats
   - Time window (default: ±2 hours)
   - Route direction compatibility

## Fare Calculation

Fixed fare formula:
```
fare = (distance_km × rate_per_km) + (duration_minutes × rate_per_minute)
fare = max(fare, minimum_fare)
```

Default rates:
- Per kilometer: $1.50
- Per minute: $0.50
- Minimum fare: $5.00

Rates are configurable via environment variables.

## Development

### Environment Variables
```bash
NODE_ENV=development
PORT=3000

# PostgreSQL + PostGIS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=routepool
DB_USER=postgres
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Twilio (OTP)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Mapbox/OSRM
MAPBOX_ACCESS_TOKEN=your-token
OSRM_API_URL=http://router.project-osrm.org

# AI Service
AI_SERVICE_URL=http://localhost:5000
```

### Testing
```bash
npm test              # Run all tests
SKIP_DB=true npm test # Run tests without database
```

### Database Setup
```sql
CREATE DATABASE routepool;
\c routepool
CREATE EXTENSION postgis;
```

The application uses PostgreSQL with PostGIS for geospatial features. Key tables:
- `users` - User accounts and authentication
- `vehicles` - Driver vehicle information
- `routes` - Route offers with geospatial data
- `requests` - Passenger join requests
- `trips` - Active and completed trips
- `payments` - Payment transactions
- `otps` - OTP verification codes

## AI Service Integration

The AI service (Python/Flask) provides:
- Route matching algorithm
- Route optimization via OSRM/Mapbox
- Fare estimation

See `/ai-service/README.md` for details.