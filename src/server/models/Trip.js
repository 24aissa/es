const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  routeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'routes',
      key: 'id'
    }
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE
  },
  endTime: {
    type: DataTypes.DATE
  },
  totalDistance: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Total distance traveled in kilometers'
  },
  totalTime: {
    type: DataTypes.INTEGER,
    comment: 'Total time in minutes'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  currentLocation: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  }
}, {
  tableName: 'trips',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['route_id']
    },
    {
      fields: ['driver_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Trip;
