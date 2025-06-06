# Meal Plan Templates Refactoring Plan

## 📋 Overview

This document outlines the comprehensive plan to refactor the meal plan templates system to mirror the meal plans structure, enabling the frontend to save meal plans as templates and create new meal plans from templates.

## 🎯 Goals

- Enable saving any meal plan as a reusable template
- Create new meal plans from templates with all nutritional data intact
- Maintain full food database integration (TACO, TBCA, custom foods)
- Simplify architecture by using a unified entity model
- Preserve all existing functionality during transition

## 📊 Current Structure Analysis

### Current Template System
- **Entities**: `MealPlanTemplate`, `MealTemplate`, `FoodTemplate`
- **Limitations**: 
  - Simplified food structure without full nutritional data
  - No integration with main food database
  - No portion/measurement system
  - No nutritional calculations
  - Separate entity model creates complexity

### Current Meal Plan System
- **Entities**: `MealPlan`, `Meal`, `MealFood`
- **Advantages**:
  - Full food database integration
  - Complete nutritional calculations
  - Portion and measurement system
  - Support for food substitutes
  - Energy plan integration

## 🔧 Proposed Solution

### Strategy: Unified Entity Model
Instead of maintaining separate template entities, we'll extend the existing meal plan entities with template functionality.

### Key Changes
1. **Add template fields** to `MealPlan` entity
2. **Use existing food integration** system
3. **Maintain nutritional accuracy** in templates
4. **Enable easy conversion** between templates and meal plans

## 📅 Implementation Phases

### Phase 1: Backend Entity Refactoring ⭐ High Priority

**Objective**: Extend MealPlan entity to support template functionality

**Changes to MealPlan Entity**:
```typescript
// Add template-specific fields
@Column({ name: 'is_template', default: false })
isTemplate: boolean;

@Column({ name: 'template_name', nullable: true })
templateName?: string;

@Column({ name: 'template_description', type: 'text', nullable: true })
templateDescription?: string;

@Column({ name: 'is_public', default: false })
isPublic: boolean;

@Column({ type: 'jsonb', nullable: true })
tags: string[];

@Column({ name: 'template_category', nullable: true })
templateCategory?: string;

@Column({ name: 'usage_count', default: 0 })
usageCount: number;
```

**Changes to Meal Entity**:
```typescript
// Add template-specific fields
@Column({ name: 'template_time', nullable: true })
templateTime?: string;

@Column({ name: 'template_notes', type: 'text', nullable: true })
templateNotes?: string;
```

**Benefits**:
- Single entity model reduces complexity
- Full nutritional data preserved in templates
- Existing food relationships work seamlessly
- Easy conversion between templates and meal plans

### Phase 2: Service Layer Updates ⭐ High Priority

**Objective**: Update MealPlanTemplatesService to work with unified entity model

**New Methods**:
```typescript
// Save existing meal plan as template
async saveAsTemplate(
  mealPlanId: string, 
  templateData: SaveAsTemplateDto, 
  nutritionistId: string
): Promise<MealPlan>

// Create meal plan from template
async createFromTemplate(
  templateId: string, 
  patientId: string, 
  nutritionistId: string
): Promise<MealPlan>

// Find all templates (meal plans with isTemplate = true)
async findAllTemplates(nutritionistId: string): Promise<MealPlan[]>

// Search templates by tags, category, or name
async searchTemplates(
  query: string, 
  filters: TemplateFilters, 
  nutritionistId: string
): Promise<MealPlan[]>
```

**Updated Logic**:
- Work with `MealPlan` entities where `isTemplate = true`
- Preserve all food relationships and nutritional data
- Handle template categorization and tagging
- Track usage statistics

### Phase 3: API Endpoints ⭐ High Priority

**Objective**: Add new endpoints for template operations

**New Endpoints**:
```typescript
// Save meal plan as template
POST /meal-plans/:id/save-as-template
Body: SaveAsTemplateDto {
  templateName: string;
  templateDescription?: string;
  isPublic?: boolean;
  tags?: string[];
  templateCategory?: string;
}

// Create meal plan from template  
POST /meal-plan-templates/:id/create-plan/:patientId
Response: MealPlan (newly created)

// Get templates with enhanced filtering
GET /meal-plan-templates?category=&tags=&search=&isPublic=
```

**Enhanced Existing Endpoints**:
- Update template CRUD operations to work with new structure
- Maintain backward compatibility during transition
- Add template-specific query parameters

### Phase 4: Database Migration ⭐ High Priority

**Objective**: Update database schema and migrate existing data

**Migration Steps**:
1. **Add new columns** to `meal_plans` table
2. **Migrate existing template data** from old template tables
3. **Update indexes** for efficient template queries
4. **Preserve data integrity** during migration

**Migration File**: `AddTemplateFieldsToMealPlans.ts`
```typescript
// Add template fields to meal_plans
await queryRunner.addColumn('meal_plans', new TableColumn({
  name: 'is_template',
  type: 'boolean',
  default: false
}));

// Add other template fields...

// Migrate existing template data
await this.migrateExistingTemplates(queryRunner);

// Add indexes for template queries
await queryRunner.createIndex('meal_plans', new TableIndex({
  name: 'IDX_meal_plans_templates',
  columnNames: ['is_template', 'nutritionist_id', 'is_public']
}));
```

