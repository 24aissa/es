const express = require('express');
const router = express.Router();
const { Trip, Route, User } = require('../models');
const { authenticateToken } = require('../middleware/authMiddleware');

// Start a trip
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the route
    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Verify the user is the route creator/driver
    if (route.creatorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can start the trip'
      });
    }

    // Check if trip already exists
    const existingTrip = await Trip.findOne({
      where: { routeId: id }
    });

    if (existingTrip) {
      return res.status(400).json({
        success: false,
        message: 'Trip already started'
      });
    }

    // Create trip
    const trip = await Trip.create({
      routeId: id,
      driverId: req.user.userId,
      startTime: new Date(),
      status: 'in_progress'
    });

    // Update route status
    await route.update({ status: 'started' });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start trip'
    });
  }
});

// Update trip location (for real-time tracking)
router.put('/:id/location', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Verify the user is the driver
    if (trip.driverId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can update trip location'
      });
    }

    await trip.update({
      currentLocation: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update location'
    });
  }
});

// Complete a trip
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { totalDistance, totalTime } = req.body;

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Verify the user is the driver
    if (trip.driverId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can complete the trip'
      });
    }

    await trip.update({
      endTime: new Date(),
      totalDistance,
      totalTime,
      status: 'completed'
    });

    // Update route status
    const route = await Route.findByPk(trip.routeId);
    await route.update({ status: 'completed' });

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete trip'
    });
  }
});

// Get trip details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        {
          model: Route,
          as: 'route'
        },
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'phone', 'rating']
        }
      ]
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get trip details'
    });
  }
});

module.exports = router;
