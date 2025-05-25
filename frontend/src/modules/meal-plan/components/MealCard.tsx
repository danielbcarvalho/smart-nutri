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
import InfoIcon from "@mui/icons-material/Info";
import { Meal } from "@/modules/meal-plan/services/mealPlanService";
import type { Alimento } from "./AddFoodToMealModal";
import type { MealFood } from "@/services/foodService";
import MealNutritionSummary from "./MealNutritionSummary";

interface MealCardProps {
  meal: Meal;
  foodDb: Alimento[];
  expanded: boolean;
  onExpand: (mealId: string) => void;
  onAddFood: (mealId: string) => void;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, mealId: string) => void;
  renderFoodItem?: (mealFood: MealFood) => React.ReactNode;
}

const getMealTypeColor = (mealName: string) => {
  const name = mealName.toLowerCase();
  if (name.includes("café")) return "#FF9800";
  if (name.includes("almoço")) return "#4CAF50";
  if (name.includes("jantar")) return "#2196F3";
  if (name.includes("lanche")) return "#9C27B0";
  if (name.includes("ceia")) return "#795548";
  return "#607D8B";
};

const MealCard: React.FC<MealCardProps> = ({
  meal,
  foodDb,
  expanded,
  onExpand,
  onAddFood,
  onOpenMenu,
  renderFoodItem,
}) => {
  return (
    <Card
      elevation={1}
      sx={{
        mb: 1.5,
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
            px: 2,
            py: 1.2,
            cursor: "pointer",
            bgcolor: expanded ? "rgba(0,0,0,0.03)" : "transparent",
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
            <Box sx={{ p: 2 }}>
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
                >
                  Adicionar ou editar alimentos
                </Button>
              </Box>
              {/* Lista de Alimentos */}
              <Paper
                variant="outlined"
                sx={{ p: meal.mealFoods?.length ? 2 : 0, mb: 2 }}
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
                              py: 0.5,
                              width: 70,
                            }}
                          >
                            Qtde
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              px: 1,
                              py: 0.5,
                              width: 70,
                            }}
                          >
                            Unidade
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", px: 1, py: 0.5 }}
                          >
                            Alimento
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              px: 1,
                              py: 0.5,
                              width: 100,
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
                              <TableCell>{mealFood.amount}</TableCell>
                              <TableCell>{mealFood.unit}</TableCell>
                              <TableCell>
                                {
                                  foodDb.find((f) => f.id === mealFood.foodId)
                                    ?.nome
                                }
                              </TableCell>
                              <TableCell>
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
                  <Typography variant="body2" color="text.secondary">
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
