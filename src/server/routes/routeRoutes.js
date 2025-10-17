const express = require('express');
const router = express.Router();
const { 
  createRoute, 
  findNearbyRoutes, 
  joinRoute, 
  getRouteDetails 
} = require('../services/routeService');
const { authenticateToken } = require('../middleware/authMiddleware');

// Create new route offer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const route = await createRoute(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create route'
    });
  }
});

// Get nearby routes
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    const { 
      startLat, 
      startLng, 
      endLat, 
      endLng, 
      timeWindow, 
      departTime 
    } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        success: false,
        message: 'Start and end coordinates are required'
      });
    }

    const routes = await findNearbyRoutes({
      startLat: parseFloat(startLat),
      startLng: parseFloat(startLng),
      endLat: parseFloat(endLat),
      endLng: parseFloat(endLng),
      timeWindowMinutes: timeWindow ? parseInt(timeWindow) : 120,
      departTime
    });

    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to find nearby routes'
    });
  }
});

// Get route details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const route = await getRouteDetails(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get route details'
    });
  }
});

// Join a route
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const request = await joinRoute(req.params.id, req.user.userId, req.body);
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to join route'
    });
  }
});

module.exports = router;
