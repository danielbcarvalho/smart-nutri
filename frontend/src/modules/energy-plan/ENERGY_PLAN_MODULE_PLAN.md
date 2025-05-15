# Frontend Development Guide: Planejamento Energético Integration

## 1. Overview

This guide outlines the steps and considerations for developing the "Planejamento Energético" feature on the frontend and integrating it with the provided backend API. The frontend will be responsible for:

- Providing a user interface, screens and components for creating and editing energy plans.
- Dynamically calculating TMB (Taxa Metabólica Basal) and GET (Gasto Energético Total) based on user inputs.
- Fetching, displaying, creating, updating, and deleting energy plans via API calls.
- Managing server state and caching using React Query.

## 2. Core UI Components (Material-UI)

A primary page (`EnergyPlanPage`) will be needed.

### 2.1. `EnergyPlanPage.tsx`

- **State (React `useState` or a form library like React Hook Form)**:
  - `name: string`
  - `calculationDate: Date | string` (manage as `Date` object, format for API)
  - `weightAtCalculationKg: number | string`
  - `heightAtCalculationCm: number | string`
  - `fatFreeMassAtCalculationKg?: number | string`
  - `formulaKey: EnergyFormula | string` (from backend enum/lookup)
  - `activityFactorKey?: string` (the numeric value, e.g., "1.200")
  - `injuryFactorKey?: string` (the numeric value, e.g., "1.000")
  - `additionalMetDetails: MetDetail[]` (array of objects: `{ met_id: string, duration_minutes: number, met_value: number }`)
  - `additionalMetTotalKcal?: number` (calculated)
  - `weightGoalDetails?: WeightGoalDetail` (object: `{ target_weight_change_kg?: number, days_to_achieve?: number, calculated_kcal_adjustment?: number }`)
  - `additionalPregnancyKcal?: number`
  - `pregnancySpecificInputs?: PregnancySpecificInputs` (object: `{ gestational_age_weeks?: number, ... }`)
  - `customTmbKcalInput?: number`
  - `customGetKcalInput?: number`
  - `calculatedTmbKcal?: number` (derived state)
  - `calculatedGetKcal: number` (derived state)
