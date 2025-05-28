import React, { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  useTheme,
  Tooltip,
  Box,
  Button,
  IconButton,
  Collapse,
  Select,
  MenuItem,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DeleteIcon from "@mui/icons-material/RemoveCircle";
import PrescribedFoodItem from "./PrescribedFoodItem";
import { Alimento } from "./AddFoodToMealModal";

interface PrescribedFoodsSectionProps {
  selectedFoods: Array<{
    food: Alimento;
    amount: number;
    mcIndex?: number;
    substitutes?: Array<{ food: Alimento; amount: number; mcIndex?: number }>;
  }>;
  handleRemoveFood: (foodId: string) => void;
  handleUpdatePrescribedFood: (
    foodId: string,
    newAmount: number,
    newMcIndex: number
  ) => void;
  handleOpenDetails: (food: Alimento) => void;
  onAddSubstitute?: (foodId: string) => void;
  onAddFood?: () => void;
  handleRemoveSubstitute?: (foodId: string, substituteId: string) => void;
  handleUpdateSubstitute?: (
    foodId: string,
    substituteId: string,
    newAmount: number,
    newMcIndex: number
  ) => void;
}

const PrescribedFoodsSection: React.FC<PrescribedFoodsSectionProps> = ({
  selectedFoods,
  handleRemoveFood,
  handleUpdatePrescribedFood,
  handleOpenDetails,
  onAddSubstitute,
  onAddFood,
  handleRemoveSubstitute,
  handleUpdateSubstitute,
}) => {
  const theme = useTheme();
  const [expandedSubstitutes, setExpandedSubstitutes] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSubstitutes = (foodId: string) => {
    setExpandedSubstitutes((prev) => ({
      ...prev,
      [foodId]: !prev[foodId],
    }));
  };

  const hasSubstitutes = (foodId: string) => {
    const food = selectedFoods.find((f) => f.food.id === foodId);
    return food?.substitutes && food.substitutes.length > 0;
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        mb: 2,
        minHeight: 60,
        position: "relative",
      }}
    >
      <Tooltip title="Adicionar alimento" arrow placement="left">
        <IconButton
          onClick={onAddFood}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: theme.palette.primary.main,
            color: "white",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
            width: 36,
            height: 36,
          }}
        >
          <AddCircleOutlineIcon />
        </IconButton>
      </Tooltip>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: theme.palette.primary.main,
          textAlign: "center",
        }}
      >
        Alimentos Prescritos
      </Typography>
      {selectedFoods.length === 0 ? (
        <Typography
          color="text.secondary"
          align="center"
          sx={{
            py: 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span>Você ainda não cadastrou alimentos para esta refeição</span>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={onAddFood}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Adicionar Alimento
          </Button>
        </Typography>
      ) : (
        <>
          <TableContainer
            sx={{
              maxHeight: 400,
              overflowX: "auto",
              boxShadow: "none",
              background: "none",
            }}
          >
            <Table size="small" aria-label="Tabela de alimentos prescritos">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      width: { xs: "30%", md: "20%" },
                      color: theme.palette.text.primary,
                      borderBottom: "none",
                    }}
                  >
                    Nome do Alimento
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      width: { xs: "20%", md: "15%" },
                      color: theme.palette.text.primary,
                      borderBottom: "none",
                    }}
                  >
                    Medida Caseira
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      minWidth: 30,
                      maxWidth: 25,
                      color: theme.palette.text.primary,
                      borderBottom: "none",
                    }}
                  >
                    <Tooltip title="Quantidade" arrow>
                      <span>Qtd.</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      maxWidth: 25,
                      color: theme.palette.text.primary,
                      display: { xs: "none", sm: "table-cell" },
                      borderBottom: "none",
                    }}
                  >
                    <Tooltip title="Proteína" arrow>
                      <span>Prot.</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      maxWidth: 25,
                      color: theme.palette.text.primary,
                      display: { xs: "none", sm: "table-cell" },
                      borderBottom: "none",
                    }}
                  >
                    <Tooltip title="Lipídios (gorduras)" arrow>
                      <span>Lip.</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      maxWidth: 25,
                      color: theme.palette.text.primary,
                      display: { xs: "none", sm: "table-cell" },
                      borderBottom: "none",
                    }}
                  >
                    <Tooltip title="Carboidratos" arrow>
                      <span>Carb.</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      maxWidth: 25,
                      color: theme.palette.text.primary,
                      display: { xs: "none", md: "table-cell" },
                      borderBottom: "none",
                    }}
                  >
                    <Tooltip title="Calorias" arrow>
                      <span>Cal.</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      px: 1,
                      py: 0.5,
                      width: { xs: "10%", md: "5%" },
                      borderBottom: "none",
                    }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedFoods.map(({ food, amount, mcIndex, substitutes }) => (
                  <React.Fragment key={food.id}>
                    <PrescribedFoodItem
                      food={food}
                      amount={amount}
                      mcIndex={mcIndex}
                      onRemove={handleRemoveFood}
                      onUpdate={handleUpdatePrescribedFood}
                      onOpenDetails={handleOpenDetails}
                      onAddSubstitute={onAddSubstitute}
                    />
                    {hasSubstitutes(food.id) && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0, border: "none" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              pl: 2,
                              py: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => toggleSubstitutes(food.id)}
                              sx={{ mr: 1 }}
                            >
                              {expandedSubstitutes[food.id] ? (
                                <ExpandLessIcon fontSize="small" />
                              ) : (
                                <ExpandMoreIcon fontSize="small" />
                              )}
                            </IconButton>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <SwapHorizIcon
                                fontSize="small"
                                sx={{ mr: 0.5 }}
                              />
                              {expandedSubstitutes[food.id]
                                ? "Ocultar substitutos"
                                : `${substitutes?.length || 0} substituto${
                                    substitutes?.length !== 1 ? "s" : ""
                                  }`}
                            </Typography>
                          </Box>
                          <Collapse in={expandedSubstitutes[food.id]}>
                            <Box sx={{ pl: 4, pr: 2, py: 1 }}>
                              {substitutes?.map((sub) => (
                                <Box
                                  key={sub.food.id}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    py: 0.5,
                                    borderLeft: `2px solid ${theme.palette.primary.light}`,
                                    pl: 2,
                                    mb: 0.5,
                                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography variant="body2" sx={{ flex: 1 }}>
                                    {sub.food.nome}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      ml: 2,
                                    }}
                                  >
                                    <input
                                      type="text"
                                      value={sub.amount}
                                      onChange={(e) => {
                                        const onlyNumbers =
                                          e.target.value.replace(/[^0-9]/g, "");
                                        const value =
                                          onlyNumbers === ""
                                            ? 0
                                            : Number(onlyNumbers);
                                        if (
                                          handleUpdateSubstitute &&
                                          value > 0
                                        ) {
                                          handleUpdateSubstitute(
                                            food.id,
                                            sub.food.id,
                                            value,
                                            sub.mcIndex || 0
                                          );
                                        }
                                      }}
                                      style={{
                                        textAlign: "center",
                                        fontSize: "0.85em",
                                        width: 60,
                                        height: 32,
                                        border: "1px solid #e0e0e0",
                                        borderRadius: 8,
                                        padding: "0 8px",
                                        outline: "none",
                                        backgroundColor: "#fff",
                                        color: "#222",
                                        boxShadow: "none",
                                      }}
                                      min={1}
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                    />
                                    <Select
                                      size="small"
                                      value={sub.mcIndex || 0}
                                      onChange={(e) => {
                                        if (handleUpdateSubstitute) {
                                          handleUpdateSubstitute(
                                            food.id,
                                            sub.food.id,
                                            sub.amount,
                                            Number(e.target.value)
                                          );
                                        }
                                      }}
                                      sx={{
                                        minWidth: 110,
                                        maxWidth: 110,
                                        fontSize: "0.85em",
                                        "& .MuiSelect-select": {
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          display: "block",
                                        },
                                        background: "#fff",
                                        boxShadow: "none",
                                      }}
                                    >
                                      {sub.food.mc?.map((mc, idx) => (
                                        <MenuItem key={idx} value={idx}>
                                          {mc.nome_mc}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      ml: 2,
                                      minWidth: 60,
                                      textAlign: "right",
                                    }}
                                  >
                                    {(() => {
                                      const unidadePeso =
                                        Number(
                                          sub.food.mc?.[sub.mcIndex || 0]?.peso
                                        ) || 1;
                                      const quantidadeGramas =
                                        sub.amount * unidadePeso;
                                      const fator = quantidadeGramas / 100;
                                      return `${(
                                        Number(sub.food.kcal || 0) * fator
                                      ).toFixed(0)} kcal`;
                                    })()}
                                  </Typography>
                                  {handleRemoveSubstitute && (
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleRemoveSubstitute(
                                          food.id,
                                          sub.food.id
                                        )
                                      }
                                      sx={{ ml: 1 }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={onAddFood}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              Adicionar Alimento
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default PrescribedFoodsSection;
