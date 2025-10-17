const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();

// PostgreSQL pool setup
const pool = new Pool({
  user: 'your_username', // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'your_database', // Replace with your database name
  password: 'your_password', // Replace with your PostgreSQL password
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
  },
  apis: ['./**/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
