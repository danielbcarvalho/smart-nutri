# Smart Nutri AI Integration - Enhanced Planning Document

## Overview

This document outlines the implementation of AI-powered meal plan generation for SmartNutri, leveraging the existing system architecture, patient data, and nutritional database to provide intelligent, personalized meal planning assistance.

## Current System Analysis

### Existing Features (Available for AI Integration)
- **Complete patient management** with health data, measurements, and photos
- **Anthropometric assessment** with automatic calculations (BMI, WHR, BMR, TEE) using scientific formulas
- **3000+ foods database** from TBCA with nutritional information
- **Energy planning** with validated formulas (Mifflin-St Jeor)
- **Meal plan system** with templates and reusable components
- **Photos tracking** for visual progress analysis

### Technical Architecture
- **Backend**: NestJS with TypeORM, PostgreSQL database, Supabase storage
- **Frontend**: React + TypeScript, Material-UI, React Query
- **API structure**: RESTful with comprehensive endpoints
- **Authentication**: JWT-based with Passport

## System Objectives
- Automate initial nutritional plan creation using existing patient data
- Reduce plan development time for nutritionists by 60% (aligning with project goals)
- Maintain personalization and professional control over recommendations
- Integrate seamlessly with existing SmartNutri workflows
- Leverage scientific formulas already implemented in the system
## Functional Specifications

### 1. Integration with Existing UI
   **Current State**: AI modal and button already exist in HeaderGlobal.tsx but only show "Coming Soon"
   
   **Implementation**: 
   - Replace existing AI modal with functional interface
   - Add "Create Plan with Smart Nutri AI" button in meal plan creation flow
   - Position alongside existing options ("Create from Scratch" and "Use Template")
   - Leverage existing AI animated GIF and branding

### 2. Patient Data Integration (Leveraging Existing APIs)
   **Available Data Sources**:
   - **Patient API** (`/patients/:id`): Complete patient profile
   - **Measurements API** (`/measurements/patient/:patientId`): Latest anthropometric data
   - **Energy Plans**: Existing BMR/TEE calculations
   - **Photos API** (`/photos`): Recent progress photos for visual analysis
   - **Previous Meal Plans** (`/meal-plans/patient/:patientId`): Historical dietary patterns

   **Automatic Data Collection**:

   **Anthropometric Data**:
   - Weight, height, BMI (from measurements table)
   - Body fat percentage, muscle mass (if available)
   - Body circumferences (comprehensive measurement data)
   - Age and gender (calculated from patient birthDate and gender)

   **Clinical Data** (from patient profile):
   - Health information and medical history
   - Occupation and lifestyle factors
   - Contact and demographic information

   **Nutritional Data** (from existing calculations):
   - BMR using Mifflin-St Jeor formula (already implemented)
   - TEE with activity factors (already implemented)
   - Previous meal plans and food preferences (from meal-plans history)

   **Visual Progress Data**:
   - Recent patient photos for body composition analysis
   - Progress tracking data from photos module

### 3. AI Configuration Form (Enhanced for SmartNutri)
   **Enhanced Configuration Form aligned with SmartNutri's design system**:

   **Specific Plan Objective**:
   - Dropdown using DesignSystemSelect: Weight Loss / Muscle Gain / Maintenance / Sports Performance / General Health
   - DesignSystemInput for additional objective details
   - Integration with existing energy plan objectives

   **Dietary Restrictions and Preferences**:
   - Checkboxes using Material-UI components with theme colors
   - Options: Vegetarian, Vegan, Low carb, Ketogenic, Gluten-free, Lactose-free
   - DesignSystemInput for additional restrictions
   - Food preference selection using existing food search functionality

   **Plan Parameters**:
   - Number of meals per day (Material-UI Slider: 3-6)
   - Budget consideration (DesignSystemInput with Brazilian Real currency)
   - Recipe complexity level (Simple/Moderate/Elaborate) using DesignSystemSelect
   - Time availability for meal preparation

   **Special Considerations**:
   - Exercise routine integration (linking with existing energy plan activity factors)
   - Preferred meal times (time pickers)
   - Kitchen equipment availability
   - Social context and eating patterns

### 4. AI Processing (SmartNutri Enhanced)
   **AI Service Integration** (Recommended: Claude 3.5 Sonnet or GPT-4):

   **Data Analysis Phase**:
   - Consolidate patient data from existing APIs
   - Use implemented scientific formulas (BMR, TEE calculations)
   - Analyze anthropometric trends and progress photos
   - Identify nutritional gaps and dietary restrictions
   - Cross-reference with TBCA food database

   **Plan Generation Phase**:
   - Create balanced meal structure using existing meal plan format
   - Select foods from SmartNutri's 3000+ TBCA database
   - Calculate portions based on existing serving size data
   - Suggest optimal consumption times based on patient lifestyle
   - Generate alternatives using food substitution logic

   **Structured Output** (Compatible with existing MealPlan entities):

