import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  UnfoldMore as UnfoldMoreIcon,
  Coffee as CoffeeIcon,
  Restaurant as RestaurantIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon,
  CalendarMonth as CalendarMonthIcon,
  MonitorWeight as MonitorWeightIcon,
  FitnessCenter as FitnessCenterIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mealPlanService,
  Meal,
  UpdateMeal,
} from "@/modules/meal-plan/services/mealPlanService";
import AddFoodToMealModal from "@/modules/meal-plan/components/AddFoodToMealModal";
import { useFoodDb } from "@/services/useFoodDb";
import type { MealFood } from "@/services/foodService";
import type { Alimento } from "@/modules/meal-plan/components/AddFoodToMealModal";
import MealCard from "@/modules/meal-plan/components/MealCard";
import MealMenu from "@/modules/meal-plan/components/MealMenu";
import NutrientAnalysis from "@/modules/meal-plan/components/NutrientAnalysis";
import { pdf } from "@react-pdf/renderer";
import { patientService } from "@/modules/patient/services/patientService";
import { authService } from "../../../auth/services/authService";
import { MealPlanPDF } from "@/modules/meal-plan/components/MealPlanPDF";
import { useEnergyPlan } from "../../hooks/useEnergyPlan";
import { calculateMacronutrientTargetsFromDistribution } from "../../utils/nutrientComparison";
import { usePatientEnergyPlans } from "@/modules/energy-plan/hooks/useEnergyPlans";
import {
  ACTIVITY_FACTOR_DESCRIPTIONS,
  INJURY_FACTOR_DESCRIPTIONS,
  FORMULA_DESCRIPTIONS,
} from "@/modules/energy-plan/constants/energyPlanConstants";
import { DesignSystemButton } from "../../../../components/DesignSystem/Button/ButtonVariants";

