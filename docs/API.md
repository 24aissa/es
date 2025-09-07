# BabyVibe API Documentation

## Overview

The BabyVibe API provides endpoints for managing children's growth tracking, product recommendations, and order management. All endpoints support Arabic, French, and Algerian dialect through language headers.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.babyvibe.dz/api`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Language Support

Set the preferred language using headers:

```
Accept-Language: ar    # Arabic (default)
Accept-Language: fr    # French
Accept-Language: dz    # Algerian Dialect
```

## Endpoints

### Health Check

#### GET /health
Returns API status and version information.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-07T21:57:37.709Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "أحمد",
  "lastName": "محمد", 
  "email": "ahmad@example.com",
  "phone": "+213123456789",
  "password": "securepassword",
  "preferredLanguage": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "ahmad@example.com",
    "firstName": "أحمد",
    "lastName": "محمد",
    "role": "user",
    "preferredLanguage": "ar"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "ahmad@example.com",
  "password": "securepassword"
}
```

#### GET /auth/me
Get current user information (requires authentication).

### Children Management

#### GET /children
Get all children for the authenticated user.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "child_id",
      "name": "فاطمة",
      "gender": "female",
      "birthDate": "2023-01-15T00:00:00.000Z",
      "age": {
        "years": 1,
        "months": 8,
        "days": 567
      },
      "ageInMonths": 8,
      "currentSizes": {
        "clothing": "6-9M",
        "shoes": "TBD",
        "diapers": "TBD"
      }
    }
  ]
}
```

#### POST /children
Add a new child.

**Request Body:**
```json
{
  "name": "علي",
  "gender": "male",
  "birthDate": "2024-03-10",
  "avatar": "optional_image_url"
}
```

#### PUT /children/:id
Update child information.

#### DELETE /children/:id
Remove a child (soft delete).

#### GET /children/:id/recommendations
Get age-appropriate product recommendations for a specific child.

**Response:**
```json
{
  "success": true,
  "data": {
    "child": {
      "id": "child_id",
      "name": "علي",
      "age": {"years": 0, "months": 6, "days": 180},
      "ageInMonths": 6
    },
    "recommendations": [
      {
        "id": "product_id",
        "localizedName": "ملابس أطفال قطنية",
        "category": "clothing",
        "price": 2500,
        "currency": "DZD",
        "ageRange": {"minMonths": 3, "maxMonths": 12}
      }
    ],
    "categories": ["clothing", "feeding", "hygiene", "toys_infant"]
  }
}
```

### Products

#### GET /products
List products with optional filtering.

**Query Parameters:**
- `category` - Filter by category (clothing, toys, feeding, etc.)
- `ageInMonths` - Filter by child age in months
- `minPrice` / `maxPrice` - Price range filter
- `gender` - Filter by gender (male, female, unisex)
- `search` - Search in product names and descriptions
- `page` - Page number for pagination
- `limit` - Items per page (max 100)
- `sort` - Sort by (price_asc, price_desc, rating, newest)

**Response:**
```json
{
  "success": true,
  "count": 12,
  "total": 145,
  "page": 1,
  "pages": 13,
  "data": [
    {
      "id": "product_id",
      "localizedName": "بدلة أطفال قطنية",
      "localizedDescription": "بدلة مريحة من القطن الطبيعي",
      "category": "clothing",
      "price": 3200,
      "originalPrice": 4000,
      "discountPercentage": 20,
      "images": [{"url": "image_url", "isPrimary": true}],
      "ageRange": {"minMonths": 6, "maxMonths": 18},
      "rating": {"average": 4.5, "count": 23},
      "isAvailable": true
    }
  ]
}
```

#### GET /products/:id
Get a single product by ID.

#### POST /products/:id/reviews
Add a review for a product (requires authentication).

**Request Body:**
```json
{
  "rating": 5,
  "comment": "منتج ممتاز وجودة عالية"
}
```

#### GET /products/categories/list
Get all available product categories and subcategories.

### User Management

#### GET /users/profile
Get user profile information.

#### PUT /users/profile
Update user profile.

#### PUT /users/language
Update preferred language.

**Request Body:**
```json
{
  "language": "fr"
}
```

#### POST /users/addresses
Add a new address.

**Request Body:**
```json
{
  "street": "شارع الاستقلال 123",
  "city": "الجزائر",
  "province": "الجزائر",
  "postalCode": "16000",
  "isDefault": true
}
```

#### DELETE /users/addresses/:addressId
Remove an address.

### Orders (Coming Soon)

#### GET /orders
Get user's order history.

#### POST /orders
Create a new order.

#### GET /orders/:id
Get order details.

#### PUT /orders/:id/status
Update order status (worker/admin only).

### Worker Dashboard (Coming Soon)

#### GET /workers/dashboard
Get worker dashboard data.

#### GET /workers/orders
Get assigned orders for worker.

### Delivery (Coming Soon)

#### GET /delivery/options
Get available delivery options and provinces.

#### POST /delivery/track
Track a shipment.

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "رسالة الخطأ باللغة المحددة",
  "stack": "error_stack_in_development"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created successfully  
- `400` - Bad request / validation error
- `401` - Unauthorized / invalid credentials
- `403` - Forbidden / insufficient permissions
- `404` - Resource not found
- `429` - Too many requests (rate limited)
- `500` - Internal server error

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP
- Product browsing: 60 requests per minute per IP

## Data Models

### Child Age Calculations

The system automatically calculates:
- Current age in years, months, and days
- Age in months for product filtering
- Recommended clothing sizes based on age
- Age-appropriate product categories

### Size Recommendations

Clothing size mapping:
- 0-3 months: "Newborn-3M"
- 3-6 months: "3-6M"  
- 6-9 months: "6-9M"
- 9-12 months: "9-12M"
- 12-18 months: "12-18M"
- 18-24 months: "18-24M"
- 2-3 years: "2T-3T"
- 3-4 years: "3T-4T"
- 4+ years: Age in years

### Notification System

Automatic notifications are sent for:
- Size alerts every 6 months
- Product recommendations based on age changes
- Order status updates
- New product announcements

## Algerian Market Features

### Delivery Providers
- DZExpress
- JetX  
- Express EMS
- Yalidine

### Supported Provinces
All 58 Algerian provinces are supported with varying delivery times (2-5 business days).

### Payment Methods
- Cash on Delivery (COD)
- CIB Bank cards
- Stripe for international cards
- Bank transfer

### Currency
All prices are in Algerian Dinar (DZD).

## Development

### Environment Variables
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/babyvibe
JWT_SECRET=your-secret-key
DEFAULT_LANGUAGE=ar
```

### Testing
```bash
npm test              # Run all tests
npm run test:unit     # Run unit tests
npm run test:api      # Run API tests
```

### Database Schema
The application uses MongoDB with Mongoose ODM. Key collections:
- `users` - User accounts and preferences
- `children` - Child profiles and growth data
- `products` - Product catalog with multi-language support
- `orders` - Order management and history