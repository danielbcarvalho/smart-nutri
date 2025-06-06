import React from "react";
import { Box, Stack } from "@mui/material";
import {
  Save as SaveIcon,
  PictureAsPdf as PdfIcon,
  BookmarkAdd as BookmarkAddIcon,
} from "@mui/icons-material";
import NutrientAnalysis from "@/modules/meal-plan/components/NutrientAnalysis";
import { DesignSystemButton } from "@/components/DesignSystem/Button/ButtonVariants";
import type { EnergyPlan } from "@/modules/energy-plan/types/energyPlan";

interface NutrientAnalysisSectionProps {
  totalNutrients: {
    protein: number;
    fat: number;
    carbohydrates: number;
    calories: number;
    totalWeight: number;
    targetCalories?: number;
    tmb?: number;
    targetProtein?: number;
    targetFat?: number;
    targetCarbohydrates?: number;
    targetProteinPercentage?: number;
    targetFatPercentage?: number;
    targetCarbohydratesPercentage?: number;
  };
  selectedEnergyPlan?: EnergyPlan;
  energyPlans?: EnergyPlan[];
  onEnergyPlanChange: () => void;
  onSave: () => void;
  onOpenPdf: () => void;
  onSaveAsTemplate?: () => void;
  patientId: string;
}

export function NutrientAnalysisSection({
  totalNutrients,
  selectedEnergyPlan,
  energyPlans,
  onEnergyPlanChange,
  onSave,
  onOpenPdf,
  onSaveAsTemplate,
  patientId,
}: NutrientAnalysisSectionProps) {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <NutrientAnalysis
          {...totalNutrients}
          targetCalories={selectedEnergyPlan?.calculatedGetKcal}
          tmb={selectedEnergyPlan?.calculatedTmbKcal}
          targetProteinPercentage={
            selectedEnergyPlan?.macronutrientDistribution?.proteins
          }
          targetFatPercentage={
            selectedEnergyPlan?.macronutrientDistribution?.fats
          }
          targetCarbohydratesPercentage={
            selectedEnergyPlan?.macronutrientDistribution?.carbs
          }
          selectedEnergyPlan={
            selectedEnergyPlan
              ? {
                  id: selectedEnergyPlan.id,
                  name: selectedEnergyPlan.name,
                  createdAt: selectedEnergyPlan.createdAt,
                }
              : undefined
          }
          energyPlans={energyPlans?.map((plan) => ({
            id: plan.id,
            name: plan.name,
            createdAt: plan.createdAt,
          }))}
          onEnergyPlanChange={onEnergyPlanChange}
          patientId={patientId}
        />
      </Box>

      <Stack direction="column" spacing={2} sx={{ width: "100%", mb: 2 }}>
        <DesignSystemButton
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={onSave}
        >
          Salvar
        </DesignSystemButton>
        <DesignSystemButton
          variant="outlined"
          color="secondary"
          startIcon={<PdfIcon />}
          onClick={onOpenPdf}
        >
          Ver planejamento em PDF
        </DesignSystemButton>
        {onSaveAsTemplate && (
          <DesignSystemButton
            variant="outlined"
            color="primary"
            startIcon={<BookmarkAddIcon />}
            onClick={onSaveAsTemplate}
          >
            Salvar como template
          </DesignSystemButton>
        )}
      </Stack>
    </>
  );
}
