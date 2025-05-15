// Primeiro, vamos adicionar as importações necessárias para o PDF
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  UnfoldMore as UnfoldMoreIcon,
  Coffee as CoffeeIcon,
  Restaurant as RestaurantIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mealPlanService,
  Meal,
  UpdateMeal,
  MealPlan,
} from "@/modules/meal-plan/services/mealPlanService";
import AddFoodToMealModal from "@/modules/meal-plan/components/AddFoodToMealModal";
import { useFoodDb } from "@/services/useFoodDb";
import type { MealFood } from "@/services/foodService";
import type { Alimento } from "@/modules/meal-plan/components/AddFoodToMealModal";
import MealCard from "@/modules/meal-plan/components/MealCard";
import MealMenu from "@/modules/meal-plan/components/MealMenu";
import NutrientAnalysis from "@/modules/meal-plan/components/NutrientAnalysis";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { patientService } from "@/modules/patient/services/patientService";
import type { Patient } from "@/modules/patient/services/patientService";
import { authService } from "../../../auth/services/authService";
import { MealPlanPDF } from "@/modules/meal-plan/components/MealPlanPDF";

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

  // Estados para o PDF
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<{
    plan: MealPlan;
    mealsByTime: Meal[];
    patientData?: Patient;
    nutritionistData?: {
      name?: string;
      crn?: string;
      email?: string;
    } | null;
    totalNutrients: {
      protein: number;
      fat: number;
      carbohydrates: number;
      calories: number;
      totalWeight: number;
    };
    foodDb: Alimento[];
  } | null>(null);

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

    return plan.meals.reduce(
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
  };

  // Função para gerar o PDF
  const handleGeneratePDF = () => {
    setIsPdfGenerating(true);

    // Organizar os dados para o PDF
    if (plan && foodDb) {
      // Ordenar refeições por horário
      const sortedMeals = [...(plan.meals || [])].sort((a, b) => {
        const timeA = a.time.split(":").map(Number);
        const timeB = b.time.split(":").map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });

      const totalNutrients = calculateTotalNutrients();

      // Preparar dados para o PDF
      const pdfDataObj = {
        plan,
        mealsByTime: sortedMeals,
        patientData: patient,
        nutritionistData: nutritionist,
        totalNutrients,
        foodDb,
      };

      setPdfData(pdfDataObj);
      setShowPdfPreview(true);
      setIsPdfGenerating(false);
    } else {
      setIsPdfGenerating(false);
      // Mostrar mensagem de erro se os dados não estiverem disponíveis
      alert("Não foi possível gerar o PDF. Dados incompletos.");
    }
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
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2, gap: { xs: 1.5, sm: 0 } }}
      >
        <Box>
          <Typography
            variant="h5"
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
          spacing={1.5}
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
            sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "0.95rem" } }}
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
            sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "0.95rem" } }}
          >
            Nova refeição ou hábito
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
        <NutrientAnalysis {...calculateTotalNutrients()} />
      </Box>

      {/* Botão Salvar e ver planejamento */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<PdfIcon />}
        onClick={handleGeneratePDF}
        disabled={isPdfGenerating}
        sx={{
          width: "100%",
          py: { xs: 2, sm: 1.5 },
          fontWeight: 600,
          fontSize: { xs: 18, sm: 18 },
          bgcolor: "custom.main",
          borderRadius: 2,
          mb: 2,
          "&:hover": {
            bgcolor: "custom.dark",
          },
        }}
      >
        {isPdfGenerating ? "Gerando PDF..." : "Salvar e ver planejamento"}
      </Button>

      {/* Dialog de visualização do PDF */}
      <Dialog
        open={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        fullScreen
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "custom.main",
            color: "white",
          }}
        >
          <Typography variant="h6">Visualização do Plano Alimentar</Typography>
          <Stack direction="row" spacing={1}>
            {pdfData && (
              <PDFDownloadLink
                document={<MealPlanPDF {...pdfData} />}
                fileName={`plano-alimentar-${patient?.name || "paciente"}.pdf`}
                style={{ textDecoration: "none" }}
              >
                {({ loading }) => (
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={loading}
                    startIcon={<SaveIcon />}
                  >
                    {loading ? "Carregando..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
            <Button
              variant="outlined"
              onClick={() => setShowPdfPreview(false)}
              sx={{ color: "white", borderColor: "white" }}
            >
              Fechar
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "calc(100vh - 64px)" }}>
          {pdfData ? (
            <PDFViewer style={{ width: "100%", height: "100%" }}>
              <MealPlanPDF {...pdfData} />
            </PDFViewer>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography>Carregando visualização...</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Backdrop enquanto gera o PDF */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isPdfGenerating}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>
            Gerando PDF do plano alimentar...
          </Typography>
        </Box>
      </Backdrop>

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
