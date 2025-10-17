# RoutePool AI Service

Python-based AI service for intelligent route matching, optimization, and fare estimation.

## Features

- **Route Matching**: AI-powered matching of passengers with available routes based on detour constraints
- **Route Optimization**: Generate optimal routes using OSRM or Mapbox
- **Fare Estimation**: Calculate fixed fares based on distance and time

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run the service:
```bash
python app.py
```

The service will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Match Route
```
POST /api/match-route
Content-Type: application/json

{
  "passenger_pickup": {"lat": 34.05, "lng": -118.25},
  "passenger_dropoff": {"lat": 34.10, "lng": -118.30},
  "routes": [
    {
      "id": "route-id",
      "polyline": "encoded-polyline-string",
      "start_point": {"lat": 34.04, "lng": -118.24},
      "end_point": {"lat": 34.11, "lng": -118.31},
      "depart_time": "2024-01-01T10:00:00Z",
      "seats_left": 3
    }
  ]
}
```

### Optimize Route
```
POST /api/optimize-route
Content-Type: application/json

{
  "start_point": {"lat": 34.05, "lng": -118.25},
  "end_point": {"lat": 34.10, "lng": -118.30},
  "waypoints": [
    {"lat": 34.06, "lng": -118.26, "type": "pickup"},
    {"lat": 34.09, "lng": -118.29, "type": "dropoff"}
  ]
}
```

### Estimate Fare
```
POST /api/estimate-fare
Content-Type: application/json

{
  "distance_km": 10.5,
  "duration_minutes": 25,
  "pickup_point": {"lat": 34.05, "lng": -118.25},
  "dropoff_point": {"lat": 34.10, "lng": -118.30}
}
```

## Configuration

Environment variables:

- `FLASK_ENV`: development or production
- `PORT`: Service port (default: 5000)
- `OSRM_API_URL`: OSRM routing service URL
- `MAPBOX_ACCESS_TOKEN`: Mapbox API token (optional)
- `MAX_DETOUR_MINUTES`: Maximum detour time allowed (default: 15)
- `MIN_EXTRA_TIME_MINUTES`: Minimum extra time (default: 5)
- `MAX_PICKUP_RADIUS_KM`: Maximum pickup radius (default: 2)
- `BASE_FARE_PER_KM`: Base fare per kilometer (default: 1.5)
- `BASE_FARE_PER_MINUTE`: Base fare per minute (default: 0.5)
- `MINIMUM_FARE`: Minimum fare (default: 5.0)

## Algorithms

### Route Matching

The route matching algorithm evaluates each available route based on:

1. **Proximity**: Distance from pickup/dropoff points to route
2. **Detour Time**: Estimated extra time required
3. **Constraints**: MAX_DETOUR_MINUTES and MAX_PICKUP_RADIUS_KM

Match score (0-100) considers:
- Distance score: closer = higher score
- Detour score: less detour = higher score

### Route Optimization

Uses OSRM (default) or Mapbox Directions API to:
1. Calculate optimal path through multiple waypoints
2. Minimize total distance and time
3. Return encoded polyline for visualization

### Fare Estimation

Fixed fare calculation:
```
fare = (distance_km × rate_per_km) + (duration_minutes × rate_per_minute)
fare = max(fare, minimum_fare)
```

Supports dynamic surge pricing based on demand.

## Testing

```bash
# Test the service
curl http://localhost:5000/health

# Test route matching
curl -X POST http://localhost:5000/api/match-route \
  -H "Content-Type: application/json" \
  -d '{"passenger_pickup": {"lat": 34.05, "lng": -118.25}, ...}'
```

## Integration

The AI service integrates with the main Node.js backend:

1. Backend calls AI service for route matching
2. AI service returns matched routes with scores
3. Backend presents options to user
4. User selects route and joins

See main README for complete architecture.
