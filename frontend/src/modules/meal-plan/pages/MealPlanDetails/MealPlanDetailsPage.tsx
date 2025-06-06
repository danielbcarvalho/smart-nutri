import React, { useState, useEffect, useRef } from "react";
import {
  useParams,
  useNavigate,
  useOutletContext,
  useLocation,
} from "react-router-dom";
import {
  Box,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Add as AddIcon, Save as SaveIcon } from "@mui/icons-material";
import { FloatingSaveButton } from "@/components/FloatingSaveButton";

import {
  mealPlanService,
  Meal,
  UpdateMeal,
  CreateMeal,
} from "@/modules/meal-plan/services/mealPlanService";
import { useFoodDb } from "@/services/useFoodDb";
import type { MealFood } from "@/services/foodService";
import {
  AddFoodToMealModal,
  type Alimento,
} from "@/modules/meal-plan/components/AddFoodToMealModal";
import { pdf } from "@react-pdf/renderer";
import { patientService } from "@/modules/patient/services/patientService";
import { authService } from "../../../auth/services/authService";
import { MealPlanPDF } from "@/modules/meal-plan/components/MealPlanPDF";
import { useEnergyPlan } from "../../hooks/useEnergyPlan";
import { calculateMacronutrientTargetsFromDistribution } from "../../utils/nutrientComparison";
import { usePatientEnergyPlans } from "@/modules/energy-plan/hooks/useEnergyPlans";
import { MealPlanHeader } from "./components/MealPlanHeader";
import MealList from "./components/MealList";
import { NutrientAnalysisSection } from "./components/NutrientAnalysisSection";
import AddSubstituteModal from "../../components/AddSubstituteModal";
import {
  ACTIVITY_FACTOR_DESCRIPTIONS,
  FORMULA_DESCRIPTIONS,
  INJURY_FACTOR_DESCRIPTIONS,
} from "../../../energy-plan/constants/energyPlanConstants";
import MealMenu from "../../components/MealMenu";
import { PatientInstructionsCard } from "./components/PatientInstructionsCard";
import { calculateTotalNutrients as calculateTotalNutrientsFromUtils } from "../../utils/nutrientCalculations";
import { SaveAsTemplateModal } from "../../components/SaveAsTemplateModal";

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
  const { showNotification } = useOutletContext<{
    showNotification: (
      message: string,
      severity?: "success" | "error" | "info" | "warning"
    ) => void;
  }>();

  // Adicionar estados
  const [patientInstructions, setPatientInstructions] = useState("");
  const [isCreatingDefaultMeals, setIsCreatingDefaultMeals] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isSavingRef = useRef(false);
  const [saveAsTemplateModalOpen, setSaveAsTemplateModalOpen] = useState(false);

  // Carregar dados do plano alimentar
  const { data: plan, isLoading } = useQuery({
    queryKey: ["mealPlan", planId],
    queryFn: () => mealPlanService.getById(planId as string),
    enabled: !!planId,
  });

  // Efeito para carregar as instruções do paciente
  useEffect(() => {
    if (plan?.description) {
      setPatientInstructions(plan.description);
    }
  }, [plan?.description]);

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

  // Buscar todos os planos energéticos do paciente
  const { data: energyPlans } = usePatientEnergyPlans(patientId!);
  const [selectedEnergyPlanId, setSelectedEnergyPlanId] = useState<
    string | null
  >(null);

  // Definir o plano selecionado (por padrão, o mais recente)
  useEffect(() => {
    if (plan?.energyPlanId) {
      setSelectedEnergyPlanId(plan.energyPlanId);
    } else if (energyPlans && energyPlans.length > 0 && !selectedEnergyPlanId) {
      const sorted = [...energyPlans].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSelectedEnergyPlanId(sorted[0].id);
    }
  }, [plan?.energyPlanId, energyPlans]);

  // Atualizar o plano selecionado quando o plano for atualizado
  useEffect(() => {
    if (plan?.energyPlanId) {
      setSelectedEnergyPlanId(plan.energyPlanId);
    }
  }, [plan?.energyPlanId]);

  const selectedEnergyPlan =
    energyPlans?.find((plan) => plan.id === selectedEnergyPlanId) ||
    energyPlans?.[energyPlans.length - 1];

  const addMealMutation = useMutation({
    mutationFn: (newMeal: CreateMeal) =>
      mealPlanService.addMeal(planId as string, newMeal),
    onMutate: () => {
      console.log("addMealMutation - Iniciando mutation");
    },
    onSuccess: () => {
      console.log("addMealMutation - Sucesso");
      queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
      setOpenMealDialog(false);
      setNewMealName("");
      setSelectedTime("12:00");
      // Só mostra a notificação se não estiver criando refeições padrão
      if (!isCreatingDefaultMeals) {
        showNotification("Refeição adicionada com sucesso!", "success");
      }
    },
    onError: () => {
      console.log("addMealMutation - Erro");
      showNotification("Erro ao adicionar refeição. Tente novamente.", "error");
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
        setIsCreatingDefaultMeals(true);
        try {
          for (const meal of DEFAULT_MEALS) {
            await addMealMutation.mutateAsync({
              name: meal.name,
              time: formatTime(meal.time),
              notes: "",
              mealType: meal.mealType,
              isActiveForCalculation: true,
              totalCalories: 0,
              totalProtein: 0,
              totalCarbs: 0,
              totalFat: 0,
              mealFoods: [],
            } as CreateMeal);
          }
        } catch {
          // Não resetamos o defaultMealsCreated aqui, pois queremos tentar apenas uma vez
        } finally {
          setIsCreatingDefaultMeals(false);
        }
      }
    };

    createDefaultMeals();
  }, [plan?.id, addMealMutation]);

  const convertMealFoodsToInitialFoods = (
    mealFoods: MealFood[] | undefined
  ): {
    food: Alimento;
    amount: number;
    mcIndex?: number;
    substitutes?: { food: Alimento; amount: number; mcIndex?: number }[];
  }[] => {
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

        // Processa os substitutos se existirem
        const substitutes = mf.substitutes
          ?.map((substitute) => {
            const substituteFood = foodDb.find(
              (f: Alimento) => f.id === substitute.substituteFoodId
            );
            if (!substituteFood) return null;

            let substituteMcIndex: number | undefined = undefined;
            let substituteMcList = substituteFood.mc
              ? [...substituteFood.mc]
              : [];

            if (substituteMcList && Array.isArray(substituteMcList)) {
              substituteMcIndex = substituteMcList.findIndex(
                (mc: { nome_mc: string }) =>
                  mc.nome_mc === substitute.substituteUnit
              );
              if (substituteMcIndex === -1) {
                const peso =
                  substitute.substituteUnit.toLowerCase().includes("ml") ||
                  substitute.substituteUnit.toLowerCase().includes("mililitro")
                    ? 1
                    : 1;
                substituteMcList = [
                  ...substituteMcList,
                  {
                    nome_mc: substitute.substituteUnit,
                    peso: peso,
                  },
                ];
                substituteMcIndex = substituteMcList.length - 1;
              }
            }

            return {
              food: { ...substituteFood, mc: substituteMcList },
              amount: Number(substitute.substituteAmount),
              mcIndex: substituteMcIndex,
            };
          })
          .filter(Boolean) as {
          food: Alimento;
          amount: number;
          mcIndex?: number;
        }[];

        // Retorna o alimento com a lista de medidas atualizada e os substitutos
        return {
          food: { ...food, mc: mcList },
          amount: mf.amount,
          mcIndex,
          substitutes: substitutes.length > 0 ? substitutes : undefined,
        };
      });
  };

  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) =>
      mealPlanService.deleteMeal(planId as string, mealId),
    onMutate: () => {
      console.log("deleteMealMutation - Iniciando mutation");
    },
    onSuccess: () => {
      console.log("deleteMealMutation - Sucesso");
      queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
      showNotification("Refeição excluída com sucesso!", "success");
    },
    onError: () => {
      console.log("deleteMealMutation - Erro");
      showNotification("Erro ao excluir refeição. Tente novamente.", "error");
    },
  });

  const handleAddMeal = () => {
    if (!newMealName || !selectedTime) {
      showNotification("Preencha todos os campos obrigatórios.", "warning");
      return;
    }
    addMealMutation.mutate({
      name: newMealName,
      time: formatTime(selectedTime),
      notes: "",
      mealType: "other",
      isActiveForCalculation: true,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealFoods: [],
    } as CreateMeal);
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

  const handleEditMeal = (meal: Meal) => {
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
        name: `${mealToDuplicate.name} (opção)`,
        time: mealToDuplicate.time,
        notes: mealToDuplicate.notes,
        mealType: mealToDuplicate.mealType,
        isActiveForCalculation: false,
        totalCalories: mealToDuplicate.totalCalories,
        totalProtein: mealToDuplicate.totalProtein,
        totalCarbs: mealToDuplicate.totalCarbs,
        totalFat: mealToDuplicate.totalFat,
        mealFoods: mealToDuplicate.mealFoods || [],
      } as CreateMeal);
    }
  };

  // Modificar a função calculateTotalNutrients para usar a função centralizada
  const calculateTotalNutrients = () => {
    if (!plan?.meals) {
      return {
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        calories: 0,
        totalWeight: 0,
      };
    }

    // Aplica as mudanças locais de isActiveForCalculation
    const mealsWithLocalChanges = plan.meals.map((meal) => ({
      ...meal,
      isActiveForCalculation:
        localMealChanges[meal.id] !== undefined
          ? localMealChanges[meal.id]
          : meal.isActiveForCalculation,
    }));

    const nutrients = calculateTotalNutrientsFromUtils(
      mealsWithLocalChanges,
      foodDb
    );

    if (energyPlan) {
      const targets = calculateMacronutrientTargetsFromDistribution(
        Number(energyPlan.calculatedGetKcal),
        Number(energyPlan.macronutrientDistribution?.proteins),
        Number(energyPlan.macronutrientDistribution?.fats),
        Number(energyPlan.macronutrientDistribution?.carbs)
      );
      return {
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
    }

    return nutrients;
  };

  // Adicionar estado local para controlar as mudanças
  const [localMealChanges, setLocalMealChanges] = useState<
    Record<string, boolean>
  >({});

  // Modificar o handler para atualizar apenas o estado local
  const handleToggleCalculation = (mealId: string, isActive: boolean) => {
    setLocalMealChanges((prev) => ({
      ...prev,
      [mealId]: isActive,
    }));
    setHasUnsavedChanges(true);
  };

  // Modificar a função de salvar para incluir as mudanças de cálculo
  const handleSaveMealPlan = async (showSuccessNotification: boolean = true) => {
    if (!plan) {
      showNotification("Plano alimentar não encontrado.", "error");
      return;
    }

    try {
      const totalNutrients = calculateTotalNutrients();

      const updatedMeals = plan.meals.map((meal) => ({
        ...meal,
        isActiveForCalculation:
          localMealChanges[meal.id] !== undefined
            ? localMealChanges[meal.id]
            : meal.isActiveForCalculation,
        mealFoods: meal.mealFoods.map((mealFood) => ({
          ...mealFood,
          substitutes:
            mealFood.substitutes?.map((substitute) => {
              const substituteFood = foodDb.find(
                (f) => f.id === substitute.substituteFoodId
              );
              return {
                id: substitute.id,
                originalFoodId: mealFood.foodId,
                originalSource: mealFood.source,
                substituteFoodId: substitute.substituteFoodId,
                substituteSource: substitute.substituteSource || "taco",
                substituteAmount: String(substitute.substituteAmount),
                substituteUnit: substitute.substituteUnit,
                nutritionistId: nutritionist?.id || "",
                createdAt: substitute.createdAt,
                updatedAt: substitute.updatedAt,
                foodId: substitute.substituteFoodId,
                source: substitute.substituteSource || "taco",
                name: substituteFood?.nome || "",
                amount: Number(substitute.substituteAmount),
                unit: substitute.substituteUnit,
              };
            }) || [],
        })),
      }));

      const updatedPlan = await mealPlanService.updatePlan(plan.id, {
        energyPlanId: selectedEnergyPlanId || undefined,
        dailyCalories: totalNutrients.calories,
        dailyProtein: totalNutrients.protein,
        dailyCarbs: totalNutrients.carbohydrates,
        dailyFat: totalNutrients.fat,
        description: patientInstructions,
        meals: updatedMeals,
      });

      setSelectedEnergyPlanId(updatedPlan.energyPlanId || null);
      setLocalMealChanges({});
      setHasUnsavedChanges(false);

      await queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
      
      // Only show success notification if explicitly requested (manual save)
      if (showSuccessNotification) {
        showNotification("Plano alimentar salvo com sucesso!", "success");
      }
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      showNotification(
        "Erro ao salvar plano alimentar. Tente novamente.",
        "error"
      );
      throw error; // Re-throw para que o autoSave saiba que falhou
    }
  };

  // Função para abrir o PDF em nova aba
  const handleOpenPdfInNewTab = async () => {
    if (plan && foodDb) {
      const sortedMeals = [...(plan.meals || [])].sort((a, b) => {
        const timeA = a.time.split(":").map(Number);
        const timeB = b.time.split(":").map(Number);
        const timeComparison =
          timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);

        // Se os horários forem iguais, ordena pelo nome
        if (timeComparison === 0) {
          // Se uma refeição for duplicada (contém "opção"), ela deve vir depois da original
          const aIsOption = a.name.includes("(opção)");
          const bIsOption = b.name.includes("(opção)");

          if (aIsOption && !bIsOption) return 1;
          if (!aIsOption && bIsOption) return -1;

          // Se ambas forem opções ou nenhuma for opção, ordena alfabeticamente
          return a.name.localeCompare(b.name);
        }

        return timeComparison;
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

  const handleCreateNewEnergyPlan = () => {
    navigate(`/patient/${patientId}/energy-plans/new`);
  };

  const handleSaveAsTemplate = () => {
    setSaveAsTemplateModalOpen(true);
  };

  // Adicionar estados
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [selectedMealFood, setSelectedMealFood] = useState<MealFood | null>(
    null
  );

  // Efeito para detectar mudanças
  useEffect(() => {
    if (plan) {
      const hasLocalChanges = Object.keys(localMealChanges).length > 0;
      const hasInstructionsChanges = patientInstructions !== plan.description;
      setHasUnsavedChanges(hasLocalChanges || hasInstructionsChanges);
    }
  }, [localMealChanges, patientInstructions, plan]);

  // Função para salvar automaticamente
  const autoSave = async () => {
    if (hasUnsavedChanges && !isSavingRef.current) {
      isSavingRef.current = true;
      try {
        await handleSaveMealPlan(false); // Don't show notification for auto-save
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Erro ao salvar automaticamente:", error);
      } finally {
        isSavingRef.current = false;
      }
    }
  };

  // Efeito para salvar quando o usuário sair da página
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        await autoSave();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Efeito para salvar quando mudar de rota
  useEffect(() => {
    const handleRouteChange = async () => {
      if (hasUnsavedChanges) {
        await autoSave();
      }
    };

    return () => {
      handleRouteChange();
    };
  }, [location.pathname, hasUnsavedChanges]);

  // Modificar a função setPatientInstructions
  const handleInstructionsChange = (instructions: string) => {
    setPatientInstructions(instructions);
    setHasUnsavedChanges(true);
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
    const timeComparison =
      timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);

    // Se os horários forem iguais, ordena pelo nome
    if (timeComparison === 0) {
      // Se uma refeição for duplicada (contém "opção"), ela deve vir depois da original
      const aIsOption = a.name.includes("(opção)");
      const bIsOption = b.name.includes("(opção)");

      if (aIsOption && !bIsOption) return 1;
      if (!aIsOption && bIsOption) return -1;

      // Se ambas forem opções ou nenhuma for opção, ordena alfabeticamente
      return a.name.localeCompare(b.name);
    }

    return timeComparison;
  });

  const selectedMeal = plan.meals?.find((m) => m.id === selectedMealId);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 1 } }}>
      <MealPlanHeader
        planName={plan.name}
        expandedMealsCount={expandedMeals.length}
        totalMealsCount={sortedMeals.length}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onAddMeal={() => {
          setNewMealName("");
          setSelectedTime("12:00");
          setMealMenuId("");
          setOpenMealDialog(true);
        }}
      />

      <MealList
        meals={sortedMeals.map((meal) => ({
          ...meal,
          isActiveForCalculation:
            localMealChanges[meal.id] !== undefined
              ? localMealChanges[meal.id]
              : meal.isActiveForCalculation,
        }))}
        foodDb={foodDb}
        expandedMeals={expandedMeals}
        onExpandMeal={handleExpandMeal}
        onAddFood={handleAddFood}
        onToggleCalculation={handleToggleCalculation}
        onEdit={handleEditMeal}
        onDuplicate={handleDuplicateMeal}
      />

      <PatientInstructionsCard
        instructions={patientInstructions}
        onSave={handleInstructionsChange}
      />

      <NutrientAnalysisSection
        totalNutrients={calculateTotalNutrients()}
        selectedEnergyPlan={selectedEnergyPlan}
        energyPlans={energyPlans}
        onEnergyPlanChange={handleOpenEnergyPlanModal}
        onSave={handleSaveMealPlan}
        onOpenPdf={handleOpenPdfInNewTab}
        onSaveAsTemplate={handleSaveAsTemplate}
        patientId={patientId as string}
      />

      {/* Botão flutuante de salvar */}
      <FloatingSaveButton onClick={handleSaveMealPlan} />

      {/* Menu de opções da refeição */}
      <MealMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onEdit={() =>
          handleEditMeal(plan.meals?.find((m) => m.id === mealMenuId) as Meal)
        }
        onAddFood={() => handleAddFood(mealMenuId)}
        onDuplicate={() => handleDuplicateMeal(mealMenuId)}
        onDelete={() => deleteMealMutation.mutate(mealMenuId)}
        isLoading={addMealMutation.isPending || deleteMealMutation.isPending}
      />

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
                        {/* <CalendarMonthIcon
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        /> */}
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
                        {/* <MonitorWeightIcon fontSize="small" color="action" /> */}
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
                          {/* <FitnessCenterIcon fontSize="small" color="action" /> */}
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
            // startIcon={<AddIcon />}
          >
            Novo Plano Energético
          </Button>
          <Button onClick={handleCloseEnergyPlanModal}>Cancelar</Button>
        </DialogActions>
      </Dialog>

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

      {/* Modal de Substitutos */}
      <AddSubstituteModal
        open={substituteModalOpen}
        onClose={() => {
          setSubstituteModalOpen(false);
          setSelectedMealFood(null);
        }}
        mealFoodId={selectedMealFood?.id || ""}
        originalFood={
          selectedMealFood
            ? {
                name:
                  foodDb.find((f) => f.id === selectedMealFood.foodId)?.nome ||
                  "",
                amount: selectedMealFood.amount,
                unit: selectedMealFood.unit,
              }
            : { name: "", amount: 0, unit: "" }
        }
        onSubstituteAdded={() => {
          queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
        }}
      />

      {/* Modal para salvar como template */}
      <SaveAsTemplateModal
        open={saveAsTemplateModalOpen}
        onClose={() => setSaveAsTemplateModalOpen(false)}
        mealPlanId={plan.id}
        mealPlanName={plan.name}
        onSuccess={() => {
          showNotification("Template salvo com sucesso!", "success");
          setSaveAsTemplateModalOpen(false);
        }}
      />
    </Box>
  );
}

// Constantes necessárias para o componente
const DEFAULT_MEALS = [
  { name: "Café da manhã", time: "07:00", mealType: "breakfast" },
  { name: "Almoço", time: "12:00", mealType: "lunch" },
  { name: "Jantar", time: "19:00", mealType: "dinner" },
];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};
