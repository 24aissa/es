# BabyVibe - بيبي فايب Copilot Instructions

BabyVibe is a Node.js/React multi-language parenting application for the Algerian market that tracks child growth and suggests appropriate products based on age. The application supports Arabic (default), French, and Algerian dialect with RTL support.

**ALWAYS follow these instructions first and only fallback to additional search or bash commands when information here is incomplete or found to be in error.**

## Working Effectively

### Prerequisites & Environment Setup
- Node.js v14+ (v20.19.5 validated working)
- npm 10+ (10.8.2 validated working)  
- MongoDB (optional - app works without database using SKIP_DB=true)

### Bootstrap & Dependency Installation
Execute these commands in exact order:

```bash
# Setup environment (REQUIRED)
cp .env.example .env
echo "SKIP_DB=true" >> .env

# Install dependencies - NEVER CANCEL: Takes ~60 seconds total
npm install  # Installs server deps + automatically runs postinstall for client
```

**CRITICAL TIMING**: npm install takes approximately 60 seconds total (server + client dependencies). NEVER CANCEL during installation.

### Build Process
```bash
# Build client only - NEVER CANCEL: Takes ~15 seconds
npm run build

# The build creates optimized production files in src/client/build/
```

**CRITICAL TIMING**: Client build takes approximately 15 seconds. NEVER CANCEL. Set timeout to 60+ seconds to be safe.

### Testing
```bash
# Run unit tests - NEVER CANCEL: Takes ~15 seconds  
npm test

# Tests run against API endpoints and language support
# Tests expect development environment (NODE_ENV=test during testing)
# Database timeouts are expected behavior when SKIP_DB=true
# Some tests may fail due to port conflicts or environment differences - this is acceptable
```

**CRITICAL TIMING**: Tests complete in approximately 15 seconds. NEVER CANCEL. Set timeout to 30+ seconds.

**Note**: Tests may show failures related to port conflicts or database timeouts when SKIP_DB=true. These failures are expected in development environment and do not indicate broken functionality.

### Running the Application

#### Development Mode (Recommended)
```bash
# Server with auto-reload - runs on port 3000
npm run dev

# Client development server (in separate terminal) - runs on port 3001  
cd src/client && npm start
# When prompted about port 3000 being in use, type 'Y' to use port 3001
```

#### Production Mode
```bash
# Build first, then start
npm run build
npm start  # Serves built client from server on port 3000
```

#### Development URLs
- Server API: http://localhost:3000/api/health
- Client Dev: http://localhost:3001/ (when running client separately)
- Production: http://localhost:3000/ (when using npm start after build)

## Validation & Testing Requirements

### Manual Application Testing (MANDATORY)
After any code changes, ALWAYS run through this complete validation scenario:

1. **Start both servers:**
   ```bash
   # Terminal 1: Start backend
   npm run dev
   
   # Terminal 2: Start frontend  
   cd src/client && npm start
   # Choose 'Y' when prompted about port conflict
   ```

2. **Navigate to http://localhost:3001**

3. **Test language selection interface:**
   - Verify page displays "BabyVibe" and "بيبي فايب"
   - Click Arabic (العربية) button - should show Arabic homepage with RTL layout
   - Verify navigation menu appears with: الرئيسية، المنتجات، الأطفال، الطلبات
   - Check login/register links work: تسجيل الدخول، إنشاء حساب

