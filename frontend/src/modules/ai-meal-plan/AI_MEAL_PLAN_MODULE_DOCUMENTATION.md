# AI Meal Plan Module Documentation

## Overview

The AI Meal Plan module provides intelligent meal planning capabilities within SmartNutri, leveraging artificial intelligence to generate personalized nutrition plans based on patient data, dietary preferences, and professional requirements.

## Module Structure

```
src/modules/ai-meal-plan/
├── components/
│   ├── AiMealPlanModal.tsx          # Main AI meal plan wizard modal
│   ├── PatientDataSummary.tsx       # Patient data aggregation display
│   ├── AiConfigurationForm.tsx      # AI parameters configuration form
│   └── AiPlanReview.tsx            # Generated plan review interface
├── services/
│   └── aiMealPlanService.ts        # AI meal plan API service
├── hooks/
│   ├── usePatientAiData.ts         # Patient data aggregation hook
│   └── useAiMealPlanGeneration.ts  # AI generation mutations
└── types/
    └── (future type definitions)
```

## Core Components

### AiMealPlanModal

The main modal component that orchestrates the AI meal plan creation workflow.

**Features:**
- Multi-step wizard interface (4 steps)
- Progress tracking with Material-UI Stepper
- Patient data review
- AI configuration
- Plan generation with loading states
- Plan review and approval

**Props:**
- `open: boolean` - Modal visibility state
- `onClose: () => void` - Close handler
- `patientId?: string` - Target patient ID

**Usage:**
```tsx
<AiMealPlanModal
  open={aiModalOpen}
  onClose={() => setAiModalOpen(false)}
  patientId={selectedPatientId}
/>
```

### PatientDataSummary

Displays aggregated patient data that will be used by the AI for plan generation.

**Features:**
- Basic patient information display
- Latest anthropometric measurements
- Energy plan data (BMR/TEE)
- Previous meal plans history
- Progress photos availability
- Visual data completeness indicators

**Data Sources:**
- Patient profile API
- Measurements API
- Energy plans API
- Meal plans history API
- Photos API

### AiConfigurationForm

Comprehensive form for configuring AI meal plan generation parameters.

**Configuration Sections:**

1. **Plan Objective**
   - Primary goal selection (weight loss, muscle gain, etc.)
   - Additional objective details

2. **Dietary Restrictions & Preferences**
   - Common dietary restrictions (vegetarian, keto, etc.)
   - Custom restrictions
   - Food preferences selection

3. **Plan Parameters**
   - Number of meals per day (3-6)
   - Budget considerations
   - Recipe complexity level
   - Preparation time availability

4. **Special Considerations**
   - Exercise routine details
   - Kitchen equipment availability
   - Social context and eating patterns

### AiPlanReview

Interactive review interface for AI-generated meal plans.

**Features:**
- Nutritional summary with macro breakdown
- Detailed meal breakdown with food tables
- AI suggestion indicators
- Food substitution options
- Editable components
- Approval workflow

## Services & Data Management

### aiMealPlanService

Service class for AI meal plan operations.

**Methods:**
- `generateMealPlan(request)` - Generate AI meal plan
- `getPatientDataForAi(patientId)` - Fetch aggregated patient data
- `saveMealPlan(planData)` - Save generated plan
- `matchFoodsWithDatabase(foods)` - Match AI suggestions with TBCA database
- `mockGenerateMealPlan(request)` - Development mock generation

**Error Handling:**
- Comprehensive error categorization
- User-friendly error messages
- Network error handling
- Retry mechanisms

### usePatientAiData Hook

React Query hook for aggregating patient data from multiple sources.

**Features:**
- Parallel data fetching from multiple APIs
- Error handling for each data source
- Graceful degradation for missing data
- Caching and stale-time management

