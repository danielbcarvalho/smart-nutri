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
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Star as StarIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuMealId, setMenuMealId] = useState<string | null>(null);

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

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    mealId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuMealId(mealId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuMealId(null);
  };

  if (showMealRoutine) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: "text.primary",
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
          }}
        >
          Plano Alimentar
        </Typography>
        {/* Meal List */}
        <Box>
          <Stack
            direction={isMobile ? "column" : "row"}
            justifyContent={isMobile ? "flex-start" : "space-between"}
            alignItems={isMobile ? "stretch" : "center"}
            sx={{ mb: 2, gap: { xs: 2, sm: 0 } }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={500}
              color="text.primary"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              Rotina do paciente
            </Typography>
            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={2}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                variant="outlined"
                size={isMobile ? "large" : "small"}
                fullWidth={isMobile}
                sx={{
                  borderColor: "custom.primary",
                  color: "custom.primary",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "0.95rem" },
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
                size={isMobile ? "large" : "small"}
                fullWidth={isMobile}
                sx={{
                  borderColor: "custom.primary",
                  color: "custom.primary",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "0.95rem" },
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

          <Stack spacing={2}>
            {meals.map((meal) => (
              <Box
                key={meal.id}
                sx={{
                  p: { xs: 2, sm: 2 },
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: isMobile ? 1 : 0,
                  mx: { xs: 0, sm: 0 },
                  mb: 1,
                  width: "100%",
                  "&:hover": {
                    bgcolor: "custom.lightest",
                  },
                }}
              >
                <Stack
                  direction={isMobile ? "column" : "row"}
                  alignItems={isMobile ? "stretch" : "center"}
                  spacing={2}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: isMobile ? 1 : 0 }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "custom.primary" },
                      }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      size="small"
                      type="time"
                      value={meal.time}
                      sx={{ width: 100 }}
                      inputProps={{ style: { fontSize: isMobile ? 18 : 14 } }}
                    />
                  </Stack>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      flex: 1,
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: { xs: "1.1rem", sm: "1rem" },
                      mb: isMobile ? 1 : 0,
                    }}
                  >
                    {meal.name}
                  </Typography>
                  {isMobile ? (
                    <>
                      <IconButton
                        size="large"
                        onClick={(e) => handleMenuOpen(e, meal.id)}
                        sx={{ color: "text.secondary" }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={menuMealId === meal.id}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <MenuItem onClick={handleMenuClose}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                          <CopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicar
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                          <DeleteIcon
                            fontSize="small"
                            sx={{ mr: 1 }}
                            color="error"
                          />{" "}
                          Excluir
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "custom.primary" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "custom.primary" },
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
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddMeal}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{
              mt: 2,
              borderColor: "custom.primary",
              color: "custom.primary",
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "0.95rem" },
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
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: "text.primary",
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
          }}
        >
          Criar novo plano alimentar
        </Typography>
        <Card sx={{ mb: 2, p: { xs: 1, sm: 0 } }}>
          <CardContent>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nome do plano"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Ex: Cardápio personalizado"
                inputProps={{ style: { fontSize: isMobile ? 18 : 14 } }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: "text.secondary",
                    fontSize: { xs: "1rem", sm: "1rem" },
                  }}
                >
                  Tipo de plano
                </Typography>
                <ToggleButtonGroup
                  value={selectedType}
                  exclusive
                  onChange={handleTypeChange}
                  aria-label="tipo de plano"
                  size={isMobile ? "medium" : "small"}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  <ToggleButton
                    value="alimentos"
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      fontSize: { xs: "1rem", sm: "0.95rem" },
                      "&.Mui-selected": {
                        bgcolor: "custom.lightest",
                        color: "custom.primary",
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
                      width: { xs: "100%", sm: "auto" },
                      fontSize: { xs: "1rem", sm: "0.95rem" },
                      "&.Mui-selected": {
                        bgcolor: "custom.lightest",
                        color: "custom.primary",
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
                      width: { xs: "100%", sm: "auto" },
                      fontSize: { xs: "1rem", sm: "0.95rem" },
                      "&.Mui-selected": {
                        bgcolor: "custom.lightest",
                        color: "custom.primary",
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
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
                sx={{
                  bgcolor: "custom.primary",
                  color: "common.white",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1rem" },
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
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent={isMobile ? "flex-start" : "space-between"}
        alignItems={isMobile ? "stretch" : "center"}
        sx={{ mb: 3, gap: { xs: 2, sm: 0 } }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
          Planos Alimentares
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowNewPlanForm(true)}
          fullWidth={isMobile}
          size={isMobile ? "large" : "medium"}
          sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1rem" } }}
        >
          nova prescrição alimentar
        </Button>
      </Stack>
      <Stack spacing={2}>
        {plans.map((plan) => (
          <Card key={plan.id} sx={{ p: { xs: 1, sm: 0 } }}>
            <CardContent>
              <Stack
                direction={isMobile ? "column" : "row"}
                alignItems={isMobile ? "stretch" : "center"}
                spacing={2}
              >
                <RestaurantIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Criado em: {new Date(plan.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                {isMobile ? (
                  <>
                    <IconButton
                      size="large"
                      onClick={(e) => handleMenuOpen(e, plan.id)}
                      sx={{ color: "text.secondary" }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={menuMealId === plan.id}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                      <MenuItem onClick={handleMenuClose}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <StarIcon fontSize="small" sx={{ mr: 1 }} /> Favoritar
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <CopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicar
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose}>
                        <DeleteIcon
                          fontSize="small"
                          sx={{ mr: 1 }}
                          color="error"
                        />{" "}
                        Excluir
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
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
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
