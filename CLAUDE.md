# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartNutri is a comprehensive nutrition management platform that empowers nutritionists to provide personalized, evidence-based care. The system automates complex calculations, centralizes patient data, and optimizes consultation time, allowing professionals to focus on individualized care.

**Value Proposition:**

- **Efficiency**: Reduces consultation time by up to 60% through automation
- **Precision**: Calculations based on validated scientific formulas
- **Organization**: Complete centralization of patient data and history
- **Scalability**: Intelligent reuse of meal plans
- **Professionalism**: Professional-grade reports and prescriptions

**Production URLs:**

- Backend: smart-nutri-backend-production.up.railway.app
- Frontend: smart-nutri-flame.vercel.app

## Current Features (Implemented ✅)

### Core Functionality

- **Patient Management**: Complete patient profiles and health data tracking
- **Anthropometric Assessment**: Weight, height, circumferences, body composition with automatic calculations (BMI, WHR, BMR, TEE) using scientific formulas
- **Visual Progress Tracking**: Photo uploads via Supabase, categorized by angles (front, back, left, right), visual comparisons between dates
- **Evolution Analysis**: Interactive charts for weight, measurements, body composition over time with automated progress reports
- **Meal Plan Prescription**: 3000+ foods database, energy calculation based on BMR and activity factors, customizable macro distribution

## High Priority Development (⭐)

### Food Substitutes System

- Personalized substitutes added by nutritionists
- Multiple options (up to 5 per food)
- Visual equivalencies with portion conversions
- Filtering by dietary restrictions
- Favorite substitutes tracking

### Reusable Meal Plan Library

- Smart categorization by objective, profile, energy level, and restrictions
- Tag system (#lowcarb, #hyperprotein, etc.)
- Advanced search with multiple criteria
- Version control and sharing between nutritionists
- Automatic portion adjustment based on patient's energy needs

## Commands

### Backend (NestJS)

```bash
cd backend

# Development
npm run dev                    # Start development server with watch mode
npm run start:debug           # Start in debug mode

# Testing
npm test                      # Run tests (automatically cleans test DB first)
npm run test:watch           # Run tests in watch mode
npm run test:e2e            # Run end-to-end tests
npm run test:api            # Run API tests with shell script

# Build & Production
npm run build               # Build for production
npm run start:prod         # Start production server

# Code Quality
npm run lint               # Lint and fix TypeScript files
npm run format             # Format code with Prettier

# Database Management
npm run migration:generate  # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:run:dev  # Run migrations in development
npm run migration:run:prod # Run migrations in production
npm run migration:revert   # Revert last migration

# Environment Setup
npm run setup:env          # Setup environment variables
npm run setup:env:dev      # Setup dev environment
npm run setup:env:prod     # Setup production environment

# Utilities
npm run generate:swagger   # Generate Swagger documentation
npm run generate:db-structure # Export database structure
```

### Frontend (React + Vite)

```bash
cd frontend

# Development
npm run dev                # Start development server
npm run dev:prod          # Start with production mode

# Testing
npm test                  # Run Jest tests
npm run test:watch       # Run tests in watch mode

# Build
npm run build            # Build for production
npm run build:dev       # Build for development
npm run preview         # Preview production build

# Code Quality
npm run lint            # Lint with ESLint

# Environment Setup
npm run setup:env       # Setup environment variables
npm run setup:env:dev   # Setup dev environment
npm run setup:env:prod  # Setup production environment
```

## Architecture

### Backend Architecture (NestJS)

- **Modular Structure**: Organized by feature modules (auth, patients, meal-plan, foods, etc.)
- **Database**: PostgreSQL with TypeORM, migrations-based schema management
- **Authentication**: JWT-based with Passport strategies
- **File Storage**: Supabase for photo uploads and management
- **External Services**: Instagram scraping for profile photos

**Key Modules:**

- `auth/`: Authentication and authorization
- `patients/`: Patient management, consultations, measurements, photos
- `meal-plan/`: Meal plans and templates
- `foods/`: Food database with nutritional information
- `energy-plan/`: Energy calculation and planning (Mifflin-St Jeor formulas)
- `assessment/`: Anthropometric calculations and body composition

### Frontend Architecture (React)

- **Routing**: React Router v7 with nested routes
- **State Management**: React Query for server state, Context API for global state
- **UI Framework**: Material-UI (MUI) with custom theme
- **Forms**: React Hook Form with validation
- **File Uploads**: React Dropzone with Supabase integration

**Key Features:**

- Patient-centric navigation with nested routes
- Anthropometric assessment with scientific formulas
- Photo evolution tracking and comparison
- Energy plan calculations with macronutrient distribution
- Meal plan creation with nutritional analysis

## Database Schema

The application uses PostgreSQL with TypeORM. Key entities:

- **Nutritionists**: User accounts with settings and photos
- **Patients**: Client information with health data
- **Measurements**: Anthropometric data and body composition
- **Photos**: Patient photos organized by type and assessment
- **MealPlans/Meals/MealFoods**: Hierarchical meal planning structure
- **Foods**: Nutritional database with TBCA integration
- **EnergyPlans**: Energy calculations and macronutrient distribution

## Environment Setup

Both frontend and backend use environment setup scripts:

- Run `npm run setup:env` in each directory to configure environment variables
- Environment files are generated based on NODE_ENV (development, production, test)

## Testing Strategy

- **Backend**: Jest with database cleanup before each test run
- **Frontend**: Jest for component and utility testing
- **E2E**: Available for API testing with shell scripts
- **API Testing**: Postman collection available in `backend/postman/`

## Development Guidelines

### Code Organization

- Follow existing module patterns when adding new features
- Reuse existing utilities and services before creating new ones
- Check documentation in module-specific `.md` files before development
- Each module must have its own documentation and it must be updated whenever the module is updated
- Focus on what is explicitly requested, avoid altering unrelated code or functionality
- Prioritize code reuse and extension over duplication

### Database Changes

- Always create migrations for schema changes
- Test migrations in development before production
- Use the migration scripts for consistent deployment

### Photo Management

- All photos are stored in Supabase with organized bucket structure
- Patient photos are categorized by type (front, back, left, right)
- Automatic thumbnail generation and URL management

### Scientific Calculations

- Energy calculations use validated formulas (Mifflin-St Jeor, activity factors)
- Anthropometric calculations follow established scientific methods
- Body composition formulas are implemented in dedicated modules

## Key Dependencies

**Backend:**

- NestJS framework with TypeORM
- Supabase client for storage
- Passport JWT for authentication
- Class-validator for DTOs

**Frontend:**

- React with TypeScript
- Material-UI for components
- React Query for data fetching
- React Hook Form for forms
- Supabase client for file uploads

## Documentation

Comprehensive documentation is available:

- `backend/API_DOCUMENTATION.md`: Complete API reference
- `backend/BACKEND_DOCUMENTATION.md`: Backend-specific documentation
- `frontend/FRONTEND_DOCUMENTATION.md`: Frontend-specific documentation
- Module-specific documentation in each feature directory
- Database structure documentation in `backend/docs/`

## Future Roadmap

**Complementary Features (Medium Priority):**

- Save meal plan as template and create a new plan from a template

**Technical Requirements:**

- Mobile-first responsive interface
- RESTful API with comprehensive documentation
- Modular architecture with individual module documentation
