import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Star as StarIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

interface MealPlan {
  id: string;
  name: string;
  type: "alimentos" | "equivalentes" | "qualitativa";
  createdAt: string;
  updatedAt: string;
}

interface Meal {
  id: string;
  time: string;
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const DEFAULT_MEALS: Meal[] = [
  {
    id: "1",
    time: "08:00",
    name: "Café da manhã",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  },
  {
    id: "2",
    time: "12:00",
    name: "Almoço",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  },
  {
    id: "3",
    time: "18:00",
    name: "Jantar",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  },
];

export function MealPlan() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [newPlanName, setNewPlanName] = useState("");
  const [selectedType, setSelectedType] = useState<
    "alimentos" | "equivalentes" | "qualitativa"
  >("alimentos");
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);
  const [showMealRoutine, setShowMealRoutine] = useState(false);
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: "alimentos" | "equivalentes" | "qualitativa"
  ) => {
    if (newType !== null) {
      setSelectedType(newType);
    }
  };

  const handleCreatePlan = () => {
    const planName = newPlanName.trim() || "Cardápio personalizado";
    setShowMealRoutine(true);
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: String(meals.length + 1),
      time: "00:00",
      name: "Nova Refeição",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
    };
    setMeals([...meals, newMeal]);
  };

  if (showMealRoutine) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, color: "text.primary" }}>
          Plano Alimentar
        </Typography>

        {/* Meal List */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={500}
              color="text.primary"
            >
              Rotina do paciente
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "custom.main",
                  color: "custom.main",
                  "&:hover": {
                    borderColor: "custom.dark",
                    bgcolor: "custom.lightest",
                  },
                }}
              >
                expandir tudo
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "custom.main",
                  color: "custom.main",
                  "&:hover": {
                    borderColor: "custom.dark",
                    bgcolor: "custom.lightest",
                  },
                }}
              >
                reordenar por horário
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            {meals.map((meal) => (
              <Box
                key={meal.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "custom.lightest",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton
                    size="small"
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "custom.main" },
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                  <TextField
                    size="small"
                    type="time"
                    value={meal.time}
                    sx={{ width: 100 }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      flex: 1,
                      color: "text.primary",
                      fontWeight: 500,
                    }}
                  >
                    {meal.name}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "custom.main" },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "custom.main" },
                      }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMeal}
            sx={{
              mt: 2,
              borderColor: "custom.main",
              color: "custom.main",
              "&:hover": {
                borderColor: "custom.dark",
                bgcolor: "custom.lightest",
              },
            }}
          >
            Adicionar refeição
          </Button>
        </Box>
      </Box>
    );
  }

  if (plans.length === 0 || showNewPlanForm) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, color: "text.primary" }}>
          Criar novo plano alimentar
        </Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nome do plano"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Ex: Cardápio personalizado"
              />

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  Tipo de plano
                </Typography>
                <ToggleButtonGroup
                  value={selectedType}
                  exclusive
                  onChange={handleTypeChange}
                  aria-label="tipo de plano"
                  size="small"
                >
                  <ToggleButton
                    value="alimentos"
                    sx={{
                      "&.Mui-selected": {
                        bgcolor: "custom.lightest",
                        color: "custom.main",
                        "&:hover": {
                          bgcolor: "custom.lightest",
                        },
                      },
                    }}
                  >
                    Alimentos
                  </ToggleButton>
                  <ToggleButton
                    value="equivalentes"
                    sx={{
                      "&.Mui-selected": {
                        bgcolor: "custom.lightest",
                        color: "custom.main",
                        "&:hover": {
                          bgcolor: "custom.lightest",
                        },
                      },
                    }}
                  >
                    Equivalentes
                  </ToggleButton>
                  <ToggleButton
                    value="qualitativa"
                    sx={{
                      "&.Mui-selected": {
                        bgcolor: "custom.lightest",
                        color: "custom.main",
                        "&:hover": {
                          bgcolor: "custom.lightest",
                        },
                      },
                    }}
                  >
                    Qualitativa
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Button
                variant="contained"
                onClick={handleCreatePlan}
                sx={{
                  bgcolor: "custom.main",
                  color: "common.white",
                  "&:hover": {
                    bgcolor: "custom.dark",
                  },
                }}
              >
                Criar plano
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Planos Alimentares</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowNewPlanForm(true)}
        >
          nova prescrição alimentar
        </Button>
      </Stack>

      <Stack spacing={2}>
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <RestaurantIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Criado em: {new Date(plan.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Editar">
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Favoritar">
                    <IconButton>
                      <StarIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicar">
                    <IconButton>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
