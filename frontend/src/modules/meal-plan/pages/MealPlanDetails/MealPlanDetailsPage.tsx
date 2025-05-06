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
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Sort as SortIcon,
  UnfoldMore as UnfoldMoreIcon,
  ContentCopy as ContentCopyIcon,
  Coffee as CoffeeIcon,
  Restaurant as RestaurantIcon,
  Search as SearchIcon,
  Save as SaveIcon,
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

const DEFAULT_MEALS = [
  { name: "Café da manhã", time: "07:00", icon: <CoffeeIcon /> },
  { name: "Almoço", time: "12:00", icon: <RestaurantIcon /> },
  { name: "Jantar", time: "19:00", icon: <RestaurantIcon /> },
];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

export function MealPlanDetails() {
  const queryClient = useQueryClient();
  const { planId } = useParams<{ planId: string }>();
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [expandedMeals, setExpandedMeals] = useState<string[]>([]);
  const defaultMealsCreated = useRef(false);
  const [openAddFoodModal, setOpenAddFoodModal] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const { data: foodDbRaw } = useFoodDb();
  const foodDb: Alimento[] = Array.isArray(foodDbRaw) ? foodDbRaw : [];
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mealMenuId, setMealMenuId] = useState("");

  // Template de refeições
  const [templates, setTemplates] = useState<
    { id: string; name: string; meal: Meal }[]
  >([]);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Meal | null>(null);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["mealPlan", planId],
    queryFn: () => mealPlanService.getById(planId as string),
    enabled: !!planId,
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
          mealFoods: mealToUpdate.mealFoods.map(({ foodId, amount, unit }) => ({
            foodId,
            amount,
            unit,
          })),
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
        if (food.mc && Array.isArray(food.mc)) {
          mcIndex = food.mc.findIndex(
            (mc: { nome_mc: string }) => mc.nome_mc === mf.unit
          );
          if (mcIndex === -1) mcIndex = undefined;
        }
        return {
          food,
          amount: mf.amount,
          mcIndex,
        };
      });
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
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography
        variant="h5"
        sx={{ mb: 2, display: "flex", alignItems: "center" }}
      >
        <RestaurantIcon sx={{ mr: 1 }} /> Plano Alimentar
      </Typography>

      {/* Barra de Ferramentas */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          mb: 3,
          flexWrap: "wrap",
          gap: 1,
          bgcolor: "background.paper",
          borderRadius: 1,
          p: 1,
          boxShadow: 1,
        }}
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
          size="small"
        >
          {expandedMeals.length === sortedMeals.length
            ? "Recolher tudo"
            : "Expandir tudo"}
        </Button>
        <Button variant="outlined" startIcon={<SortIcon />} size="small">
          Ordenar por horário
        </Button>
        <Button variant="outlined" startIcon={<ContentCopyIcon />} size="small">
          Duplicar plano
        </Button>
        <TextField
          placeholder="Buscar alimentos..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ ml: { sm: "auto" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Lista de Refeições */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
          bgcolor: "transparent",
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

      {/* Botão para adicionar nova refeição */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          setNewMealName("");
          setSelectedTime("12:00");
          setMealMenuId("");
          setOpenMealDialog(true);
        }}
        sx={{
          width: "100%",
          py: 1.5,
          bgcolor: "success.main",
          "&:hover": { bgcolor: "success.dark" },
        }}
      >
        Nova refeição ou hábito
      </Button>

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
        onSave={() => {
          setOpenAddFoodModal(false);
          queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
        }}
      />
    </Box>
  );
}
