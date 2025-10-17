# RoutePool - تجميع الرحلات

A smart ridesharing application that connects passengers traveling the same route via AI-powered route matching, with fixed pricing and real-time tracking.

## Overview

RoutePool is a comprehensive carpooling platform that uses artificial intelligence to match passengers traveling similar routes. The app enables drivers to offer routes and passengers to join rides, optimizing travel efficiency while maintaining fixed, transparent pricing.

## Features

### Core Features (MVP 0.1)
- **OTP Authentication**: Secure login via SMS verification
- **Route Offer Creation**: Drivers can create and share their routes
- **AI-Powered Route Matching**: Intelligent matching of passengers with similar routes
- **Nearby Routes Discovery**: Find and join routes close to your path
- **Real-Time Trip Tracking**: Live location tracking during trips
- **Fixed Price Payment**: Transparent, predictable pricing based on distance and time

### AI Modules
- **Route Generation**: Shortest path calculation using Mapbox/OSRM
- **Route Matching**: Smart passenger-route matching based on detour limits (MAX_DETOUR, MIN_EXTRA_TIME)
- **Fare Estimation**: Fixed fare calculation based on distance and time within main route

### User Roles
- **Passenger**: Request rides and join existing routes
- **Driver**: Offer routes and manage trips
- **Both**: Users can switch between passenger and driver modes

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with PostGIS for geospatial data
- **Sequelize** ORM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Twilio** for OTP SMS
- **bcryptjs** for password hashing
- **Helmet** for security
- **Rate limiting** for API protection

### AI Service (Python)
- **Flask** for AI service API
- **Route Optimization** algorithms
- **Mapbox/OSRM** integration for routing

### Mobile (Planned)
- **React Native** for iOS and Android
- Cross-platform development
- Native performance

### External Services
- **Mapbox API**: Route generation and geocoding
- **OSRM**: Open-source routing machine
- **Twilio**: SMS for OTP verification
- **Redis**: Real-time data caching

### Security Features
- OTP-based authentication
- JWT token management
- Rate limiting and request validation
- Secure WebSocket connections
- Data encryption in transit

## Project Structure

```
src/
├── server/                 # Backend API
│   ├── models/            # Database models (User, Vehicle, Route, Request, Trip, Payment)
│   ├── routes/            # API routes (auth, routes, trips)
│   ├── middleware/        # Custom middleware (auth, rate limiting)
│   ├── services/          # Business logic (OTP, route matching, fare calculation)
│   ├── config/            # Configuration files (database)
│   └── utils/             # Utility functions
├── client/                # Frontend React Native app (planned)
│   └── src/
│       ├── components/    # Reusable components
│       ├── screens/       # Screen components
│       ├── navigation/    # Navigation setup
│       └── services/      # API services
├── ai-service/            # Python AI service (planned)
│   ├── route_matcher.py   # Route matching algorithm
│   ├── fare_estimator.py  # Fare estimation
│   └── route_optimizer.py # Route optimization
├── tests/                 # Test files
└── docs/                  # Documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher) with PostGIS extension
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd es
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL with PostGIS**
   ```sql
   CREATE DATABASE routepool;
   \c routepool
   CREATE EXTENSION postgis;
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the application**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

### Environment Variables

Key environment variables to configure:

```env
NODE_ENV=development
PORT=3000

# PostgreSQL + PostGIS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=routepool
DB_USER=postgres
DB_PASSWORD=your-db-password

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Twilio for OTP
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Mapbox/OSRM
MAPBOX_ACCESS_TOKEN=your-mapbox-token
OSRM_API_URL=http://router.project-osrm.org

# Route Matching Config
MAX_DETOUR_MINUTES=15
MIN_EXTRA_TIME_MINUTES=5
MAX_PICKUP_RADIUS_KM=2
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/otp` - Request OTP code via SMS
- `POST /api/auth/verify` - Verify OTP and login/register user

### Route Management
- `POST /api/routes` - Create new route offer (requires auth)
- `GET /api/routes/nearby` - Find nearby routes (requires auth)
  - Query params: `startLat`, `startLng`, `endLat`, `endLng`, `timeWindow`, `departTime`
- `GET /api/routes/:id` - Get route details (requires auth)
- `POST /api/routes/:id/join` - Join a route as passenger (requires auth)

### Trip Management
- `POST /api/trips/:id/start` - Start a trip (driver only)
- `PUT /api/trips/:id/location` - Update trip location (driver only)
- `POST /api/trips/:id/complete` - Complete a trip (driver only)
- `GET /api/trips/:id` - Get trip details

### WebSocket Events (Real-time Tracking)
- `join-trip` - Join trip room for updates
- `leave-trip` - Leave trip room
- `location-update` - Driver sends location update
- `driver-location` - Broadcast driver location to passengers

## Key Performance Indicators (KPIs)

The application tracks the following metrics:

1. **Seat Utilization Rate**: Percentage of available seats filled
2. **Average Detour Time**: Average extra time in minutes for pickups
3. **Conversion Rate**: Offer-to-join conversion (passengers joining offered routes)
4. **User Retention Rate**: Percentage of users who continue using the service

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Deployment

The application is designed to be deployed on cloud platforms like:
- Google Cloud Platform
- Amazon Web Services
- Microsoft Azure

Key deployment considerations:
- PostgreSQL with PostGIS (cloud-hosted or managed service)
- Redis for real-time data caching
- Environment-specific configuration
- SSL/TLS certificates for HTTPS
- WebSocket support for real-time tracking
- Load balancing for high availability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Development Roadmap

### Phase 1: Backend Infrastructure ✅
- [x] Database models (PostgreSQL + PostGIS)
- [x] OTP authentication system
- [x] Route offer API
- [x] Nearby routes query API
- [x] Route joining functionality
- [x] Trip management APIs
- [x] WebSocket real-time tracking

### Phase 2: AI Service (In Progress)
- [ ] Python/Flask AI service setup
- [ ] Route matching algorithm (MAX_DETOUR, MIN_EXTRA_TIME)
- [ ] Mapbox/OSRM integration for route generation
- [ ] Fare estimation based on distance and time

### Phase 3: Mobile App
- [ ] React Native setup
- [ ] User authentication screens
- [ ] Route creation UI
- [ ] Route search and join UI
- [ ] Real-time trip tracking
- [ ] Payment integration

### Phase 4: Testing & QA
- [ ] Unit tests
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Load testing
- [ ] Security audit

## Support

For support and questions:
- Email: support@routepool.app
- Documentation: [Link to docs]
- Issue tracker: [GitHub issues]

---

**تطبيق ذكي يربط ركاب يسافرون في نفس المسار عبر الذكاء الاصطناعي**