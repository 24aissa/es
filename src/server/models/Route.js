const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  polyline: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Encoded polyline string representing the route path'
  },
  startPoint: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
  },
  endPoint: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
  },
  startAddress: {
    type: DataTypes.STRING(255)
  },
  endAddress: {
    type: DataTypes.STRING(255)
  },
  departTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  seatsTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  seatsLeft: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 8
    }
  },
  baseFare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  estimatedDistance: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Distance in kilometers'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER,
    comment: 'Duration in minutes'
  },
  status: {
    type: DataTypes.ENUM('active', 'full', 'started', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  vehicleId: {
    type: DataTypes.UUID,
    references: {
      model: 'vehicles',
      key: 'id'
    }
  }
}, {
  tableName: 'routes',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      type: 'SPATIAL',
      fields: ['start_point']
    },
    {
      type: 'SPATIAL',
      fields: ['end_point']
    },
    {
      fields: ['depart_time']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Route;
