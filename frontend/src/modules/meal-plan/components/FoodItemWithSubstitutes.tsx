import React, { useState } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Box,
  Chip,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { formatNumber } from "@/utils/numberFormat";
import { formatMeasure } from "@/utils/measureFormat";

export interface Substitute {
  id: string;
  originalFoodId: string;
  originalSource: string;
  substituteFoodId: string;
  substituteSource: string;
  substituteAmount: string;
  substituteUnit: string;
  nutritionistId: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  calories?: number;
  kcal?: number; // Valor base por 100g
  peso?: number; // Peso da unidade em gramas
}

interface FoodItemWithSubstitutesProps {
  food: {
    id: string;
    name: string;
    amount: number;
    unit: string;
    calories: number;
    kcal?: number; // Valor base por 100g
    peso?: number; // Peso da unidade em gramas
  };
  substitutes: Substitute[];
}

const FoodItemWithSubstitutes: React.FC<FoodItemWithSubstitutesProps> = ({
  food,
  substitutes,
}) => {
  const [expanded, setExpanded] = useState(substitutes.length > 0);
  const hasSubstitutes = substitutes.length > 0;

  // Cálculo das calorias usando a mesma lógica do PrescribedFoodItem
  const unidadePeso = food.peso || 1;
  const quantidadeGramas = food.amount * unidadePeso;
  const fator = quantidadeGramas / 100;
  const caloriasCalculadas = (food.kcal || food.calories) * fator;

  return (
    <>
      {/* Linha principal do alimento */}
      <TableRow hover sx={{ borderBottom: substitutes.length ? 0 : undefined }}>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={500}>{food.name}</Typography>

              {/* Indicador visual de substitutos */}
              {hasSubstitutes && (
                <Box
                  sx={{
                    mt: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                    sx={{
                      color: "primary.main",
                    }}
                  >
                    {expanded ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </IconButton>
                  <Chip
                    label={`${substitutes.length} substituto${
                      substitutes.length > 1 ? "s" : ""
                    }`}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Typography fontWeight={600} variant="body2">
            {formatNumber(food.amount)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatMeasure(food.unit, Number(food.amount))}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography fontWeight={500} variant="body2">
            {formatNumber(caloriasCalculadas)}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Seção expansível dos substitutos */}
      {hasSubstitutes && (
        <TableRow>
          <TableCell
            colSpan={4}
            sx={{
              p: 0,
              border: 0,
            }}
          >
            <Collapse in={expanded} timeout="auto">
              <Box sx={{ p: 2, pt: 1 }}>
                {/* Lista de substitutos */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {substitutes.map((sub) => {
                    // Cálculo das calorias usando a mesma lógica do alimento principal
                    const unidadePeso = sub.peso || 1;
                    const quantidadeGramas =
                      Number(sub.substituteAmount) * unidadePeso;
                    const fator = quantidadeGramas / 100;
                    const caloriasCalculadas =
                      (sub.kcal || sub.calories || 0) * fator;

                    return (
                      <Box
                        key={sub.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 1.5,
                          bgcolor: "white",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            borderColor: "primary.main",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Informações do substituto */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {sub.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatNumber(sub.substituteAmount)}{" "}
                            {formatMeasure(
                              sub.substituteUnit,
                              Number(sub.substituteAmount)
                            )}{" "}
                            • {formatNumber(caloriasCalculadas)} calorias
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default FoodItemWithSubstitutes;
