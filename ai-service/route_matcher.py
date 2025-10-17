import polyline
from geopy.distance import geodesic
import os

class RouteMatcher:
    """
    AI-powered route matching service that matches passengers with routes
    based on detour constraints and proximity
    """
    
    def __init__(self):
        # Configuration from environment or defaults
        self.max_detour_minutes = int(os.getenv('MAX_DETOUR_MINUTES', 15))
        self.min_extra_time_minutes = int(os.getenv('MIN_EXTRA_TIME_MINUTES', 5))
        self.max_pickup_radius_km = float(os.getenv('MAX_PICKUP_RADIUS_KM', 2))
    
    def match_routes(self, passenger_pickup, passenger_dropoff, routes):
        """
        Match passenger request with available routes
        
        Args:
            passenger_pickup: dict with 'lat' and 'lng'
            passenger_dropoff: dict with 'lat' and 'lng'
            routes: list of route objects
            
        Returns:
            list of matched routes with match score and detour info
        """
        matched_routes = []
        
        for route in routes:
            match_result = self._evaluate_route_match(
                passenger_pickup,
                passenger_dropoff,
                route
            )
            
            if match_result['is_match']:
                matched_routes.append({
                    'route_id': route['id'],
                    'match_score': match_result['score'],
                    'estimated_detour_minutes': match_result['detour_minutes'],
                    'pickup_distance_km': match_result['pickup_distance'],
                    'dropoff_distance_km': match_result['dropoff_distance'],
                    'reason': match_result['reason']
                })
        
        # Sort by match score (descending)
        matched_routes.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matched_routes
    
    def _evaluate_route_match(self, pickup, dropoff, route):
        """
        Evaluate if a route is a good match for the passenger
        
        Returns dict with:
            - is_match: bool
            - score: float (0-100)
            - detour_minutes: estimated detour time
            - pickup_distance: distance from route to pickup
            - dropoff_distance: distance from route to dropoff
            - reason: explanation
        """
        result = {
            'is_match': False,
            'score': 0,
            'detour_minutes': 0,
            'pickup_distance': 0,
            'dropoff_distance': 0,
            'reason': ''
        }
        
        # Decode route polyline
        try:
            route_points = polyline.decode(route['polyline'])
        except:
            result['reason'] = 'Invalid polyline'
            return result
        
        # Find closest point on route to pickup
        pickup_coords = (pickup['lat'], pickup['lng'])
        dropoff_coords = (dropoff['lat'], dropoff['lng'])
        
        # Calculate minimum distance from pickup to route
        min_pickup_distance = min(
            geodesic(pickup_coords, point).km 
            for point in route_points
        )
        
        # Calculate minimum distance from dropoff to route
        min_dropoff_distance = min(
            geodesic(dropoff_coords, point).km 
            for point in route_points
        )
        
        result['pickup_distance'] = round(min_pickup_distance, 2)
        result['dropoff_distance'] = round(min_dropoff_distance, 2)
        
        # Check if within acceptable radius
        if min_pickup_distance > self.max_pickup_radius_km:
            result['reason'] = f'Pickup too far from route ({min_pickup_distance:.2f} km)'
            return result
        
        if min_dropoff_distance > self.max_pickup_radius_km:
            result['reason'] = f'Dropoff too far from route ({min_dropoff_distance:.2f} km)'
            return result
        
        # Estimate detour time (simplified calculation)
        # In production, would use actual routing API
        detour_minutes = self._estimate_detour_time(
            min_pickup_distance,
            min_dropoff_distance
        )
        
        result['detour_minutes'] = detour_minutes
        
        # Check detour constraints
        if detour_minutes > self.max_detour_minutes:
            result['reason'] = f'Detour too long ({detour_minutes} minutes)'
            return result
        
        # Calculate match score (0-100)
        # Lower distance = higher score
        # Lower detour = higher score
        distance_score = max(0, 100 - (min_pickup_distance + min_dropoff_distance) * 25)
        detour_score = max(0, 100 - (detour_minutes / self.max_detour_minutes) * 100)
        
        result['score'] = round((distance_score + detour_score) / 2, 2)
        result['is_match'] = True
        result['reason'] = 'Good match'
        
        return result
    
    def _estimate_detour_time(self, pickup_distance, dropoff_distance):
        """
        Estimate detour time based on distances
        Simplified calculation - in production would use routing API
        
        Assumes average speed of 40 km/h in city
        """
        avg_speed_kmh = 40
        total_detour_km = pickup_distance + dropoff_distance
        detour_minutes = (total_detour_km / avg_speed_kmh) * 60
        
        # Add some buffer for stops
        detour_minutes += 5  # 5 minutes for stops
        
        return round(detour_minutes)