// Componente principal
export function MealPlanDetails() {
  const queryClient = useQueryClient();
  const { patientId, planId } = useParams<{
    patientId: string;
    planId: string;
  }>();
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [expandedMeals, setExpandedMeals] = useState<string[]>([]);
  const defaultMealsCreated = useRef(false);
  const [openAddFoodModal, setOpenAddFoodModal] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const { data: foodDbRaw } = useFoodDb();
  const foodDb: Alimento[] = Array.isArray(foodDbRaw) ? foodDbRaw : [];
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mealMenuId, setMealMenuId] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Template de refeições
  const [templates, setTemplates] = useState<
    { id: string; name: string; meal: Meal }[]
  >([]);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Meal | null>(null);

  // Carregar dados do plano alimentar
  const { data: plan, isLoading } = useQuery({
    queryKey: ["mealPlan", planId],
    queryFn: () => mealPlanService.getById(planId as string),
    enabled: !!planId,
  });

  // Carregar dados do paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId as string),
    enabled: !!patientId,
  });

  // Obter dados do nutricionista atual
  const { data: nutritionist } = useQuery({
    queryKey: ["currentNutritionist"],
    queryFn: () => {
      const userId = authService.getUser()?.id;
      return userId ? authService.getUser() : null;
    },
    enabled: !!authService.getUser()?.id,
  });

  // Carregar dados do plano energético
  const { data: energyPlan } = useEnergyPlan(patientId as string);

  // NOVO: Buscar todos os planos energéticos do paciente
  const { data: energyPlans } = usePatientEnergyPlans(patientId!);
  // NOVO: Estado para o plano energético selecionado
  const [selectedEnergyPlanId, setSelectedEnergyPlanId] = useState<
    string | null
  >(null);

  // NOVO: Definir o plano selecionado (por padrão, o mais recente)
  useEffect(() => {
    if (plan?.energyPlanId) {
      setSelectedEnergyPlanId(plan.energyPlanId);
    } else if (energyPlans && energyPlans.length > 0 && !selectedEnergyPlanId) {
      // Ordena do mais novo para o mais antigo
      const sorted = [...energyPlans].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSelectedEnergyPlanId(sorted[0].id);
    }
  }, [plan?.energyPlanId, energyPlans]);

  // NOVO: Atualizar o plano selecionado quando o plano for atualizado
  useEffect(() => {
    if (plan?.energyPlanId) {
      setSelectedEnergyPlanId(plan.energyPlanId);
    }
  }, [plan?.energyPlanId]);

  const selectedEnergyPlan =
    energyPlans?.find((plan) => plan.id === selectedEnergyPlanId) ||
    energyPlans?.[energyPlans.length - 1];

  const addMealMutation = useMutation({
    mutationFn: (newMeal: Omit<Meal, "id">) =>
      mealPlanService.addMeal(planId as string, newMeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
      setOpenMealDialog(false);
      setNewMealName("");
      setSelectedTime("12:00");
    },
  });

  const updateMealMutation = useMutation({
    mutationFn: ({
      planId,
      mealId,
      updatedMeal,
    }: {
      planId: string;
      mealId: string;
      updatedMeal: UpdateMeal;
    }) => mealPlanService.updateMeal(planId, mealId, updatedMeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
    },
  });

  // Adiciona refeições padrão se não existirem
  useEffect(() => {
    const createDefaultMeals = async () => {
      if (
        plan?.id &&
        plan.meals?.length === 0 &&
        !defaultMealsCreated.current
      ) {
        defaultMealsCreated.current = true;
        try {
          for (const meal of DEFAULT_MEALS) {
            await addMealMutation.mutateAsync({
              name: meal.name,
              time: formatTime(meal.time),
              notes: "",
              mealFoods: [],
            });
          }
        } catch {
          // Não resetamos o defaultMealsCreated aqui, pois queremos tentar apenas uma vez
        }
      }
    };

    createDefaultMeals();
  }, [plan?.id, addMealMutation]);

  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) =>
      mealPlanService.deleteMeal(planId as string, mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
    },
  });

  const handleAddMeal = () => {
    if (!newMealName || !selectedTime) return;
    addMealMutation.mutate({
      name: newMealName,
      time: formatTime(selectedTime),
      notes: "",
      mealFoods: [],
    });
  };

  const handleExpandMeal = (mealId: string) => {
    setExpandedMeals((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleExpandAll = () => {
    if (plan && plan.meals) {
      setExpandedMeals(plan.meals.map((m) => m.id));
    }
  };

  const handleCollapseAll = () => {
    setExpandedMeals([]);
  };

  const handleAddFood = (mealId: string) => {
    setSelectedMealId(mealId);
    setOpenAddFoodModal(true);
  };

  const handleEditMeal = (meal: Meal | undefined) => {
    if (!meal) return;
    setNewMealName(meal.name);
    setSelectedTime(meal.time);
    setMealMenuId(meal.id);
    setOpenMealDialog(true);
  };

  const handleUpdateMeal = () => {
    const mealToUpdate = plan?.meals?.find((m) => m.id === mealMenuId);
    if (mealToUpdate) {
      updateMealMutation.mutate({
        planId: planId as string,
        mealId: mealMenuId,
        updatedMeal: {
          ...mealToUpdate,
          name: newMealName,
          time: formatTime(selectedTime),
          mealFoods: mealToUpdate.mealFoods.map(
            ({ foodId, amount, unit, source }) => ({
              foodId,
              amount: Number(amount),
              unit,
              source: source || "manual",
            })
          ),
        },
      });
      setOpenMealDialog(false);
    }
  };

  const handleDuplicateMeal = (mealId: string) => {
    const mealToDuplicate = plan?.meals?.find((m) => m.id === mealId);
    if (mealToDuplicate) {
      addMealMutation.mutate({
        name: `${mealToDuplicate.name} (cópia)`,
        time: mealToDuplicate.time,
        notes: mealToDuplicate.notes,
        mealFoods: mealToDuplicate.mealFoods || [],
      });
    }
    setAnchorEl(null);
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    mealId: string
  ) => {
    setAnchorEl(event.currentTarget as HTMLElement);
    setMealMenuId(mealId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSaveAsTemplate = () => {
    const mealToSave = plan?.meals?.find((m) => m.id === mealMenuId);
    if (mealToSave) {
      setSelectedTemplate(mealToSave);
      setTemplateNameFromMeal(mealToSave);
      setOpenTemplateDialog(true);
    }
    setAnchorEl(null);
  };

  const setTemplateNameFromMeal = (meal: Meal) => {
    setTemplateName(`Template ${meal.name}`);
  };

  const saveTemplate = () => {
    if (templateName && selectedTemplate) {
      setTemplates([
        ...templates,
        {
          id: Date.now().toString(),
          name: templateName,
          meal: selectedTemplate,
        },
      ]);
      setOpenTemplateDialog(false);
      setTemplateName("");
    }
  };

  const convertMealFoodsToInitialFoods = (
    mealFoods: MealFood[] | undefined
  ): { food: Alimento; amount: number; mcIndex?: number }[] => {
    if (!Array.isArray(mealFoods) || !Array.isArray(foodDb)) return [];
    const seen = new Set();
    return mealFoods
      .filter((mf) => {
        if (seen.has(mf.foodId)) return false;
        seen.add(mf.foodId);
        return !!foodDb.find((f: Alimento) => f.id === mf.foodId);
      })
      .map((mf) => {
        const food = foodDb.find((f: Alimento) => f.id === mf.foodId)!;
        let mcIndex: number | undefined = undefined;
        let mcList = food.mc ? [...food.mc] : [];

        if (mcList && Array.isArray(mcList)) {
          mcIndex = mcList.findIndex(
            (mc: { nome_mc: string }) => mc.nome_mc === mf.unit
          );
          // Se não encontrou, adiciona medida temporária
          if (mcIndex === -1) {
            // Tenta usar o peso do próprio alimento se disponível, senão 1
            const peso =
              mf.unit.toLowerCase().includes("ml") ||
              mf.unit.toLowerCase().includes("mililitro")
                ? 1 // Para líquidos, normalmente 1ml = 1g
                : 1;
            mcList = [
              ...mcList,
              {
                nome_mc: mf.unit,
                peso: peso,
              },
            ];
            mcIndex = mcList.length - 1;
          }
        }

        // Retorna o alimento com a lista de medidas atualizada (se necessário)
        return {
          food: { ...food, mc: mcList },
          amount: mf.amount,
          mcIndex,
        };
      });
  };

  // Função para calcular os nutrientes totais do plano
  const calculateTotalNutrients = () => {
    if (!plan?.meals)
      return {
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        calories: 0,
        totalWeight: 0,
      };

    const nutrients = plan.meals.reduce(
      (acc, meal) => {
        const mealNutrients = meal.mealFoods.reduce(
          (mealAcc, mealFood) => {
            const food = foodDb.find((f) => f.id === mealFood.foodId);
            if (!food) return mealAcc;

            const amount = mealFood.amount;
            const mc = food.mc?.find((m) => m.nome_mc === mealFood.unit);
            if (!mc) return mealAcc;

            // Calcula o fator de conversão baseado no peso da medida caseira
            const conversionFactor = Number(mc.peso) / 100;

            return {
              protein:
                mealAcc.protein +
                Number(food.ptn || 0) * amount * conversionFactor,
              fat:
                mealAcc.fat + Number(food.lip || 0) * amount * conversionFactor,
              carbohydrates:
                mealAcc.carbohydrates +
                Number(food.cho || 0) * amount * conversionFactor,
              calories:
                mealAcc.calories +
                Number(food.kcal || 0) * amount * conversionFactor,
              totalWeight: mealAcc.totalWeight + amount * Number(mc.peso),
            };
          },
          { protein: 0, fat: 0, carbohydrates: 0, calories: 0, totalWeight: 0 }
        );

        return {
          protein: acc.protein + mealNutrients.protein,
          fat: acc.fat + mealNutrients.fat,
          carbohydrates: acc.carbohydrates + mealNutrients.carbohydrates,
          calories: acc.calories + mealNutrients.calories,
          totalWeight: acc.totalWeight + mealNutrients.totalWeight,
        };
      },
      { protein: 0, fat: 0, carbohydrates: 0, calories: 0, totalWeight: 0 }
    );

    // Adiciona metas do plano energético se disponível
    if (energyPlan) {
      const targets = calculateMacronutrientTargetsFromDistribution(
        Number(energyPlan.calculatedGetKcal),
        Number(energyPlan.macronutrientDistribution?.proteins),
        Number(energyPlan.macronutrientDistribution?.fats),
        Number(energyPlan.macronutrientDistribution?.carbs)
      );
      const result = {
        ...nutrients,
        targetCalories: Number(energyPlan.calculatedGetKcal),
        tmb: Number(energyPlan.calculatedTmbKcal),
        targetProtein: Number(targets.protein),
        targetFat: Number(targets.fat),
        targetCarbohydrates: Number(targets.carbohydrates),
        targetProteinPercentage: Number(
          energyPlan.macronutrientDistribution?.proteins ?? undefined
        ),
        targetFatPercentage: Number(
          energyPlan.macronutrientDistribution?.fats ?? undefined
        ),
        targetCarbohydratesPercentage: Number(
          energyPlan.macronutrientDistribution?.carbs ?? undefined
        ),
      };
      return result;
    }

    return nutrients;
  };

  // Função para salvar o plano alimentar
  const handleSaveMealPlan = async () => {
    if (!plan) {
      setSnackbar({
        open: true,
        message: "Plano alimentar não encontrado.",
        severity: "error",
      });
      return;
    }

    try {
      const totalNutrients = calculateTotalNutrients();
      const updatedPlan = await mealPlanService.updatePlan(plan.id, {
        energyPlanId: selectedEnergyPlanId || undefined,
        dailyCalories: totalNutrients.calories,
        dailyProtein: totalNutrients.protein,
        dailyCarbs: totalNutrients.carbohydrates,
        dailyFat: totalNutrients.fat,
      });

      // Atualiza o estado local com o novo energyPlanId
      setSelectedEnergyPlanId(updatedPlan.energyPlanId || null);

      await queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
      setSnackbar({
        open: true,
        message: "Plano alimentar salvo com sucesso!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao salvar plano alimentar. Tente novamente.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Função para abrir o PDF em nova aba
  const handleOpenPdfInNewTab = async () => {
    if (plan && foodDb) {
      const sortedMeals = [...(plan.meals || [])].sort((a, b) => {
        const timeA = a.time.split(":").map(Number);
        const timeB = b.time.split(":").map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
      const totalNutrients = calculateTotalNutrients();
      const pdfDataObj = {
        plan,
        mealsByTime: sortedMeals,
        patientData: patient,
        nutritionistData: nutritionist,
        totalNutrients,
        foodDb,
      };
      const blob = await pdf(<MealPlanPDF {...pdfDataObj} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const [openEnergyPlanModal, setOpenEnergyPlanModal] = useState(false);

  const handleOpenEnergyPlanModal = () => {
    setOpenEnergyPlanModal(true);
  };

  const handleCloseEnergyPlanModal = () => {
    setOpenEnergyPlanModal(false);
  };

  const handleSelectEnergyPlan = (planId: string) => {
    setSelectedEnergyPlanId(planId);
    setOpenEnergyPlanModal(false);
  };

  const navigate = useNavigate();

  const handleCreateNewEnergyPlan = () => {
    navigate(`/patient/${patientId}/energy-plans/new`);
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Typography>Carregando...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!plan) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Typography color="error">Plano não encontrado</Typography>
      </Box>
    );
  }

  const sortedMeals = [...(plan.meals || [])].sort((a, b) => {
    const timeA = a.time.split(":").map(Number);
    const timeB = b.time.split(":").map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  const selectedMeal = plan.meals?.find((m) => m.id === selectedMealId);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 1 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2, gap: { xs: 1.5, sm: 0 } }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              fontSize: { xs: "1.3rem", sm: "2rem" },
            }}
          >
            Plano Alimentar
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" } }}
          >
            {plan.name}
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            variant="outlined"
            startIcon={
              expandedMeals.length === sortedMeals.length ? (
                <ExpandMoreIcon />
              ) : (
                <UnfoldMoreIcon />
              )
            }
            onClick={
              expandedMeals.length === sortedMeals.length
                ? handleCollapseAll
                : handleExpandAll
            }
            size={"large"}
            fullWidth
            sx={{ fontWeight: 600, fontSize: 16, py: 0 }}
          >
            {expandedMeals.length === sortedMeals.length
              ? "Recolher tudo"
              : "Expandir tudo"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setNewMealName("");
              setSelectedTime("12:00");
              setMealMenuId("");
              setOpenMealDialog(true);
            }}
            size={"large"}
            color="success"
            fullWidth
            sx={{ fontWeight: 600, fontSize: 16, py: 0 }}
          >
            Nova refeição
          </Button>
        </Stack>
      </Stack>

      {/* Lista de Refeições */}
      <Box
        sx={{
          borderRadius: { xs: 2, sm: 2 },
          overflow: "hidden",
          mb: 3,
          bgcolor: "transparent",
          p: { xs: 0.5, sm: 0 },
        }}
      >
        {sortedMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            foodDb={foodDb}
            expanded={expandedMeals.includes(meal.id)}
            onExpand={handleExpandMeal}
            onAddFood={handleAddFood}
            onOpenMenu={handleOpenMenu}
          />
        ))}
      </Box>

      {/* Análise de Nutrientes Total */}
      <Box sx={{ mb: 3 }}>
        <NutrientAnalysis
          {...calculateTotalNutrients()}
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
          onEnergyPlanChange={handleOpenEnergyPlanModal}
          patientId={patientId as string}
        />
      </Box>

      {/* Botões Salvar e Ver planejamento em PDF */}
      <Stack direction="column" spacing={2} sx={{ width: "100%", mb: 2 }}>
        <DesignSystemButton
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveMealPlan}
        >
          Salvar
        </DesignSystemButton>
        <DesignSystemButton
          variant="outlined"
          color="secondary"
          startIcon={<PdfIcon />}
          onClick={handleOpenPdfInNewTab}
        >
          Ver planejamento em PDF
        </DesignSystemButton>
      </Stack>

      {/* Dialog para adicionar/editar refeição */}
      <Dialog
        open={openMealDialog}
        onClose={() => setOpenMealDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {mealMenuId ? "Editar refeição" : "Adicionar nova refeição"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome da refeição"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Horário"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMealDialog(false)}>Cancelar</Button>
          <Button
            onClick={mealMenuId ? handleUpdateMeal : handleAddMeal}
            variant="contained"
            color="primary"
            startIcon={mealMenuId ? <SaveIcon /> : <AddIcon />}
          >
            {mealMenuId ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu de opções da refeição */}
      <MealMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onEdit={() =>
          handleEditMeal(plan.meals?.find((m) => m.id === mealMenuId))
        }
        onAddFood={() => handleAddFood(mealMenuId)}
        onDuplicate={() => handleDuplicateMeal(mealMenuId)}
        onSaveAsTemplate={handleSaveAsTemplate}
        onDelete={() => deleteMealMutation.mutate(mealMenuId)}
        hasTemplates={templates.length > 0}
      />

      {/* Dialog para salvar template */}
      <Dialog
        open={openTemplateDialog}
        onClose={() => setOpenTemplateDialog(false)}
      >
        <DialogTitle>Salvar como template</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do template"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Cancelar</Button>
          <Button onClick={saveTemplate} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para adicionar alimentos */}
      <AddFoodToMealModal
        open={openAddFoodModal}
        onClose={() => setOpenAddFoodModal(false)}
        planId={plan.id}
        mealId={selectedMealId || ""}
        mealName={selectedMeal?.name || ""}
        mealTime={selectedMeal?.time || "08:00"}
        initialFoods={convertMealFoodsToInitialFoods(selectedMeal?.mealFoods)}
        initialNotes={selectedMeal?.notes}
        onSave={async () => {
          await queryClient.invalidateQueries({
            queryKey: ["mealPlan", planId],
          });
          setOpenAddFoodModal(false);
        }}
      />

      {/* Modal de Seleção de Plano Energético */}
      <Dialog
        open={openEnergyPlanModal}
        onClose={handleCloseEnergyPlanModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Selecione um Plano Energético
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {energyPlans?.map((plan) => {
              const formula =
                FORMULA_DESCRIPTIONS[
                  plan.formulaKey as keyof typeof FORMULA_DESCRIPTIONS
                ]?.name || plan.formulaKey;
              const activity =
                ACTIVITY_FACTOR_DESCRIPTIONS[
                  plan.activityFactorKey as keyof typeof ACTIVITY_FACTOR_DESCRIPTIONS
                ]?.name || plan.activityFactorKey;
              const injury =
                INJURY_FACTOR_DESCRIPTIONS[
                  plan.injuryFactorKey as keyof typeof INJURY_FACTOR_DESCRIPTIONS
                ]?.name || plan.injuryFactorKey;
              const tmbValue =
                plan.calculatedTmbKcal !== null &&
                plan.calculatedTmbKcal !== undefined &&
                !isNaN(Number(plan.calculatedTmbKcal))
                  ? Number(plan.calculatedTmbKcal)
                  : null;
              const getValue =
                plan.calculatedGetKcal !== null &&
                plan.calculatedGetKcal !== undefined &&
                !isNaN(Number(plan.calculatedGetKcal))
                  ? Number(plan.calculatedGetKcal)
                  : null;

              return (
                <Card
                  key={plan.id}
                  elevation={1}
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor:
                      plan.id === selectedEnergyPlanId
                        ? "primary.main"
                        : "divider",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 4,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Cabeçalho */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {plan.name || "Plano energético"}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <CalendarMonthIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Resultados Principais */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 3,
                        flexWrap: "wrap",
                        mb: 2,
                        p: 1.5,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ minWidth: "150px" }}>
                        <Typography
                          variant="caption"
                          fontWeight={500}
                          color="text.secondary"
                          sx={{ fontSize: 12 }}
                        >
                          TAXA METABÓLICA BASAL (TMB)
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="primary.main"
                          sx={{ mt: 0.5, fontSize: 22 }}
                        >
                          {tmbValue !== null
                            ? `${tmbValue} kcal`
                            : "Não calculado"}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: "150px" }}>
                        <Typography
                          variant="caption"
                          fontWeight={500}
                          color="text.secondary"
                          sx={{ fontSize: 12 }}
                        >
                          GASTO ENERGÉTICO TOTAL (GET)
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="primary.main"
                          sx={{ mt: 0.5, fontSize: 22 }}
                        >
                          {getValue !== null
                            ? `${getValue} kcal`
                            : "Não calculado"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Informações da Fórmula */}
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      fontWeight={700}
                      sx={{ mb: 1.5, fontSize: 17 }}
                    >
                      Fórmula: {formula}
                    </Typography>

                    {/* Dados Físicos */}
                    <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <MonitorWeightIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {plan.weightAtCalculationKg} kg
                        </Typography>
                      </Box>
                      {plan.fatFreeMassAtCalculationKg !== undefined && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <FitnessCenterIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={500}>
                            Massa magra: {plan.fatFreeMassAtCalculationKg} kg
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Fatores */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(42,139,139,0.1)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="primary.main"
                        >
                          Atividade física
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ mt: 0.5 }}
                        >
                          {activity}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: "rgba(42,139,139,0.1)",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="primary.main"
                        >
                          Fator clínico
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ mt: 0.5 }}
                        >
                          {injury}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions
                    sx={{
                      justifyContent: "flex-end",
                      pt: 0,
                      pb: 2,
                      px: 2,
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleSelectEnergyPlan(plan.id)}
                    >
                      Escolher este plano
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNewEnergyPlan}
            startIcon={<AddIcon />}
          >
            Novo Plano Energético
          </Button>
          <Button onClick={handleCloseEnergyPlanModal}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Constantes necessárias para o componente
const DEFAULT_MEALS = [
  { name: "Café da manhã", time: "07:00", icon: <CoffeeIcon /> },
  { name: "Almoço", time: "12:00", icon: <RestaurantIcon /> },
  { name: "Jantar", time: "19:00", icon: <RestaurantIcon /> },
];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};