- **Derived State (Calculated in real-time)**:
  - `ageAtCalculationYears: number` (calculated from patient's birthdate and `calculationDate`)
  - `genderAtCalculation: Gender` (fetched from patient data)
  - The actual `calculatedTmbKcal` and `calculatedGetKcal`.
- **UI Elements (Material-UI Components)**:
  - `TextField` for name, weight, height, MLG, custom TMB/GET, etc.
  - `DatePicker` (from `@mui/x-date-pickers` or similar) for `calculationDate`.
  - `Select` or `Autocomplete` for `formulaKey`.
  - `Select` or `Autocomplete` for `activityFactorKey` and `injuryFactorKey` (options populated based on selected formula if necessary).
  - Dedicated UI sections/sub-modals for:
    - **METs Adjustment**: A way to search/select MET activities (from a predefined list or API), input duration, and see the calculated `additionalMetTotalKcal`.
    - **Weight Goal (VENTA)**: Sliders/inputs for target weight change and days, displaying the `calculated_kcal_adjustment`.
    - **Pregnancy Adjustment**: Inputs for `additionalPregnancyKcal` or `pregnancySpecificInputs`.
  - Read-only displays for `calculatedTmbKcal` and `calculatedGetKcal` (with Kcal/kg).
  - Buttons: "Salvar Cálculos", "Cancelar", "Importar Antropometria" (if applicable).
- **Functionality**:
  - If `energyPlanId` is provided, fetch the existing plan data to pre-fill the form.
  - Implement client-side validation for inputs (e.g., numeric, required).
  - Call calculation utilities (`calculateTMB`, `calculateGET`) whenever relevant inputs change.
  - On "Salvar", construct the DTO and call the appropriate React Query mutation (`createEnergyPlan` or `updateEnergyPlan`).

## 3. Calculation Logic (`utils/energyCalculations.ts`)

This module will contain pure TypeScript functions for all energy calculations.

- **`calculateAge(birthDate: string | Date, calculationDate: string | Date): number`**
- **`getPatientGender(patientId: string): Promise<Gender>`** (or pass patient data to page)
- **`calculateTMB(params: TMBCalculationParams): number | null`**:
  - `TMBCalculationParams` interface will include: `formulaKey`, `weightKg`, `heightCm`, `ageYears`, `gender`, `fatFreeMassKg?`, `customTmbKcalInput?`.
  - Implement logic for all supported formulas (Harris-Benedict 1984, FAO/WHO 2004, IOM EER 2005, Katch-McArdle, Cunningham, Mifflin, Tinsley, etc.).
  - Return `null` if TMB is not applicable (e.g., direct GET formula, manual GET).
- **`calculateGET(params: GETCalculationParams): number`**:
  - `GETCalculationParams` interface will include: `tmbKcal: number | null`, `activityFactorValue: number`, `injuryFactorValue: number`, `additionalMetTotalKcal?: number`, `weightGoalKcalAdjustment?: number`, `additionalPregnancyKcal?: number`, `customGetKcalInput?`.
  - Standard GET formula: `(tmbKcal * activityFactorValue * injuryFactorValue) + allAditionalKcals`. Handle cases where TMB is null.
  - Special logic for formulas like IOM EER that might directly calculate GET.
- **`calculateAdditionalMetKcal(metDetails: MetDetail[], weightKg: number): number`**
- **`calculateVentaKcalAdjustment(targetWeightChangeKg: number, daysToAchieve: number): number`** (VENTA: 7700 kcal per kg)

**Data for Formulas/Factors:**

- The descriptive names for formulas, activity factors, and injury factors, and their corresponding keys/values, can be managed as constants/enums within the frontend.
  - `ENERGY_FORMULAS_OPTIONS`, `ACTIVITY_FACTOR_OPTIONS_BY_FORMULA`, `INJURY_FACTOR_OPTIONS`.
- Alternatively, if these are extensive or frequently updated, fetch them from the backend's `/energy-data-lookups` endpoints.

## 4. API Integration and State Management (React Query & Axios)

Create custom hooks for interacting with the energy plan API.

### 4.1. API Service (`services/energyPlanService.ts`)

Encapsulate Axios calls.

```typescript
import axiosInstance from './axiosConfig'; // Your configured Axios instance
import { CreateEnergyPlanDto, UpdateEnergyPlanDto, EnergyPlanResponseDto, QueryEnergyPlanDto } from '../dto/energy-plan.dto'; // DTOs mirroring backend

const API_URL = '/energy-plans'; // Or your full base URL

export const energyPlanService = {
  create: async (patientId: string, data: CreateEnergyPlanDto): Promise<EnergyPlanResponseDto> => {
    // The backend documentation suggests POST /energy-plans directly, not nested under patientId for creation.
    // Let's assume POST /energy-plans and patientId is part of the DTO or handled by backend context.
    // If it IS nested: const { data: responseData } = await axiosInstance.post(`${API_URL}/patient/${patientId}`, data);
    // Based on provided backend doc:
    const { data: responseData } = await axiosInstance.post(API_URL, { ...data, patient_id: patientId }); // Assuming patient_id is part of the DTO now.
    return responseData;
  },

  getAllByPatient: async (patientId: string, queryParams?: QueryEnergyPlanDto): Promise<EnergyPlanResponseDto[]> => {
    const { data: responseData } = await axiosInstance.get(`${API_URL}/patient/${patientId}`, { params: queryParams });
    return responseData;
  },

  getById: async (id: string): Promise<EnergyPlanResponseDto> => {
    const { data: responseData } = await axiosInstance.get(`${API_URL}/${id}`);
    return responseData;
  },

  update: async (id: string, data: UpdateEnergyPlanDto): Promise<EnergyPlanResponseDto> => {
    const { data: responseData } = await axiosInstance.patch(`${API_URL}/${id}`, data);
    return responseData;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/${id}`);
  },
};

// (Optional) Service for lookup data
export const energyDataLookupsService = {
  getFormulas: async (): Promise<any[]> => { /* ... */ },
  getMetDefinitions: async (): Promise<any[]> => { /* ... */ },
};

4.2. React Query Hooks (hooks/useEnergyPlans.ts)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { energyPlanService } from '../services/energyPlanService';
import { CreateEnergyPlanDto, UpdateEnergyPlanDto, QueryEnergyPlanDto } from '../dto/energy-plan.dto';

const ENERGY_PLAN_QUERY_KEY = 'energyPlans';

