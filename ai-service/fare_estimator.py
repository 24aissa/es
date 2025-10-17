import os

class FareEstimator:
    """
    Fixed fare estimation based on distance and time
    """
    
    def __init__(self):
        # Pricing configuration from environment or defaults
        self.base_fare_per_km = float(os.getenv('BASE_FARE_PER_KM', 1.5))
        self.base_fare_per_minute = float(os.getenv('BASE_FARE_PER_MINUTE', 0.5))
        self.minimum_fare = float(os.getenv('MINIMUM_FARE', 5.0))
        self.surge_multiplier = 1.0  # Can be dynamic based on demand
    
    def calculate_fare(self, distance_km, duration_minutes):
        """
        Calculate fixed fare based on distance and time
        
        Args:
            distance_km: float
            duration_minutes: float
            
        Returns:
            dict with fare breakdown
        """
        # Base fare calculation
        distance_cost = distance_km * self.base_fare_per_km
        time_cost = duration_minutes * self.base_fare_per_minute
        
        base_fare = distance_cost + time_cost
        
        # Apply surge multiplier if needed
        adjusted_fare = base_fare * self.surge_multiplier
        
        # Apply minimum fare
        final_fare = max(adjusted_fare, self.minimum_fare)
        
        return {
            'total': round(final_fare, 2),
            'base_fare': round(base_fare, 2),
            'distance_cost': round(distance_cost, 2),
            'time_cost': round(time_cost, 2),
            'surge_multiplier': self.surge_multiplier,
            'minimum_fare': self.minimum_fare,
            'breakdown': {
                'distance_km': distance_km,
                'duration_minutes': duration_minutes,
                'rate_per_km': self.base_fare_per_km,
                'rate_per_minute': self.base_fare_per_minute
            }
        }
    
    def estimate_fare_for_route(self, route_data):
        """
        Estimate fare for a complete route
        
        Args:
            route_data: dict with 'distance_km' and 'duration_minutes'
            
        Returns:
            dict with fare information
        """
        return self.calculate_fare(
            route_data['distance_km'],
            route_data['duration_minutes']
        )
    
    def apply_surge_pricing(self, demand_factor):
        """
        Apply dynamic surge pricing based on demand
        
        Args:
            demand_factor: float (1.0 = normal, >1.0 = high demand)
        """
        self.surge_multiplier = max(1.0, min(demand_factor, 3.0))  # Cap at 3x
