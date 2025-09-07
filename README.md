# BabyVibe - بيبي فايب

A multi-platform application for parents to track child growth and suggest appropriate products based on age, designed specifically for the Algerian market.

## Overview

BabyVibe is a comprehensive child growth tracking and product recommendation system that supports Arabic, French, and Algerian dialect. It provides smart notifications, shopping integration, and delivery services across Algeria.

## Features

### Core Features
- **Child Registration & Tracking**: Register children with name, birth date, and gender
- **Age-Based Product Recommendations**: Automatic suggestions based on child's age
- **Size Alerts**: Smart notifications every 6 months for size updates
- **Multi-Language Support**: Arabic, French, and Algerian dialect
- **Order History**: Complete record of user purchases
- **Delivery Integration**: Support for local Algerian delivery providers

### Product Categories
- Clothing (by size and season)
- Toys (developmental, interactive, safe)
- Feeding & Nutrition (bottles, utensils, high chairs)
- Care & Hygiene (diapers, shampoo, wipes, bath supplies)
- Furniture & Nursery (beds, tables, cabinets)
- Gifts & Occasions (birthday setups, gift sets)
- Special Offers (periodic discounts)
- Seasonal Products (summer/winter items)

### Delivery Service (Algeria)
- Ships to all Algerian provinces
- 2-5 business days delivery
- In-app shipment tracking
- Support for DZExpress, JetX, Express Ems, Yalidine

### Worker & Services System
- Special worker accounts for order management
- Permission-based access system
- Real-time notifications for new orders
- Worker dashboard with maps and performance tracking
- Supervisor monitoring capabilities

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **i18next** for internationalization
- **bcryptjs** for password hashing
- **Helmet** for security
- **Rate limiting** for API protection

### Frontend
- **React** 18 with functional components
- **React Router** for navigation
- **Styled Components** for styling
- **React i18next** for translations
- **Axios** for API calls
- **Arabic font support** (Cairo font)

### Security Features
- Data encryption at rest and in transit
- OAuth 2.0 authentication support
- RBAC (Role-Based Access Control)
- Rate limiting and WAF protection
- Secure file upload handling
- Privacy-compliant data handling

## Project Structure

```
src/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── controllers/       # Route controllers
│   ├── services/          # Business logic
│   ├── config/            # Configuration files
│   └── utils/             # Utility functions
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # Global styles
│   │   └── i18n/          # Translation files
│   └── public/            # Static files
├── shared/                # Shared utilities and types
├── locales/               # Server-side translations
├── tests/                 # Test files
└── docs/                  # Documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd es
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   Make sure MongoDB is running locally or update the connection string in `.env`

5. **Run the application**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm run build
   npm start
   ```

### Environment Variables

Key environment variables to configure:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/babyvibe
JWT_SECRET=your-secret-key
DEFAULT_LANGUAGE=ar

# Email configuration for notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Delivery service API keys
DZEXPRESS_API_KEY=your-api-key
JETX_API_KEY=your-api-key
EXPRESS_EMS_API_KEY=your-api-key
YALIDINE_API_KEY=your-api-key
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Children Management
- `GET /api/children` - Get user's children
- `POST /api/children` - Add new child
- `PUT /api/children/:id` - Update child info
- `DELETE /api/children/:id` - Remove child (soft delete)
- `GET /api/children/:id/recommendations` - Get age-appropriate products

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products/:id/reviews` - Add product review
- `GET /api/products/categories/list` - Get product categories

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/addresses` - Add address
- `DELETE /api/users/addresses/:id` - Remove address

## Multi-Language Support

The application supports three languages:

1. **Arabic (ar)** - Default language with RTL support
2. **French (fr)** - Full French localization
3. **Algerian Dialect (dz)** - Local dialect for familiar user experience

Language can be selected during onboarding or changed in settings. The application automatically adjusts:
- Text direction (RTL for Arabic/Algerian, LTR for French)
- Font selection (Cairo font for Arabic languages)
- Date/number formatting
- Cultural-appropriate content

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Deployment

The application is designed to be deployed on cloud platforms like:
- Google Cloud Platform
- Amazon Web Services
- Microsoft Azure

Key deployment considerations:
- MongoDB Atlas for database hosting
- Environment-specific configuration
- SSL/TLS certificates for HTTPS
- CDN for static assets
- Load balancing for high availability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@babyvibe.dz
- Documentation: [Link to docs]
- Issue tracker: [GitHub issues]

---

**تم تطوير هذا التطبيق خصيصاً للسوق الجزائري مع دعم كامل للغة العربية والدارجة الجزائرية**