```json
{
  "mealPlan": {
    "title": "AI Generated Plan - [Patient Name]",
    "description": "Personalized meal plan created by SmartNutri AI",
    "startDate": "2024-06-06",
    "endDate": "2024-06-13",
    "meals": [
      {
        "name": "Café da Manhã",
        "time": "08:00",
        "foods": [
          {
            "foodId": "uuid-from-tbca-database",
            "name": "Aveia em flocos",
            "quantity": 30,
            "unit": "g",
            "calories": 117,
            "protein": 4.1,
            "carbohydrates": 19.8,
            "fat": 2.4
          }
        ]
      }
    ]
  },
  "nutritionalSummary": {
    "totalCalories": 1800,
    "protein": 120,
    "carbohydrates": 225,
    "fat": 60
  },
  "alternatives": [
    {
      "mealName": "Café da Manhã",
      "alternatives": ["Granola integral", "Pão integral com ricota"]
    }
  ],
  "notes": ["Beber 2L de água ao longo do dia", "Consumir entre 8h-9h"]
}
```

### 5. Database Integration (Enhanced with Existing SmartNutri Architecture)
   **Leveraging Existing SmartNutri Food Database**:

   **Automatic Food Matching**:
   - Use existing food search service (`/foods/search`) for AI-suggested foods
   - Leverage TBCA database with 3000+ foods already integrated
   - Implement fuzzy matching for food name variations
   - Prioritize foods already used in previous patient meal plans

   **Smart Population**:
   - Populate meal plan using existing MealPlan/Meal/MealFood entity structure
   - Apply suggested quantities using existing serving size and unit data
   - Maintain compatibility with existing meal plan templates
   - Automatically calculate nutritional totals using existing food data

   **Enhanced Exception Handling**:
   - Alert nutritionist about foods not found in TBCA database
   - Suggest similar foods using existing categories and nutritional profiles
   - Option to request food addition to database (integrating with existing food management)
   - Fallback to template-based suggestions when AI foods unavailable

### 6. Review Interface (SmartNutri Design System Integration)
   **Enhanced Review Interface using SmartNutri Components**:

   **Generated Plan Visualization**:
   - Use existing meal plan display components with AI enhancement indicators
   - Show complete plan using familiar Material-UI table format
   - Highlight AI-generated items with distinctive styling (using theme accent colors)
   - Display nutritional summary using existing calculation components
   - Visual comparison with patient's energy needs (BMR/TEE integration)

   **Advanced Editing Tools**:
   - Inline editing using existing food selection components
   - "Replace Food" function leveraging existing food search and substitution logic
   - Real-time nutritional recalculation using existing formulas
   - Drag-and-drop meal reordering with existing UI patterns

   **Professional Approval Workflow**:
   - DesignSystemButton for "Approve and Save" action
   - "Generate Alternative Plan" option with different AI parameters
   - Option to "Save as Template" using existing template system
   - Integration with existing meal plan creation flow

## Technical Specifications (SmartNutri Architecture)

### Enhanced Architecture
```
Frontend (React + TypeScript) ↔ NestJS Backend ↔ AI Service (Claude/OpenAI)
         ↕                              ↕                    ↕
Material-UI Components         TypeORM + PostgreSQL    SmartNutri Context
         ↕                              ↕
React Query Cache              Supabase Storage
         ↕                              ↕
Design System                  TBCA Food Database
```
### Required APIs (Enhanced with SmartNutri Conventions)

**New AI-Specific Endpoints**:
- `POST /ai-meal-plans/generate` - Generate AI meal plan
- `GET /ai-meal-plans/patient-data/:patientId` - Aggregated patient data for AI
- `POST /ai-meal-plans/food-matching` - Batch food matching with TBCA database
- `POST /ai-meal-plans/save` - Save AI-generated plan

**Existing APIs to Leverage**:
- `GET /patients/:id` - Patient profile data
- `GET /measurements/patient/:patientId` - Latest measurements
- `GET /meal-plans/patient/:patientId` - Patient's meal plan history
- `GET /foods/search?query=` - Food database search
- `POST /meal-plans` - Save final meal plan

### Performance Considerations (SmartNutri Optimized)
- **React Query caching** for patient data and food database
- **Asynchronous AI processing** with Material-UI CircularProgress indicators
- **Progressive loading** of meal plan generation steps
- **Fallback to template-based suggestions** if AI service unavailable
- **Local food database caching** using existing foodDb service
- **Debounced AI requests** to prevent excessive API calls

## Acceptance Criteria (SmartNutri Enhanced)
### Basic Functionality
- [ ] AI button in HeaderGlobal.tsx transformed from "Coming Soon" to functional interface
- [ ] "Create Plan with AI" button integrated in meal plan creation flow
- [ ] Patient data automatically aggregated from existing APIs
- [ ] Configuration form uses SmartNutri design system components
- [ ] AI generates plan using existing meal plan entity structure
- [ ] TBCA food database integration with fuzzy matching
- [ ] Plan populated using existing meal plan interface components

