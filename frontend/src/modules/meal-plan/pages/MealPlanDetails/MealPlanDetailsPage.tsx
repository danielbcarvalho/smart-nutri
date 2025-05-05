import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Badge,
  Tooltip,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  LinearProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  UnfoldMore as UnfoldMoreIcon,
  DragHandle as DragHandleIcon,
  ContentCopy as ContentCopyIcon,
  Fastfood as FastfoodIcon,
  Coffee as CoffeeIcon,
  Restaurant as RestaurantIcon,
  Cake as CakeIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  NoteAdd as NoteAddIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mealPlanService,
  Meal,
} from "@/modules/meal-plan/services/mealPlanService";
import AddFoodToMealModal from "@/modules/meal-plan/components/AddFoodToMealModal";
import { useFoodDb } from "@/services/useFoodDb";
import type { MealFood } from "@/services/foodService";
import type { Alimento } from "@/modules/meal-plan/components/AddFoodToMealModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const DEFAULT_MEALS = [
  { name: "Café da manhã", time: "07:00", icon: <CoffeeIcon /> },
  { name: "Lanche da manhã", time: "10:00", icon: <CakeIcon /> },
  { name: "Almoço", time: "12:00", icon: <RestaurantIcon /> },
  { name: "Lanche da tarde", time: "16:00", icon: <FastfoodIcon /> },
  { name: "Jantar", time: "19:00", icon: <RestaurantIcon /> },
  { name: "Ceia", time: "21:00", icon: <CakeIcon /> },
];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

// Cores para os diferentes tipos de refeição
const getMealTypeColor = (mealName: string) => {
  const name = mealName.toLowerCase();
  if (name.includes("café")) return "#FF9800"; // Laranja
  if (name.includes("almoço")) return "#4CAF50"; // Verde
  if (name.includes("jantar")) return "#2196F3"; // Azul
  if (name.includes("lanche")) return "#9C27B0"; // Roxo
  if (name.includes("ceia")) return "#795548"; // Marrom
  return "#607D8B"; // Cinza-azulado para outros
};

// Ícone para cada tipo de refeição
const getMealIcon = (mealName: string) => {
  const name = mealName.toLowerCase();
  if (name.includes("café")) return <CoffeeIcon />;
  if (name.includes("almoço")) return <RestaurantIcon />;
  if (name.includes("jantar")) return <RestaurantIcon />;
  if (name.includes("lanche")) return <FastfoodIcon />;
  if (name.includes("ceia")) return <CakeIcon />;
  return <FastfoodIcon />;
};

// Componente para exibir o resumo nutricional da refeição
const MealNutritionSummary = ({ mealFoods, foodDb }) => {
  const nutritionSummary = useMemo(() => {
    if (!Array.isArray(mealFoods) || !Array.isArray(foodDb)) return null;

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    mealFoods.forEach((mealFood) => {
      const food = foodDb.find((f) => f.id === mealFood.foodId);
      if (!food) return;

      const amount = mealFood.amount;
      calories += ((food.energia?.kcal || 0) * amount) / 100;
      protein += ((food.proteina || 0) * amount) / 100;
      carbs += ((food.carboidrato?.total || 0) * amount) / 100;
      fat += ((food.lipideos?.total || 0) * amount) / 100;
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      macroDistribution: {
        protein: protein * 4, // 4 kcal por grama de proteína
        carbs: carbs * 4, // 4 kcal por grama de carboidrato
        fat: fat * 9, // 9 kcal por grama de gordura
      },
    };
  }, [mealFoods, foodDb]);

  if (!nutritionSummary) return null;

  const totalMacroCalories =
    nutritionSummary.macroDistribution.protein +
    nutritionSummary.macroDistribution.carbs +
    nutritionSummary.macroDistribution.fat;

  return (
    <Card variant="outlined" sx={{ mt: 2, mb: 2 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="subtitle2" gutterBottom>
          Resumo Nutricional
        </Typography>
        <Typography variant="h6" color="primary.main" gutterBottom>
          {nutritionSummary.calories} kcal
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            Proteínas: {nutritionSummary.protein}g
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(
              (nutritionSummary.macroDistribution.protein /
                totalMacroCalories) *
                100
            )}
            %
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.round(
            (nutritionSummary.macroDistribution.protein / totalMacroCalories) *
              100
          )}
          color="secondary"
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            Carboidratos: {nutritionSummary.carbs}g
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(
              (nutritionSummary.macroDistribution.carbs / totalMacroCalories) *
                100
            )}
            %
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.round(
            (nutritionSummary.macroDistribution.carbs / totalMacroCalories) *
              100
          )}
          color="warning"
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            Gorduras: {nutritionSummary.fat}g
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(
              (nutritionSummary.macroDistribution.fat / totalMacroCalories) *
                100
            )}
            %
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.round(
            (nutritionSummary.macroDistribution.fat / totalMacroCalories) * 100
          )}
          color="info"
          sx={{ height: 6, borderRadius: 3 }}
        />
      </CardContent>
    </Card>
  );
};

