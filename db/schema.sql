-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- User enums
CREATE TYPE user_role AS ENUM ('admin', 'driver', 'passenger');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    start_location GEOGRAPHY(POINT, 4326) NOT NULL,
    end_location GEOGRAPHY(POINT, 4326) NOT NULL,
    distance FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests table
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    route_id INT REFERENCES routes(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES requests(id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    trip_id INT REFERENCES trips(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_routes_start_location ON routes USING GIST (start_location);
CREATE INDEX idx_routes_end_location ON routes USING GIST (end_location);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_trips_request_id ON trips(request_id);
CREATE INDEX idx_payments_trip_id ON payments(trip_id);