export const usePatientEnergyPlans = (patientId: string, queryParams?: QueryEnergyPlanDto) => {
  return useQuery({
    queryKey: [ENERGY_PLAN_QUERY_KEY, patientId, queryParams],
    queryFn: () => energyPlanService.getAllByPatient(patientId, queryParams),
    enabled: !!patientId, // Only run query if patientId is available
  });
};

export const useEnergyPlanById = (energyPlanId?: string) => {
  return useQuery({
    queryKey: [ENERGY_PLAN_QUERY_KEY, energyPlanId],
    queryFn: () => energyPlanService.getById(energyPlanId!),
    enabled: !!energyPlanId,
  });
};

export const useCreateEnergyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { patientId: string; data: CreateEnergyPlanDto }) =>
      energyPlanService.create(params.patientId, params.data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch patient's energy plans list
      queryClient.invalidateQueries({ queryKey: [ENERGY_PLAN_QUERY_KEY, variables.patientId] });
      // Potentially update specific plan cache if needed
      queryClient.setQueryData([ENERGY_PLAN_QUERY_KEY, data.id], data);
    },
    // onError: (error) => { /* Handle error, e.g., show toast notification */ }
  });
};

export const useUpdateEnergyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; data: UpdateEnergyPlanDto; patientId: string }) => // patientId for invalidation
      energyPlanService.update(params.id, params.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENERGY_PLAN_QUERY_KEY, variables.patientId] });
      queryClient.setQueryData([ENERGY_PLAN_QUERY_KEY, data.id], data);
    },
  });
};

export const useDeleteEnergyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; patientId: string }) => // patientId for invalidation
      energyPlanService.delete(params.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENERGY_PLAN_QUERY_KEY, variables.patientId] });
      // Remove from specific cache if it exists
      queryClient.removeQueries({ queryKey: [ENERGY_PLAN_QUERY_KEY, variables.id] });
    },
  });
};

5. Workflow for EnergyPlanPage
Opening for New Plan:
Page opens with empty/default fields.
Patient data (birthdate, gender, current height/weight for prefill) might be fetched or passed as props.
Opening for Editing Plan (energyPlanId provided):
Use useEnergyPlanById(energyPlanId) hook to fetch plan data.
Once data is loaded, pre-fill all form fields.
User Interaction:
As user types in anthropometric fields, selects formulas, factors, or adjusts METs/VENTA:
Immediately recalculate ageAtCalculationYears.
Call calculateTMB() -> updates calculatedTmbKcal state.
Call calculateGET() -> updates calculatedGetKcal state.
The UI re-renders to show the new TMB/GET.
Saving:
User clicks "Salvar Cálculos".
Perform final client-side validation.
Construct the CreateEnergyPlanDto or UpdateEnergyPlanDto using all current form state values, including the calculatedTmbKcal and calculatedGetKcal.
Call createEnergyPlan.mutate(...) or updateEnergyPlan.mutate(...).
Handle loading state (disable save button, show spinner).
On success:
React Query invalidates relevant queries, refreshing lists.
Call onSaveSuccess prop.

Show success notification.
On error:
Show error notification.
6. Integration with Meal Planning Module (Future)
The MealPlan creation/editing UI will have an option to select an existing EnergyPlan for the patient.
This can be a dropdown populated by usePatientEnergyPlans(patientId).
Once an EnergyPlan is selected, its calculatedGetKcal (and calculatedTmbKcal) will be displayed as targets.
The meal planning UI will sum the calories/macros of added foods and compare them against these targets.
7. Important Considerations
DTO Alignment: Ensure frontend DTOs/interfaces for request/response payloads exactly match the backend DTOs (CreateEnergyPlanDto, EnergyPlanResponseDto, etc.).
Error Handling: Implement robust error handling for API calls (e.g., using onError in React Query mutations, displaying user-friendly messages).
Loading States: Provide clear visual feedback during API calls (loading spinners, disabled buttons).
Validation: Client-side validation for immediate feedback, but always rely on backend validation as the source of truth.
Debouncing: For inputs that trigger calculations (like weight/height), consider debouncing the calculation calls if performance becomes an issue on complex forms, though direct state updates are usually fine for this scope.
Lookup Data: Decide whether to hardcode formula/factor options on the frontend or fetch them from the backend. Fetching offers more flexibility if options change frequently.
Accessibility (a11y): Ensure all UI components are accessible.
This guide should provide a solid roadmap for the frontend team to build and integrate the Planejamento Energético feature.
```