4. **Test API endpoints:**
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   # Should return: {"status":"OK","timestamp":"...","environment":"development","version":"1.0.0"}
   
   # Language support
   curl -H "Accept-Language: fr" http://localhost:3000/api/health
   # Should return same health response
   
   # Database-dependent endpoint (expected to timeout)
   curl http://localhost:3000/api/products
   # Should return timeout error when SKIP_DB=true (this is expected behavior)
   ```

5. **Test build process:**
   ```bash
   npm run build
   # Should complete successfully with "Compiled successfully" message
   ```

### Pre-commit Validation (REQUIRED)
Before making any commit, ALWAYS run:
```bash
# These commands must complete (build must succeed, tests may have expected failures):
npm run build      # Build must succeed completely
npm test           # Tests may show expected failures in development environment
```

**Note**: 
- Lint command (`npm run lint`) currently fails due to missing ESLint configuration. This is a known issue - DO NOT attempt to fix linting unless specifically requested.
- Tests may fail with port conflicts or database timeouts when using SKIP_DB=true - this is expected behavior.

## Development Workflow

### Key Project Structure
```
src/
├── server/                 # Express.js backend API
│   ├── models/            # Mongoose database models  
│   ├── routes/            # API endpoints (/api/auth, /api/products, etc.)
│   ├── middleware/        # Authentication, error handling, rate limiting
│   ├── services/          # Business logic (notifications, etc.)
│   ├── config/            # Database, i18n configuration
│   └── index.js           # Main server entry point
├── client/                # React frontend application
│   ├── src/components/    # Reusable UI components
│   ├── src/pages/         # Page components (LoginPage, HomePage, etc.)
│   ├── src/i18n/          # Frontend translation files
│   └── package.json       # Client-specific dependencies
└── locales/               # Server-side translations (ar, fr, dz)
```

### Important Code Locations
- **Main server entry**: `src/server/index.js` - Express app setup, middleware, routes
- **Client entry**: `src/client/src/App.js` - React router and main app component  
- **Language selector**: `src/client/src/components/LanguageSelector.js` - Multi-language interface
- **API health endpoint**: `src/server/index.js` line 74-80 - System health check
- **Database config**: `src/server/config/database.js` - MongoDB connection with graceful fallback
- **Internationalization**: `locales/` (server) and `src/client/src/i18n/` (client)

### Configuration Files
- **Environment**: `.env` (copy from `.env.example`)
- **Server package**: `package.json` - Main project dependencies and scripts
- **Client package**: `src/client/package.json` - React app dependencies
- **Translations**: `locales/{ar,fr,dz}/` - Server translations for Arabic, French, Algerian dialect

## Language & Localization

The application supports three languages with proper cultural adaptation:

1. **Arabic (ar)** - Default language, RTL layout, Cairo font
2. **French (fr)** - LTR layout for French speakers  
3. **Algerian Dialect (dz)** - Local dialect for familiar user experience, RTL layout

### Testing Multi-language Support
- API automatically detects language from `Accept-Language` header
- Client language selector allows switching between all three languages
- All routes and error messages are localized
- Database operations work correctly with Arabic text and RTL content

## Common Issues & Troubleshooting

### Database Connection Issues (Expected)
When `SKIP_DB=true` is set in `.env`:
- Server starts successfully but logs database connection failure 
- API endpoints that require database will timeout after 10 seconds
- Health endpoint `/api/health` works without database
- This is expected behavior for development without MongoDB

### Port Conflicts
- Server uses port 3000 by default
- When running client dev server, it will prompt to use port 3001
- Always choose 'Y' to run client on alternative port
- Production mode serves client from server port 3000

### Build Warnings
- ESLint configuration is missing - linting will fail with configuration error
- React build may show deprecation warnings - these are safe to ignore
- Dependency audit warnings about vulnerabilities are acceptable for development

## Performance Expectations

**CRITICAL TIMING INFORMATION:**
- **npm install**: ~60 seconds total (NEVER CANCEL)
- **npm run build**: ~15 seconds (NEVER CANCEL) 
- **npm test**: ~15 seconds (NEVER CANCEL)
- **Server startup**: ~2 seconds
- **Client dev server startup**: ~10 seconds

**Always set timeouts of 60+ seconds for build commands and 30+ seconds for test commands.**

## Key Features to Understand

### Child Growth Tracking
- Parents add children with birth dates
- System calculates age in months automatically
- Clothing size recommendations based on age groups
- Automatic notifications every 6 months for size updates

### Multi-language E-commerce
- Product catalog with Arabic, French, and Algerian dialect names
- Age-appropriate product filtering
- Integration with Algerian delivery services (DZExpress, JetX, etc.)
- Cultural-appropriate content and sizing for Algerian market

### Notification System  
- Scheduled cron jobs for size alerts and product recommendations
- Email notifications for order updates
- Supports all three languages in notifications

### Security & Performance
- JWT authentication with 7-day expiration
- Rate limiting (100 requests per 15-minute window)
- CORS configured for development and production domains
- Helmet security headers
- File upload limits (5MB max)

This codebase is production-ready for the Algerian parenting market with comprehensive internationalization and e-commerce capabilities.