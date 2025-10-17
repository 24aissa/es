const { Route, Request, User, Vehicle } = require('../models');
const { Op } = require('sequelize');
const geolib = require('geolib');

// Calculate fare based on distance and time
const calculateFare = (distanceKm, durationMinutes) => {
  const baseFarePerKm = parseFloat(process.env.BASE_FARE_PER_KM || 1.5);
  const baseFarePerMinute = parseFloat(process.env.BASE_FARE_PER_MINUTE || 0.5);
  const minimumFare = parseFloat(process.env.MINIMUM_FARE || 5.0);

  const fare = (distanceKm * baseFarePerKm) + (durationMinutes * baseFarePerMinute);
  return Math.max(fare, minimumFare).toFixed(2);
};

// Create a new route offer
const createRoute = async (routeData, userId) => {
  const { 
    startLat, 
    startLng, 
    endLat, 
    endLng,
    startAddress,
    endAddress,
    departTime,
    seatsTotal,
    vehicleId,
    polylineString,
    estimatedDistance,
    estimatedDuration
  } = routeData;

  // Calculate base fare
  const baseFare = calculateFare(estimatedDistance, estimatedDuration);

  // Create route
  const route = await Route.create({
    creatorId: userId,
    polyline: polylineString,
    startPoint: {
      type: 'Point',
      coordinates: [startLng, startLat]
    },
    endPoint: {
      type: 'Point',
      coordinates: [endLng, endLat]
    },
    startAddress,
    endAddress,
    departTime: new Date(departTime),
    seatsTotal,
    seatsLeft: seatsTotal,
    baseFare,
    estimatedDistance,
    estimatedDuration,
    vehicleId,
    status: 'active'
  });

  return route;
};

// Find nearby routes
const findNearbyRoutes = async (params) => {
  const {
    startLat,
    startLng,
    endLat,
    endLng,
    timeWindowMinutes = 120, // 2 hours
    maxDistanceKm = 2, // 2km radius
    departTime
  } = params;

  // Calculate time window
  const requestTime = departTime ? new Date(departTime) : new Date();
  const timeWindowStart = new Date(requestTime.getTime() - (timeWindowMinutes * 60000));
  const timeWindowEnd = new Date(requestTime.getTime() + (timeWindowMinutes * 60000));

  // Find routes in time window with available seats
  const routes = await Route.findAll({
    where: {
      status: 'active',
      seatsLeft: { [Op.gt]: 0 },
      departTime: {
        [Op.between]: [timeWindowStart, timeWindowEnd]
      }
    },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'rating', 'totalRides']
      },
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'model', 'color', 'plate']
      }
    ],
    order: [['departTime', 'ASC']]
  });

  // Filter routes by geographic proximity
  const nearbyRoutes = routes.filter(route => {
    const startPoint = route.startPoint.coordinates;
    const endPoint = route.endPoint.coordinates;

    const startDistance = geolib.getDistance(
      { latitude: startLat, longitude: startLng },
      { latitude: startPoint[1], longitude: startPoint[0] }
    ) / 1000; // Convert to km

    const endDistance = geolib.getDistance(
      { latitude: endLat, longitude: endLng },
      { latitude: endPoint[1], longitude: endPoint[0] }
    ) / 1000; // Convert to km

    return startDistance <= maxDistanceKm && endDistance <= maxDistanceKm;
  });

  return nearbyRoutes;
};

// Join a route
const joinRoute = async (routeId, userId, requestData) => {
  const {
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    pickupAddress,
    dropAddress,
    seats = 1
  } = requestData;

  // Find route
  const route = await Route.findByPk(routeId);
  if (!route) {
    throw new Error('Route not found');
  }

  // Check availability
  if (route.seatsLeft < seats) {
    throw new Error('Not enough seats available');
  }

  if (route.status !== 'active') {
    throw new Error('Route is not available');
  }

  // Calculate price and detour (simplified)
  const detourTime = 5; // TODO: Calculate actual detour using routing API
  const price = route.baseFare;

  // Create request
  const request = await Request.create({
    userId,
    routeId,
    pickupPoint: {
      type: 'Point',
      coordinates: [pickupLng, pickupLat]
    },
    dropPoint: {
      type: 'Point',
      coordinates: [dropLng, dropLat]
    },
    pickupAddress,
    dropAddress,
    status: 'pending',
    price,
    detourTime,
    seats
  });

  // Update route seats
  await route.update({
    seatsLeft: route.seatsLeft - seats,
    status: route.seatsLeft - seats === 0 ? 'full' : 'active'
  });

  return request;
};

// Get route details
const getRouteDetails = async (routeId) => {
  const route = await Route.findByPk(routeId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'phone', 'rating', 'totalRides']
      },
      {
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'model', 'color', 'plate', 'capacity']
      },
      {
        model: Request,
        as: 'requests',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'rating']
          }
        ]
      }
    ]
  });

  return route;
};

module.exports = {
  createRoute,
  findNearbyRoutes,
  joinRoute,
  getRouteDetails,
  calculateFare
};
