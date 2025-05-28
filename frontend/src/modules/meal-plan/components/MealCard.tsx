import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
  Badge,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FastfoodIcon from "@mui/icons-material/Restaurant";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { Meal } from "@/modules/meal-plan/services/mealPlanService";
import type { Alimento } from "./AddFoodToMealModal";
import type { MealFood } from "@/services/foodService";
import MealNutritionSummary from "./MealNutritionSummary";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

interface MealCardProps {
  meal: Meal;
  foodDb: Alimento[];
  expanded: boolean;
  onExpand: (mealId: string) => void;
  onAddFood: (mealId: string) => void;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, mealId: string) => void;
  renderFoodItem?: (mealFood: MealFood) => React.ReactNode;
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  foodDb,
  expanded,
  onExpand,
  onAddFood,
  onOpenMenu,
  renderFoodItem,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={1}
      sx={{
        mb: 1.5,
        borderRadius: "12px",
        borderColor: "divider",
        transition: "all 0.2s",
        borderRight: `4px solid ${theme.palette.custom.accent}`,
        "&:hover": {
          boxShadow: 4,
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Cabeçalho da Refeição */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2.5,
            py: 1.5,
            cursor: "pointer",
            bgcolor: expanded ? alpha("#000", 0.03) : "transparent",
          }}
          onClick={() => onExpand(meal.id)}
        >
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <ExpandMoreIcon
              sx={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
                fontSize: 28,
                color: "text.secondary",
              }}
            />
          </Box>
          <Typography
            fontWeight="medium"
            sx={{
              width: 100,
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            {meal.time}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
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
              onOpenMenu(e, meal.id);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        {/* Conteúdo Expandido */}
        {expanded && (
          <Box>
            <Divider />
            <Box sx={{ p: 2.5 }}>
              {/* Botão de Ação Principal */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFood(meal.id);
                  }}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Adicionar ou editar alimentos
                </Button>
              </Box>
              {/* Lista de Alimentos */}
              <Paper
                variant="outlined"
                sx={{
                  p: meal.mealFoods?.length ? 2 : 0,
                  mb: 2,
                  borderRadius: "12px",
                  boxShadow: "none",
                }}
              >
                {meal.mealFoods && meal.mealFoods.length > 0 ? (
                  <TableContainer
                    sx={{
                      maxHeight: 300,
                      overflowX: "auto",
                      borderRadius: 2,
                      boxShadow: "none",
                      background: "none",
                      mb: 2,
                    }}
                  >
                    <Table
                      size="small"
                      aria-label="Tabela de alimentos da refeição"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              px: 1,
                              py: 1,
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            Alimento
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              px: 1,
                              py: 1,
                              width: 70,
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            Qtde
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              px: 1,
                              py: 1,
                              width: 70,
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            Unidade
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              px: 1,
                              py: 1,
                              width: 100,
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            Calorias
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {meal.mealFoods.map((mealFood) =>
                          renderFoodItem ? (
                            renderFoodItem(mealFood)
                          ) : (
                            <TableRow key={mealFood.id}>
                              <TableCell sx={{ py: 1.5 }}>
                                {
                                  foodDb.find((f) => f.id === mealFood.foodId)
                                    ?.nome
                                }
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                {mealFood.amount}
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                {mealFood.unit}
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                {/* Calorias calculadas aqui, se necessário */}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                    <FastfoodIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
                    <Typography variant="body2" gutterBottom>
                      Nenhum alimento adicionado a esta refeição.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => onAddFood(meal.id)}
                      sx={{
                        mt: 1,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
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
                    mt: 2,
                    p: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    borderColor: "primary.main",
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.95rem" }}
                  >
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Notas
                    </Box>{" "}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
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
  );
};

export default MealCard;
