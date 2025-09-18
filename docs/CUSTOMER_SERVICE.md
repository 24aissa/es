# EcoManager - Customer Service Module

A comprehensive customer service system for order confirmation and customer management, built as part of the BabyVibe e-commerce platform.

## 🎯 Features

### 1. Order Confirmation System
- **Efficient Order Processing**: Streamlined workflow for confirming orders with customers
- **Multi-channel Communication**: Phone, SMS, Email, and WhatsApp support
- **Automated Routing**: Smart assignment of orders to confirmation agents
- **Real-time Status Tracking**: Live updates on confirmation progress

### 2. Agent Management & Dispatching
- **Preference-based Assignment**: Orders assigned based on agent preferences
  - Language preferences (Arabic, French, Algerian Dialect)
  - Geographic zones (Algerian provinces)
  - Working hours and availability
  - Workload balancing
- **Performance Tracking**: Monitor agent success rates and response times
- **Automated Scheduling**: AI-powered order distribution

### 3. Customer Classification System
- **Automatic Detection**: AI-powered customer categorization
  - **New Customers**: First-time buyers
  - **Regular Customers**: Repeat buyers with moderate activity
  - **Loyal Customers**: High-value, frequent buyers
  - **VIP Customers**: Premium customers with exceptional value
  - **Bad Customers**: High cancellation/return rates
- **Dynamic Scoring**: Real-time score calculation based on behavior
- **Priority Handling**: VIP and loyal customers get priority treatment

### 4. Duplicate Order Detection
- **Smart Algorithm**: Multi-factor duplicate detection
  - Phone number matching
  - Address similarity
  - Order value comparison
  - Product similarity
  - Time-based analysis
- **Automatic Flagging**: Orders flagged for manual review
- **Confidence Scoring**: 0-100% confidence levels

### 5. Confirmation Attempt Traceability
- **Complete History**: Full audit trail of all confirmation attempts
- **Method Tracking**: Phone, SMS, email attempt logging
- **Result Documentation**: Detailed outcomes and notes
- **Time Tracking**: Response times and attempt durations
- **Agent Performance**: Individual agent success metrics

### 6. Customizable Confirmation Statuses
- **Flexible Status System**: Customizable confirmation statuses
- **Multi-language Support**: Arabic, French, and Algerian Dialect
- **Visual Indicators**: Color-coded status system
- **Business Rules**: Configurable status transitions

### 7. Automatic SMS System
- **Multi-step Notifications**: SMS sent at each confirmation step
- **Language Detection**: Automatic language selection based on customer preference
- **Template System**: Customizable SMS templates
- **Delivery Tracking**: SMS delivery status monitoring
- **Cost Tracking**: SMS usage and cost analytics

## 📱 API Endpoints

### Dashboard & Statistics
```
GET /api/customer-service/dashboard
```
Returns comprehensive dashboard statistics

### Order Management
```
GET /api/customer-service/orders/pending
POST /api/customer-service/orders/:orderId/assign
POST /api/customer-service/orders/auto-assign
POST /api/customer-service/orders/:orderId/confirm-attempt
POST /api/customer-service/orders/detect-duplicates
```

### Customer Management
```
GET /api/customer-service/customers/:customerId
POST /api/customer-service/customers/:customerId/flags
POST /api/customer-service/customers/:customerId/notes
```

### Agent Performance
```
GET /api/customer-service/agents/performance
```

## 🛠️ Technical Implementation

### Database Models

#### Enhanced Order Model
```javascript
// Customer Service specific fields
confirmation: {
  status: { type: String, enum: ['pending', 'attempting', 'confirmed', 'failed', 'abandoned'] },
  attempts: [{ agent, method, result, notes, timestamp, duration }],
  assignedAgent: ObjectId,
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'] }
},
duplicateInfo: {
  isDuplicate: Boolean,
  originalOrder: ObjectId,
  duplicateScore: Number,
  detectionMethod: String
},
smsHistory: [{ type, message, status, sentAt, provider, cost }]
```

#### Enhanced User Model
```javascript
// Customer classification
customerClassification: {
  type: { type: String, enum: ['new', 'regular', 'loyal', 'vip', 'bad'] },
  score: Number,
  totalOrders: Number,
  totalSpent: Number,
  flags: [{ type, reason, date, addedBy }],
  notes: [{ content, date, addedBy }]
},
// Agent information
agentInfo: {
  isConfirmationAgent: Boolean,
  preferences: { languages, provinces, workingHours, maxOrdersPerDay },
  performance: { totalConfirmations, successRate, averageResponseTime, rating }
}
```

### Services

#### Customer Service Service
- Dashboard statistics calculation
- Auto-assignment algorithms
- Performance analytics
- Customer classification updates

#### SMS Service
- Multi-provider SMS sending
- Template management
- Delivery tracking
- Cost calculation

### Automated Tasks
- **Auto-assignment**: Every 15 minutes during business hours
- **Duplicate detection**: Hourly checks
- **Customer classification updates**: Daily at 2 AM
- **Confirmation reminders**: Every 30 minutes during business hours

## 🌍 Localization Support

### Supported Languages
- **Arabic (ar)**: Modern Standard Arabic
- **French (fr)**: Standard French
- **Algerian Dialect (dz)**: Local Algerian Arabic

### SMS Templates
All SMS templates support variable substitution:
- `{{customerName}}`: Customer's first name
- `{{orderNumber}}`: Order reference number
- `{{total}}`: Order total amount
- `{{deliveryDate}}`: Expected delivery date
- `{{rescheduleTime}}`: Next contact time

## 📊 Performance Metrics

### Key Performance Indicators (KPIs)
- **Confirmation Rate**: Percentage of orders successfully confirmed
- **Average Response Time**: Time from order creation to first contact
- **Agent Utilization**: Agent workload distribution
- **Customer Satisfaction**: Based on feedback and behavior
- **Duplicate Detection Accuracy**: False positive/negative rates

### Dashboard Widgets
- Pending confirmations counter
- Daily/weekly/monthly confirmation stats
- Duplicate orders alerts
- Customer classification distribution
- Agent performance rankings

## 🔧 Configuration

### Environment Variables
```bash
SMS_PROVIDER=mock                    # SMS provider (mock, twilio, nexmo, etc.)
SMS_API_KEY=your-api-key            # SMS provider API key
SMS_SENDER_ID=EcoManager            # SMS sender ID
```

### Configuration Files
- `src/server/config/customerService.json`: Status definitions and templates
- Customer service settings and business rules

## 🚀 Deployment

### Requirements
- Node.js 14+
- MongoDB 4.4+
- SMS provider account (optional for development)

### Installation
```bash
npm install
cp .env.example .env
# Configure environment variables
npm start
```

### Development Mode
```bash
npm run dev
```

## 📈 Scalability Features

### Performance Optimizations
- Database indexing for fast queries
- Caching for frequently accessed data
- Async processing for heavy operations
- Rate limiting for API protection

### Monitoring
- Comprehensive logging
- Performance metrics
- Error tracking
- Health checks

## 🔒 Security

### Access Control
- Role-based permissions (Admin, Supervisor, Agent)
- Resource-level authorization
- Activity logging and audit trails

### Data Protection
- Sensitive data encryption
- PCI compliance for payment data
- GDPR compliance for customer data

## 📞 Support

For technical support or feature requests, please contact the development team.

---

**EcoManager Customer Service Module** - Streamlining order confirmation and customer management for Algerian e-commerce.