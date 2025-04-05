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
    time: "10:00",
    name: "Lanche da manhã",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  },
  {
    id: "3",
    time: "12:00",
    name: "Almoço",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  },
  {
    id: "4",
    time: "15:00",
    name: "Lanche da tarde",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  },
  {
    id: "5",
    time: "18:00",
    name: "Jantar",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  },
  {
    id: "6",
    time: "21:00",
    name: "Ceia",
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
        <Typography variant="h6" sx={{ mb: 3 }}>
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
            <Typography variant="subtitle1" fontWeight={500}>
              Rotina do paciente
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "primary.light",
                    color: "white",
                  },
                }}
              >
                expandir tudo
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "primary.light",
                    color: "white",
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
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton
                    size="small"
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>

                  <TextField
                    size="small"
                    type="time"
                    value={meal.time}
                    sx={{
                      width: 85,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "divider",
                        },
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      flex: 1,
                      color: "text.primary",
                      fontWeight: 500,
                    }}
                  >
                    {meal.name}
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="body2" color="error.main">
                        P: {meal.macros.protein}g
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        C: {meal.macros.carbs}g
                      </Typography>
                      <Typography variant="body2" color="info.main">
                        G: {meal.macros.fat}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meal.calories} Kcal
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: "primary.main",
                        color: "primary.main",
                        "&:hover": {
                          borderColor: "primary.dark",
                          bgcolor: "primary.light",
                          color: "white",
                        },
                      }}
                    >
                      ver alimentos
                    </Button>

                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "warning.main" },
                        }}
                      >
                        <StarIcon fontSize="small" />
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
              width: "100%",
              borderStyle: "dashed",
              color: "primary.main",
              "&:hover": {
                borderStyle: "dashed",
                bgcolor: "primary.light",
                color: "white",
              },
            }}
          >
            Adicionar Refeição
          </Button>
        </Box>
      </Box>
    );
  }

  if (plans.length === 0 || showNewPlanForm) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" gutterBottom align="center">
          Escolha um nome e a metodologia
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              label="Nome do cardápio"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="Ex: Cardápio Semanal"
              helperText="Se não informado, será usado 'Cardápio personalizado'"
              sx={{ mb: 3 }}
            />

            <ToggleButtonGroup
              value={selectedType}
              exclusive
              onChange={handleTypeChange}
              aria-label="metodologia de prescrição"
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton
                value="alimentos"
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.main",
                    },
                  },
                }}
              >
                Por alimentos
              </ToggleButton>
              <ToggleButton
                value="equivalentes"
                disabled
                sx={{
                  opacity: 0.7,
                  "&.Mui-disabled": {
                    color: "text.secondary",
                  },
                }}
              >
                Por equivalentes (em breve)
              </ToggleButton>
              <ToggleButton
                value="qualitativa"
                disabled
                sx={{
                  opacity: 0.7,
                  "&.Mui-disabled": {
                    color: "text.secondary",
                  },
                }}
              >
                Qualitativa (em breve)
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedType === "alimentos" && "Prescrição por alimentos:"}
                {selectedType === "equivalentes" && (
                  <Box sx={{ color: "warning.main" }}>
                    Prescrição por equivalentes (Em desenvolvimento)
                  </Box>
                )}
                {selectedType === "qualitativa" && (
                  <Box sx={{ color: "warning.main" }}>
                    Prescrição qualitativa (Em desenvolvimento)
                  </Box>
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedType === "alimentos" &&
                  "você prescreve o alimento em si, determinando a quantidade e a medida caseira, com precisão no cálculo de macro e micronutrientes."}
                {selectedType === "equivalentes" &&
                  "Esta funcionalidade estará disponível em breve. Por enquanto, utilize a prescrição por alimentos."}
                {selectedType === "qualitativa" &&
                  "Esta funcionalidade estará disponível em breve. Por enquanto, utilize a prescrição por alimentos."}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleCreatePlan}
              disabled={selectedType !== "alimentos"}
              sx={{ mt: 2 }}
            >
              avançar
            </Button>
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
