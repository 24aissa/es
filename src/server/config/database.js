const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'routepool',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    // Skip database connection in demo environment
    if (process.env.SKIP_DB === 'true') {
      console.log('📦 Database connection skipped for demo');
      return;
    }

    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'routepool'}`);
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('📋 Database models synced');
    }

    // Set up connection event listeners
    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('🔒 PostgreSQL connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('🚀 Continuing without database for development...');
    }
  }
};

module.exports = { sequelize, connectDB };