**Data Migration Strategy**:
- Convert existing `MealPlanTemplate` records to `MealPlan` records with `isTemplate = true`
- Map `MealTemplate` and `FoodTemplate` to proper `Meal` and `MealFood` structures
- Preserve all relationships and metadata

### Phase 5: DTOs Updates 🔶 Medium Priority

**Objective**: Create DTOs for new template operations

**New DTOs**:
```typescript
// Save meal plan as template
export class SaveAsTemplateDto {
  @IsString()
  templateName: string;

  @IsOptional()
  @IsString()
  templateDescription?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  templateCategory?: string;
}

// Template query filters
export class TemplateFiltersDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// Enhanced template response
export class MealPlanTemplateResponseDto extends MealPlanResponseDto {
  @Expose()
  templateName?: string;

  @Expose()
  templateDescription?: string;

  @Expose()
  tags?: string[];

  @Expose()
  templateCategory?: string;

  @Expose()
  usageCount: number;
}
```

### Phase 6: Frontend Integration 🔶 Medium Priority

**Objective**: Update frontend to support new template functionality

**New Features**:
- **"Save as Template" button** in meal plan details page
- **Template selection modal** when creating new meal plans
- **Template library page** with filtering and search
- **Template management** (edit, delete, share)

**UI Components**:
```typescript
// Save as template modal
<SaveAsTemplateModal 
  mealPlan={mealPlan}
  onSave={handleSaveAsTemplate}
/>

// Template selection modal
<TemplateSelectionModal
  patientId={patientId}
  onSelect={handleCreateFromTemplate}
/>

// Template library
<TemplateLibrary
  filters={templateFilters}
  onFilterChange={setTemplateFilters}
/>
```

**Integration Points**:
- Meal plan details page: Add save as template action
- New meal plan creation: Add create from template option
- Template management: Full CRUD operations
- Search and filtering: Enhanced template discovery

### Phase 7: Documentation Updates 🔶 Low Priority

**Objective**: Update all documentation to reflect new template system

**Documentation Updates**:
- Backend API documentation
- Frontend module documentation  
- Database schema documentation
- User guide for template features

## 🎁 Benefits of This Approach

### 1. **Architectural Simplification**
- Single entity model instead of dual systems
- Reduced code duplication and maintenance overhead
- Clearer data relationships and dependencies

### 2. **Full Feature Parity**
- Templates inherit all meal plan capabilities
- Complete nutritional calculations preserved
- Full food database integration maintained
- Energy plan compatibility

### 3. **Enhanced User Experience**
- Seamless conversion between templates and meal plans
- Rich template metadata (tags, categories, usage stats)
- Advanced search and filtering capabilities
- Template sharing and collaboration features

### 4. **Data Integrity**
- All nutritional data preserved during conversion
- Consistent food database integration
- Proper portion and measurement handling
- Reliable template-to-plan conversion

## 🔄 Migration Strategy

### Backward Compatibility
- Keep existing template endpoints functional during transition
- Gradual migration of frontend components
- Deprecation notices for old template system

### Risk Mitigation
- Comprehensive data backup before migration
- Rollback plan for failed migrations
- Extensive testing of conversion processes
- Staged deployment with monitoring

### Validation Steps
1. **Data Migration Validation**: Verify all template data converted correctly
2. **API Compatibility Testing**: Ensure all endpoints work as expected
3. **Frontend Integration Testing**: Validate UI functionality
4. **Performance Testing**: Confirm query performance with unified model

## 📊 Success Metrics

### Technical Metrics
- [ ] Zero data loss during migration
- [ ] All existing template functionality preserved
- [ ] Performance maintained or improved
- [ ] API response times within acceptable limits

### Feature Metrics
- [ ] Users can save meal plans as templates
- [ ] Users can create meal plans from templates
- [ ] Template search and filtering works correctly
- [ ] Nutritional data accuracy maintained

### User Experience Metrics
- [ ] Template creation time reduced
- [ ] Template discovery improved
- [ ] Meal plan creation from templates streamlined
- [ ] Overall workflow efficiency increased

## 🗓️ Timeline Estimate

| Phase | Estimated Time | Dependencies |
|-------|---------------|--------------|
| Phase 1: Entity Refactoring | 1-2 days | None |
| Phase 2: Service Updates | 2-3 days | Phase 1 |
| Phase 3: API Endpoints | 1-2 days | Phase 2 |
| Phase 4: Database Migration | 2-3 days | Phase 1 |
| Phase 5: DTOs Updates | 1 day | Phase 3 |
| Phase 6: Frontend Integration | 3-4 days | Phase 3 |
| Phase 7: Documentation | 1-2 days | All phases |

**Total Estimated Time**: 11-17 days

## 🔍 Next Steps

1. **Review and approve** this refactoring plan
2. **Start with Phase 1** (Entity Refactoring) as foundation
3. **Create database migration** (Phase 4) in parallel
4. **Implement service layer** updates (Phase 2)
5. **Add API endpoints** (Phase 3)
6. **Update DTOs** (Phase 5)
7. **Integrate frontend** features (Phase 6)
8. **Update documentation** (Phase 7)

This plan aligns with the high-priority requirement for a "Reusable Meal Plan Library" while maintaining the robust food database integration system that SmartNutri already has in place.