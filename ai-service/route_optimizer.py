import requests
import os
from geopy.distance import geodesic
import polyline as polyline_lib

class RouteOptimizer:
    """
    Route optimization service using OSRM or Mapbox
    Generates optimal routes with multiple waypoints
    """
    
    def __init__(self):
        self.osrm_api_url = os.getenv('OSRM_API_URL', 'http://router.project-osrm.org')
        self.mapbox_token = os.getenv('MAPBOX_ACCESS_TOKEN', '')
        self.use_mapbox = bool(self.mapbox_token)
    
    def optimize(self, start_point, end_point, waypoints):
        """
        Optimize route with multiple pickup/dropoff points
        
        Args:
            start_point: dict with 'lat' and 'lng'
            end_point: dict with 'lat' and 'lng'
            waypoints: list of dicts with 'lat', 'lng', and 'type'
            
        Returns:
            dict with optimized route information
        """
        if self.use_mapbox:
            return self._optimize_with_mapbox(start_point, end_point, waypoints)
        else:
            return self._optimize_with_osrm(start_point, end_point, waypoints)
    
    def _optimize_with_osrm(self, start_point, end_point, waypoints):
        """
        Use OSRM to optimize route
        """
        # Build coordinates string
        coords = [(start_point['lng'], start_point['lat'])]
        
        for wp in waypoints:
            coords.append((wp['lng'], wp['lat']))
        
        coords.append((end_point['lng'], end_point['lat']))
        
        coords_str = ';'.join([f"{lng},{lat}" for lng, lat in coords])
        
        # Call OSRM API
        url = f"{self.osrm_api_url}/route/v1/driving/{coords_str}"
        params = {
            'overview': 'full',
            'geometries': 'polyline'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('code') == 'Ok' and data.get('routes'):
                route = data['routes'][0]
                
                return {
                    'polyline': route['geometry'],
                    'distance_km': round(route['distance'] / 1000, 2),
                    'duration_minutes': round(route['duration'] / 60, 2),
                    'waypoints_order': list(range(len(coords))),
                    'source': 'OSRM'
                }
            else:
                raise Exception('No route found')
                
        except Exception as e:
            # Fallback to simple direct route
            return self._fallback_route(start_point, end_point, waypoints)
    
    def _optimize_with_mapbox(self, start_point, end_point, waypoints):
        """
        Use Mapbox to optimize route
        """
        # Build coordinates string
        coords = [(start_point['lng'], start_point['lat'])]
        
        for wp in waypoints:
            coords.append((wp['lng'], wp['lat']))
        
        coords.append((end_point['lng'], end_point['lat']))
        
        coords_str = ';'.join([f"{lng},{lat}" for lng, lat in coords])
        
        # Call Mapbox API
        url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{coords_str}"
        params = {
            'access_token': self.mapbox_token,
            'geometries': 'polyline',
            'overview': 'full'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('routes'):
                route = data['routes'][0]
                
                return {
                    'polyline': route['geometry'],
                    'distance_km': round(route['distance'] / 1000, 2),
                    'duration_minutes': round(route['duration'] / 60, 2),
                    'waypoints_order': list(range(len(coords))),
                    'source': 'Mapbox'
                }
            else:
                raise Exception('No route found')
                
        except Exception as e:
            # Fallback to simple direct route
            return self._fallback_route(start_point, end_point, waypoints)
    
    def _fallback_route(self, start_point, end_point, waypoints):
        """
        Fallback when routing API is unavailable
        Returns a simple straight-line approximation
        """
        # Calculate direct distance
        distance_km = geodesic(
            (start_point['lat'], start_point['lng']),
            (end_point['lat'], end_point['lng'])
        ).km
        
        # Estimate duration (assuming 40 km/h average)
        duration_minutes = (distance_km / 40) * 60
        
        # Create simple polyline (just start and end)
        simple_coords = [
            (start_point['lat'], start_point['lng']),
            (end_point['lat'], end_point['lng'])
        ]
        simple_polyline = polyline_lib.encode(simple_coords)
        
        return {
            'polyline': simple_polyline,
            'distance_km': round(distance_km, 2),
            'duration_minutes': round(duration_minutes, 2),
            'waypoints_order': [0, len(waypoints) + 1],
            'source': 'Fallback'
        }
    
    def generate_route(self, start_lat, start_lng, end_lat, end_lng):
        """
        Generate a simple route between two points
        """
        return self.optimize(
            {'lat': start_lat, 'lng': start_lng},
            {'lat': end_lat, 'lng': end_lng},
            []
        )
