import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  List,
  ListItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ViewList as ViewListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  UnfoldMore as UnfoldMoreIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealPlanService } from "../../services/mealPlanService";

const DEFAULT_MEALS = [
  { name: "Café da manhã", time: "07:00" },
  { name: "Almoço", time: "12:00" },
  { name: "Jantar", time: "19:00" },
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

  const { data: plan, isLoading } = useQuery({
    queryKey: ["mealPlan", planId],
    queryFn: () => mealPlanService.getById(planId as string),
    enabled: !!planId,
  });

  const addMealMutation = useMutation({
    mutationFn: (newMeal: { name: string; time: string; notes: string }) =>
      mealPlanService.addMeal(planId as string, newMeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
      setOpenMealDialog(false);
      setNewMealName("");
      setSelectedTime("12:00");
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
        console.log("Creating default meals for plan:", plan.id);
        try {
          for (const meal of DEFAULT_MEALS) {
            console.log("Adding meal:", meal);
            await addMealMutation.mutateAsync({
              name: meal.name,
              time: formatTime(meal.time),
              notes: "",
            });
          }
        } catch (error) {
          console.error("Erro ao criar refeição padrão:", error);
          // Não resetamos o defaultMealsCreated aqui, pois queremos tentar apenas uma vez
        }
      }
    };

    createDefaultMeals();
  }, [plan?.id, addMealMutation]); // Removemos plan?.meals?.length das dependências

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
    });
  };

  const handleExpandMeal = (mealId: string) => {
    setExpandedMeals((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Typography>Carregando...</Typography>
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

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Rotina do paciente
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<UnfoldMoreIcon />}
          onClick={() => setExpandedMeals(sortedMeals.map((m) => m.id))}
          sx={{ bgcolor: "grey.500", "&:hover": { bgcolor: "grey.600" } }}
        >
          expandir tudo
        </Button>
        <Button
          variant="contained"
          startIcon={<SortIcon />}
          sx={{ bgcolor: "grey.500", "&:hover": { bgcolor: "grey.600" } }}
        >
          reordenar por horário
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ bgcolor: "grey.100", borderRadius: 1 }}>
        <List disablePadding>
          {sortedMeals.map((meal, index) => (
            <ListItem
              key={meal.id}
              sx={{
                py: 1,
                px: 2,
                borderBottom:
                  index < sortedMeals.length - 1 ? "1px solid" : "none",
                borderColor: "grey.300",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", flex: 1, gap: 2 }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleExpandMeal(meal.id)}
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

                <Typography sx={{ minWidth: 80 }}>{meal.time}</Typography>
                <Typography sx={{ flex: 1 }}>{meal.name}</Typography>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => {}}
                    sx={{ color: "primary.main" }}
                  >
                    <ViewListIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {}}
                    sx={{ color: "primary.main" }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => deleteMealMutation.mutate(meal.id)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenMealDialog(true)}
        sx={{
          mt: 2,
          width: "100%",
          bgcolor: "success.main",
          "&:hover": { bgcolor: "success.dark" },
        }}
      >
        nova refeição ou hábito
      </Button>

      <Dialog open={openMealDialog} onClose={() => setOpenMealDialog(false)}>
        <DialogTitle>Adicionar nova refeição</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField
              label="Nome da refeição"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              fullWidth
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
          <Button onClick={handleAddMeal} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