**Aggregated Data:**
```typescript
interface PatientAiData {
  patient: PatientBasicInfo;
  latestMeasurement?: MeasurementData;
  energyPlan?: EnergyPlanData;
  previousMealPlans?: MealPlanHistory[];
  progressPhotos?: PhotoData[];
}
```

### useAiMealPlanGeneration Hook

Mutation hook for AI meal plan generation.

**Features:**
- Async plan generation with loading states
- Error handling and user feedback
- Success callbacks for navigation
- Development mock support

## Integration Points

### Meal Plan Creation Flow

The AI option is integrated into the existing meal plan creation workflow:

1. **Entry Point**: "Create with AI" option in PlanCreationMethodModal
2. **Trigger**: Available when patient has sufficient data
3. **Process**: Multi-step AI wizard
4. **Output**: Standard meal plan compatible with existing system

### Design System Integration

All components follow SmartNutri design patterns:
- Material-UI components with custom theme
- Consistent typography and spacing
- Responsive grid layouts
- Loading states and progress indicators
- Error handling with GlobalSnackbar

### Data Flow Integration

The AI module leverages existing SmartNutri infrastructure:
- Patient management APIs
- Food database (TBCA integration)
- Measurement tracking
- Energy plan calculations
- Photo management system

## Development Status

### Phase 1: ✅ Completed
- [x] Modal infrastructure and multi-step wizard
- [x] Patient data aggregation service
- [x] AI configuration form with all parameters
- [x] Plan review interface with mock data
- [x] Integration with meal plan creation flow
- [x] Design system compliance

### Phase 2: 🔄 Backend Integration (Next)
- [ ] Backend AI service endpoints
- [ ] Real AI provider integration (Claude/OpenAI)
- [ ] Food matching with TBCA database
- [ ] Plan generation and saving logic

### Phase 3: 🔄 Enhancement & Testing
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] User acceptance testing
- [ ] Documentation completion

## Configuration & Environment

### Development Mock Mode
Currently using mock generation for development:
```typescript
// Mock generation simulates 3-second API call
await aiMealPlanService.mockGenerateMealPlan(request);
```

### Future Backend Integration
Environment variables for AI service:
```env
AI_SERVICE_PROVIDER=claude
CLAUDE_API_KEY=your_key
AI_SERVICE_TIMEOUT=30000
AI_MAX_RETRIES=3
```

## Usage Guidelines

### When to Use AI Generation
- Patient has sufficient data (measurements, energy plan)
- Nutritionist wants to accelerate initial plan creation
- Complex dietary requirements need systematic approach
- Patient profile supports AI recommendations

### User Experience Flow
1. **Data Review**: Verify patient data completeness
2. **Configuration**: Set AI parameters and preferences
3. **Generation**: Wait for AI processing (1-2 minutes)
4. **Review**: Examine and edit generated plan
5. **Approval**: Save as standard meal plan

### Best Practices
- Always review AI-generated plans before approval
- Use AI as starting point, not final prescription
- Maintain professional oversight and customization
- Leverage AI insights while applying clinical judgment

## Technical Considerations

### Performance
- React Query caching for patient data
- Debounced form inputs to prevent excessive API calls
- Progressive loading of components
- Optimized re-renders with React.memo

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management in modal workflow

### Error Handling
- Graceful degradation when AI service unavailable
- Fallback to template-based suggestions
- Clear error messages with actionable guidance
- Retry mechanisms with exponential backoff

### Security
- Patient data encryption in transit
- LGPD compliance for data processing
- Audit trail for AI-generated plans
- Professional accountability maintenance

## Future Enhancements

### Planned Features
- AI learning from nutritionist feedback
- Advanced food substitution suggestions
- Seasonal and regional food preferences
- Integration with laboratory results
- Automated plan adjustments based on progress

### Potential Integrations
- Wearable device data integration
- Shopping list generation
- Recipe suggestions and cooking instructions
- Progress tracking and plan optimization
- Multi-language support for international expansion

This documentation will be updated as the module evolves through subsequent development phases.