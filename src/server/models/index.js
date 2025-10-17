const User = require('./RoutePoolUser');
const Vehicle = require('./Vehicle');
const Route = require('./Route');
const Request = require('./Request');
const Trip = require('./Trip');
const Payment = require('./Payment');
const OTP = require('./OTP');

// Define associations
User.hasMany(Vehicle, { foreignKey: 'driverId', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

User.hasMany(Route, { foreignKey: 'creatorId', as: 'routes' });
Route.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Route.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Vehicle.hasMany(Route, { foreignKey: 'vehicleId', as: 'routes' });

User.hasMany(Request, { foreignKey: 'userId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Route.hasMany(Request, { foreignKey: 'routeId', as: 'requests' });
Request.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

Route.hasOne(Trip, { foreignKey: 'routeId', as: 'trip' });
Trip.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

User.hasMany(Trip, { foreignKey: 'driverId', as: 'trips' });
Trip.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Trip.hasMany(Payment, { foreignKey: 'tripId', as: 'payments' });
Payment.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

module.exports = {
  User,
  Vehicle,
  Route,
  Request,
  Trip,
  Payment,
  OTP
};