### User Experience (SmartNutri Standards)
- [ ] Complete AI process takes less than 2 minutes
- [ ] Interface follows SmartNutri design patterns (no training needed)
- [ ] Visual feedback using existing loading components
- [ ] Error handling with GlobalSnackbar notifications
- [ ] Responsive design for all device sizes
- [ ] Portuguese language support throughout

### Output Quality (SmartNutri Scientific Standards)
- [ ] Generated plans are nutritionally adequate using validated formulas
- [ ] Dietary restrictions properly respected and documented
- [ ] Quantities realistic based on TBCA serving sizes
- [ ] Food variety maintained using Brazilian dietary patterns
- [ ] Integration with existing energy plan calculations (BMR/TEE)

## Implementation Roadmap (SmartNutri Specific)

### Phase 1: Frontend Infrastructure (Week 1-2)
- Replace AiModal.tsx with functional AI interface
- Create AI configuration form using design system components
- Integrate with existing patient data context
- Setup React Query for AI data management

### Phase 2: Backend AI Service (Week 3-4)
- Create AI meal plans module in NestJS
- Implement patient data aggregation service
- Setup AI service integration (Claude 3.5 Sonnet recommended)
- Create food matching algorithms

### Phase 3: Integration & Testing (Week 5-6)
- Connect frontend AI interface with backend services
- Implement food database matching with TBCA
- Create review and editing interface
- Integration testing with existing meal plan flow

### Phase 4: Enhancement & Refinement (Week 7-8)
- Performance optimization and caching
- Error handling and fallback mechanisms
- User acceptance testing with nutritionists
- Documentation and training materials
## Important Notes (SmartNutri Context)
- **Professional Control**: Always keep the nutritionist in final control of all decisions
- **Scientific Accuracy**: Maintain integration with validated nutritional formulas
- **Data Privacy**: Implement LGPD compliance for patient data in AI processing
- **Brazilian Context**: Consider Brazilian dietary patterns and TBCA food database
- **Audit Trail**: Detailed logging for professional accountability and improvement
- **Gradual Rollout**: Phase implementation to minimize disruption to existing workflows

## Detailed Implementation Guide for Development

### Priority Development Tasks

#### Frontend Components (React + TypeScript)
1. **AI Interface Enhancement**:
   - Refactor `AiModal.tsx` to functional AI configuration interface
   - Create AI meal plan wizard using SmartNutri design system
   - Integrate with existing patient context and meal plan flows

2. **Form Components**:
   - AI configuration form with validation using react-hook-form
   - Food preference selection using existing food search components
   - Progress indicators using Material-UI components

3. **Review Interface**:
   - AI-generated meal plan display with editing capabilities
   - Food substitution interface leveraging existing components
   - Nutritional summary integration with existing calculations

#### Backend Services (NestJS + TypeORM)
1. **AI Module Creation**:
   - Create `ai-meal-plans` module following SmartNutri patterns
   - Patient data aggregation service using existing repositories
   - AI service integration with Claude 3.5 Sonnet or GPT-4

2. **Database Integration**:
   - Food matching algorithms for TBCA database
   - Meal plan generation using existing entity structure
   - Audit logging for AI-generated plans

3. **API Endpoints**:
   - RESTful endpoints following SmartNutri API conventions
   - Error handling with appropriate HTTP status codes
   - Integration with existing authentication middleware

#### Database & Caching
- Optimize existing food search queries for AI batch processing
- Implement caching for frequently accessed patient data
- Create indexes for improved AI data aggregation performance

#### Error Handling & Fallbacks
- Graceful degradation when AI service unavailable
- User-friendly error messages using GlobalSnackbar
- Retry mechanisms with exponential backoff
- Fallback to template-based suggestions

### Technical Stack (SmartNutri Aligned)
- **Frontend**: React + TypeScript, Material-UI, React Query, React Hook Form
- **Backend**: NestJS, TypeORM, PostgreSQL, Passport JWT
- **AI Integration**: Claude 3.5 Sonnet API with structured output
- **Caching**: React Query for frontend, potential Redis for backend
- **Storage**: Supabase for any AI-related assets
- **Monitoring**: Existing logging infrastructure with AI-specific metrics

### Environment Variables Required
```env
# AI Service Configuration
AI_SERVICE_PROVIDER=claude # or openai
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key (alternative)
AI_SERVICE_TIMEOUT=30000
AI_MAX_RETRIES=3

# AI Feature Flags
AI_MEAL_PLANS_ENABLED=true
AI_DEBUG_MODE=false
```

This enhanced specification provides a comprehensive, SmartNutri-specific guide for implementing AI-powered meal planning while leveraging existing architecture, maintaining scientific accuracy, and ensuring seamless integration with current workflows.
