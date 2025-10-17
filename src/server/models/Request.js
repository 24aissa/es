const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  routeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'routes',
      key: 'id'
    }
  },
  pickupPoint: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
  },
  dropPoint: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
  },
  pickupAddress: {
    type: DataTypes.STRING(255)
  },
  dropAddress: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  detourTime: {
    type: DataTypes.INTEGER,
    comment: 'Extra time in minutes due to detour'
  },
  seats: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 8
    }
  }
}, {
  tableName: 'requests',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['route_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Request;
