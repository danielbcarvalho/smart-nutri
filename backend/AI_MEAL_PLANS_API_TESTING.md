# AI Meal Plans API Testing Guide

## Overview

This document provides guidance for testing the AI Meal Plans functionality in SmartNutri backend.

## Prerequisites

1. **Environment Variables**: Ensure the following are set in your `.env` file:
   ```env
   AI_MEAL_PLANS_ENABLED=true
   AI_SERVICE_PROVIDER=openrouter
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   AI_MODEL=anthropic/claude-3.5-sonnet
   AI_SERVICE_TIMEOUT=30000
   AI_MAX_RETRIES=3
   ```

2. **Database**: Ensure you have:
   - Patients in the database
   - Food data (TBCA) imported
   - Energy plans for patients (optional but recommended)

## API Endpoints

### 1. Check AI Service Status

**GET** `/ai-meal-plans/status`

- **Purpose**: Verify AI service availability and configuration
- **Authentication**: Required (JWT token)
- **Response**:
  ```json
  {
    "isEnabled": true,
    "isAvailable": true,
    "provider": "claude",
    "foodDatabaseSize": 3042
  }
  ```

### 2. Get Patient Data for AI

**GET** `/ai-meal-plans/patient-data/{patientId}`

- **Purpose**: Retrieve aggregated patient data needed for AI meal plan generation
- **Authentication**: Required (JWT token)
- **Parameters**: 
  - `patientId` (string): UUID of the patient
- **Response**: Comprehensive patient data including measurements, energy plans, existing meal plans, and photos

### 3. Generate AI Meal Plan

**POST** `/ai-meal-plans/generate`

- **Purpose**: Generate a personalized meal plan using AI
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "patientId": "uuid-here",
    "configuration": {
      "objective": "perda_peso",
      "objectiveDetails": "Perda de 3kg em 2 meses",
      "restrictions": ["sem_lactose"],
      "customRestrictions": "Aversão a peixes",
      "mealsPerDay": 5,
      "complexity": "simples",
      "budget": "medio",
      "exerciseRoutine": "Academia 3x por semana",
      "exerciseIntensity": "moderada",
      "kitchenEquipment": ["fogao", "geladeira", "microondas"]
    }
  }
  ```

### 4. Save AI-Generated Meal Plan

**POST** `/ai-meal-plans/save`

- **Purpose**: Save an AI-generated meal plan to the database
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "aiResponse": {
      // Complete AI response object from /generate endpoint
    },
    "patientId": "uuid-here"
  }
  ```

### 5. Food Matching Test

**POST** `/ai-meal-plans/food-matching`

- **Purpose**: Test food matching capabilities with TBCA database
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "foods": ["Arroz branco cozido", "Frango grelhado", "Brócolis refogado"]
  }
  ```

## Testing Scenarios

### Scenario 1: Basic AI Generation

1. Get JWT token from login endpoint
2. Check AI service status
3. Get patient data for a test patient
4. Generate meal plan with basic configuration
5. Verify response contains valid meal plan structure

### Scenario 2: Complex Configuration

1. Generate meal plan with multiple restrictions
2. Verify AI respects dietary restrictions
3. Check food matching accuracy
4. Validate nutritional calculations

### Scenario 3: Save and Retrieve

1. Generate AI meal plan
2. Save it to database
3. Verify meal plan exists in regular meal plans endpoint
4. Check all foods are properly linked

## Common Configuration Options

### Objectives
- `perda_peso` - Weight loss
- `ganho_peso` - Weight gain
- `manutencao` - Maintenance
- `ganho_massa_muscular` - Muscle gain
- `melhoria_saude` - Health improvement

### Restrictions
- `vegetariano` - Vegetarian
- `vegano` - Vegan
- `sem_gluten` - Gluten-free
- `sem_lactose` - Lactose-free
- `diabetes` - Diabetes
- `hipertensao` - Hypertension

### Complexity
- `simples` - Simple recipes
- `moderada` - Moderate complexity
- `complexa` - Complex recipes

### Budget
- `baixo` - Low budget
- `medio` - Medium budget
- `alto` - High budget

## Error Handling

### Common Errors

1. **AI Service Unavailable** (400):
   - Check OPENROUTER_API_KEY is valid
   - Verify internet connection
   - Check API rate limits
   - Ensure model is available on OpenRouter

2. **Patient Not Found** (404):
   - Verify patient UUID exists
   - Check patient belongs to nutritionist

3. **Food Database Empty** (400):
   - Import TBCA food data
   - Check database connection

4. **Validation Errors** (400):
   - Verify all required configuration fields
   - Check data types match DTOs

## Performance Notes

- AI generation typically takes 10-30 seconds
- Food matching is cached for performance
- Database queries are optimized with proper indexing
- Large food databases (3000+ foods) may impact response time

## Integration with Frontend

The AI endpoints integrate with the frontend wizard created in Phase 1:

1. **Patient Data Step**: Uses `GET /patient-data/{id}` 
2. **Configuration Step**: Builds request body for generation
3. **Generation Step**: Calls `POST /generate`
4. **Review Step**: Uses response to display meal plan
5. **Approval Step**: Calls `POST /save` to store in database

## Security Considerations

- All endpoints require JWT authentication
- Patient data is filtered by nutritionist ownership
- AI API keys are stored securely in environment variables
- No sensitive patient data is logged in AI requests