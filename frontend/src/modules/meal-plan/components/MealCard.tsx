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
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FastfoodIcon from "@mui/icons-material/Restaurant";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import CalculateIcon from "@mui/icons-material/Calculate";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Meal, MealFood } from "@/modules/meal-plan/services/mealPlanService";
import type { Alimento } from "./AddFoodToMealModal";
import MealNutritionSummary from "./MealNutritionSummary";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

interface MealCardProps {
  meal: Meal;
  foodDb: Alimento[];
  expanded: boolean;
  onExpand: (mealId: string) => void;
  onAddFood: (mealId: string) => void;
  onToggleCalculation: (mealId: string, isActive: boolean) => void;
  onEdit: (meal: Meal) => void;
  onDuplicate: (mealId: string) => void;
  renderFoodItem: (mealFood: MealFood) => React.ReactNode;
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  foodDb,
  expanded,
  onExpand,
  onAddFood,
  onToggleCalculation,
  onEdit,
  onDuplicate,
  renderFoodItem,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(meal);
  };

  const handleDuplicate = () => {
    handleMenuClose();
    onDuplicate(meal.id);
  };

  const renderActionButtons = () => {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {!isMobile && (
          <>
            <Tooltip
              title={
                meal.isActiveForCalculation
                  ? "Esta refeição está incluída nos cálculos. Clique para remover."
                  : "Esta refeição não está incluída nos cálculos. Clique para incluir."
              }
              arrow
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCalculation(meal.id, !meal.isActiveForCalculation);
                }}
                sx={{
                  color: meal.isActiveForCalculation
                    ? "primary.main"
                    : "grey.400",
                  "&:hover": {
                    color: meal.isActiveForCalculation
                      ? "primary.dark"
                      : "grey.600",
                  },
                }}
              >
                <CalculateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Adicionar alimento" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddFood(meal.id);
                }}
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    color: "primary.dark",
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar refeição" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(meal);
                }}
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    color: "primary.dark",
                  },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicar refeição" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(meal.id);
                }}
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    color: "primary.dark",
                  },
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>
    );
  };

  return (
    <Card
      elevation={1}
      sx={{
        mb: 1.5,
        borderRadius: "12px",
        borderColor: "divider",
        transition: "all 0.2s",
        borderRight: `4px solid ${
          meal.isActiveForCalculation
            ? theme.palette.custom.accent
            : theme.palette.grey[300]
        }`,
        bgcolor: meal.isActiveForCalculation ? "background.paper" : "grey.100",
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
            bgcolor: expanded
              ? meal.isActiveForCalculation
                ? alpha("#000", 0.03)
                : alpha("#000", 0.05)
              : "transparent",
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
          <Badge
            badgeContent={meal.mealFoods?.length || 0}
            color="primary"
            sx={{ mr: 1 }}
          >
            <FastfoodIcon color="action" />
          </Badge>
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
          {renderActionButtons()}
        </Box>

        {/* Menu de opções */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar refeição</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDuplicate}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicar refeição</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onAddFood(meal.id);
            }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Adicionar alimento</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onToggleCalculation(meal.id, !meal.isActiveForCalculation);
            }}
          >
            <ListItemIcon>
              <CalculateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {meal.isActiveForCalculation
                ? "Remover dos cálculos"
                : "Incluir nos cálculos"}
            </ListItemText>
          </MenuItem>
        </Menu>

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
                          renderFoodItem(mealFood)
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
