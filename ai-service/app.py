from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

from route_matcher import RouteMatcher
from route_optimizer import RouteOptimizer
from fare_estimator import FareEstimator

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize services
route_matcher = RouteMatcher()
route_optimizer = RouteOptimizer()
fare_estimator = FareEstimator()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'RoutePool AI Service',
        'version': '0.1.0'
    })

@app.route('/api/match-route', methods=['POST'])
def match_route():
    """
    Match a passenger request with available routes
    
    Request body:
    {
        "passenger_pickup": {"lat": float, "lng": float},
        "passenger_dropoff": {"lat": float, "lng": float},
        "routes": [
            {
                "id": str,
                "polyline": str,
                "start_point": {"lat": float, "lng": float},
                "end_point": {"lat": float, "lng": float},
                "depart_time": str,
                "seats_left": int
            }
        ]
    }
    """
    try:
        data = request.json
        
        passenger_pickup = data.get('passenger_pickup')
        passenger_dropoff = data.get('passenger_dropoff')
        routes = data.get('routes', [])
        
        if not passenger_pickup or not passenger_dropoff:
            return jsonify({'error': 'Missing passenger pickup or dropoff location'}), 400
        
        # Match routes
        matched_routes = route_matcher.match_routes(
            passenger_pickup,
            passenger_dropoff,
            routes
        )
        
        return jsonify({
            'success': True,
            'matched_routes': matched_routes
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/optimize-route', methods=['POST'])
def optimize_route():
    """
    Optimize a route with multiple pickup/dropoff points
    
    Request body:
    {
        "start_point": {"lat": float, "lng": float},
        "end_point": {"lat": float, "lng": float},
        "waypoints": [
            {"lat": float, "lng": float, "type": "pickup|dropoff"}
        ]
    }
    """
    try:
        data = request.json
        
        start_point = data.get('start_point')
        end_point = data.get('end_point')
        waypoints = data.get('waypoints', [])
        
        if not start_point or not end_point:
            return jsonify({'error': 'Missing start or end point'}), 400
        
        # Optimize route
        optimized = route_optimizer.optimize(start_point, end_point, waypoints)
        
        return jsonify({
            'success': True,
            'optimized_route': optimized
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/estimate-fare', methods=['POST'])
def estimate_fare():
    """
    Estimate fare for a route
    
    Request body:
    {
        "distance_km": float,
        "duration_minutes": float,
        "pickup_point": {"lat": float, "lng": float},
        "dropoff_point": {"lat": float, "lng": float}
    }
    """
    try:
        data = request.json
        
        distance_km = data.get('distance_km')
        duration_minutes = data.get('duration_minutes')
        
        if distance_km is None or duration_minutes is None:
            return jsonify({'error': 'Missing distance or duration'}), 400
        
        # Estimate fare
        fare = fare_estimator.calculate_fare(distance_km, duration_minutes)
        
        return jsonify({
            'success': True,
            'fare': fare
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')