// Componente para exibir um alimento (sem edição inline)
const MealFoodItem = ({ mealFood, foodDb }) => {
  const foodDetails = Array.isArray(foodDb)
    ? foodDb.find((f) => f.id === mealFood.foodId)
    : null;

  const foodName = foodDetails
    ? foodDetails.nome
    : `Alimento ID: ${mealFood.foodId}`;

  const nutritionInfo = foodDetails
    ? {
        calories: Math.round(
          ((foodDetails.energia?.kcal || 0) * mealFood.amount) / 100
        ),
        protein: Math.round(
          ((foodDetails.proteina || 0) * mealFood.amount) / 100
        ),
        carbs: Math.round(
          ((foodDetails.carboidrato?.total || 0) * mealFood.amount) / 100
        ),
        fat: Math.round(
          ((foodDetails.lipideos?.total || 0) * mealFood.amount) / 100
        ),
      }
    : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        borderRadius: 1,
        mb: 0.5,
        "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
      }}
    >
      <Typography variant="body2" sx={{ width: 70 }}>
        {mealFood.amount}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ width: 70 }}>
        {mealFood.unit}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {foodName}
      </Typography>

      {nutritionInfo && (
        <Tooltip
          title={
            <Box>
              <Typography variant="caption">
                Calorias: {nutritionInfo.calories} kcal
              </Typography>
              <Typography variant="caption">
                Proteína: {nutritionInfo.protein}g
              </Typography>
              <Typography variant="caption">
                Carboidratos: {nutritionInfo.carbs}g
              </Typography>
              <Typography variant="caption">
                Gorduras: {nutritionInfo.fat}g
              </Typography>
            </Box>
          }
        >
          <Chip
            label={`${nutritionInfo.calories} kcal`}
            size="small"
            variant="outlined"
            sx={{ height: 24 }}
          />
        </Tooltip>
      )}
    </Box>
  );
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
  const { data: foodDb } = useFoodDb();
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [mealMenuId, setMealMenuId] = useState("");

  // Template de refeições
  const [templates, setTemplates] = useState([]);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
    mutationFn: (updatedMeal: Meal) =>
      mealPlanService.updateMeal(planId as string, updatedMeal),
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
        ...mealToUpdate,
        name: newMealName,
        time: formatTime(selectedTime),
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

  const handleOpenMenu = (event, mealId) => {
    setAnchorEl(event.currentTarget);
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

  const setTemplateNameFromMeal = (meal) => {
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

  const applyTemplate = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template && mealMenuId) {
      const meal = plan?.meals?.find((m) => m.id === mealMenuId);
      if (meal) {
        updateMealMutation.mutate({
          ...meal,
          mealFoods: template.meal.mealFoods || [],
        });
      }
    }
    handleCloseMenu();
  };

  const handleDragEnd = (result) => {
    if (!result.destination || !plan?.meals) return;

    const reorderedMeals = Array.from(plan.meals);
    const [removed] = reorderedMeals.splice(result.source.index, 1);
    reorderedMeals.splice(result.destination.index, 0, removed);

    // Aqui você precisaria implementar uma lógica para atualizar a ordem no servidor
    // Por enquanto, vamos fingir que temos um endpoint que aceita uma lista de IDs reordenados
    console.log(
      "Reordenação: ",
      reorderedMeals.map((m) => m.id)
    );
  };

  function convertMealFoodsToInitialFoods(
    mealFoods: MealFood[] | undefined
  ): { food: Alimento; amount: number; mcIndex?: number }[] {
    if (!Array.isArray(mealFoods) || !Array.isArray(foodDb)) return [];
    return mealFoods
      .filter((mf) => !!foodDb.find((f: Alimento) => f.id === mf.foodId))
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
  }

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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="meals">
          {(provided) => (
            <Paper
              elevation={0}
              sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {sortedMeals.map((meal, index) => (
                <Draggable key={meal.id} draggableId={meal.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      elevation={1}
                      sx={{
                        mb: 2,
                        borderLeft: `4px solid ${getMealTypeColor(meal.name)}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: 3,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        {/* Cabeçalho da Refeição */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            cursor: "pointer",
                            bgcolor: expandedMeals.includes(meal.id)
                              ? "rgba(0,0,0,0.03)"
                              : "transparent",
                          }}
                          onClick={() => handleExpandMeal(meal.id)}
                        >
                          <IconButton
                            size="small"
                            {...provided.dragHandleProps}
                            sx={{ mr: 1, color: "text.secondary" }}
                          >
                            <DragHandleIcon fontSize="small" />
                          </IconButton>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mr: 2,
                            }}
                          >
                            {getMealIcon(meal.name)}
                          </Box>

                          <Typography fontWeight="medium" sx={{ width: 100 }}>
                            {meal.time}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            sx={{ flex: 1, fontWeight: "medium" }}
                          >
                            {meal.name}
                          </Typography>

                          <Badge
                            badgeContent={meal.mealFoods?.length || 0}
                            color="primary"
                            sx={{ mr: 2 }}
                          >
                            <FastfoodIcon color="action" />
                          </Badge>

                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandMeal(meal.id);
                            }}
                          >
                            <ExpandMoreIcon
                              sx={{
                                transform: expandedMeals.includes(meal.id)
                                  ? "rotate(180deg)"
                                  : "none",
                                transition: "transform 0.2s",
                              }}
                            />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMenu(e, meal.id);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>

                        {/* Conteúdo Expandido */}
                        {expandedMeals.includes(meal.id) && (
                          <Box>
                            <Divider />

                            <Box sx={{ p: 2 }}>
                              {/* Botão de Ação Principal */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  mb: 2,
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddFood(meal.id);
                                  }}
                                >
                                  Adicionar Alimento
                                </Button>
                              </Box>

                              {/* Lista de Alimentos */}
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: meal.mealFoods?.length ? 2 : 0,
                                  mb: 2,
                                }}
                              >
                                {meal.mealFoods && meal.mealFoods.length > 0 ? (
                                  <Box>
                                    {/* Cabeçalho da Lista */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        mb: 1,
                                        borderBottom:
                                          "1px solid rgba(0,0,0,0.1)",
                                        pb: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{ width: 70, fontWeight: "bold" }}
                                      >
                                        Qtde
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ width: 70, fontWeight: "bold" }}
                                      >
                                        Unidade
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ flex: 1, fontWeight: "bold" }}
                                      >
                                        Alimento
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ width: 100, fontWeight: "bold" }}
                                      >
                                        Calorias
                                      </Typography>
                                    </Box>

                                    {/* Itens (apenas leitura) */}
                                    {meal.mealFoods.map((mealFood) => (
                                      <MealFoodItem
                                        key={mealFood.id || mealFood.foodId}
                                        mealFood={mealFood}
                                        foodDb={foodDb}
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      p: 4,
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      color: "text.secondary",
                                    }}
                                  >
                                    <FastfoodIcon
                                      sx={{ fontSize: 40, mb: 2, opacity: 0.5 }}
                                    />
                                    <Typography variant="body2" gutterBottom>
                                      Nenhum alimento adicionado a esta
                                      refeição.
                                    </Typography>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<AddIcon />}
                                      onClick={() => handleAddFood(meal.id)}
                                      sx={{ mt: 1 }}
                                    >
                                      Adicionar alimento
                                    </Button>
                                  </Box>
                                )}
                              </Paper>

                              {/* Resumo Nutricional */}
                              {meal.mealFoods && meal.mealFoods.length > 0 && (
                                <MealNutritionSummary
                                  mealFoods={meal.mealFoods}
                                  foodDb={foodDb}
                                />
                              )}

                              {/* Notas da Refeição */}
                              {meal.notes && (
                                <Box
                                  sx={{
                                    p: 2,
                                    bgcolor: "rgba(255, 243, 224, 0.5)",
                                    borderRadius: 1,
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <InfoIcon
                                    fontSize="small"
                                    color="action"
                                    sx={{ mr: 1, mt: 0.3 }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {meal.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Paper>
          )}
        </Droppable>
      </DragDropContext>

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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            handleEditMeal(plan.meals?.find((m) => m.id === mealMenuId));
            handleCloseMenu();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar refeição
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleAddFood(mealMenuId);
            handleCloseMenu();
          }}
        >
          <AddIcon fontSize="small" sx={{ mr: 1 }} />
          Adicionar alimento
        </MenuItem>
        <MenuItem onClick={() => handleDuplicateMeal(mealMenuId)}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicar refeição
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSaveAsTemplate}>
          <SaveIcon fontSize="small" sx={{ mr: 1 }} />
          Salvar como template
        </MenuItem>
        {templates.length > 0 && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Implementar menu para selecionar templates
            }}
          >
            <NoteAddIcon fontSize="small" sx={{ mr: 1 }} />
            Aplicar template
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            deleteMealMutation.mutate(mealMenuId);
            handleCloseMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir refeição
        </MenuItem>
      </Menu>

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
          queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
          setOpenAddFoodModal(false);
        }}
      />
    </Box>
  );
}
