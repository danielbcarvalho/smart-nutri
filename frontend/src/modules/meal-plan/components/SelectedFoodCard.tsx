import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import type { Alimento } from "./AddFoodToMealModal";
import { formatMeasure } from "@/utils/measureFormat";

interface SelectedFoodCardProps {
  food: Alimento;
  onConfirm: (amount: number, mcIndex: number) => void;
  onCancel: () => void;
}

const SelectedFoodCard: React.FC<SelectedFoodCardProps> = ({
  food,
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [amountStr, setAmountStr] = useState("1");
  const [mcIndex, setMcIndex] = useState(0);

  const currentMcIndex = Math.min(mcIndex, (food.mc?.length || 1) - 1);
  const selectedMc = food.mc?.[currentMcIndex];
  const weightOfSelectedMc = selectedMc ? Number(selectedMc.peso) : 100;

  // Conversão segura de amountStr para número
  const amountNum = parseFloat(amountStr.replace(",", ".")) || 0;

  const multiplier =
    weightOfSelectedMc > 0
      ? (weightOfSelectedMc * amountNum) / 100
      : selectedMc
      ? 0
      : (amountNum * 1) / 100;

  const calculatedNutrients = {
    kcal: Math.round((food.kcal || 0) * multiplier),
    protein: parseFloat(((food.ptn || 0) * multiplier).toFixed(1)),
    carbs: parseFloat(((food.cho || 0) * multiplier).toFixed(1)),
    fat: parseFloat(((food.lip || 0) * multiplier).toFixed(1)),
    fiber: food.fibras ? parseFloat((food.fibras * multiplier).toFixed(1)) : 0,
  };

  if (selectedMc && Number(selectedMc.peso) === 0) {
    calculatedNutrients.kcal = NaN;
    calculatedNutrients.protein = NaN;
    calculatedNutrients.carbs = NaN;
    calculatedNutrients.fat = NaN;
    calculatedNutrients.fiber = NaN;
  }

  const portionText = selectedMc
    ? `${amountNum} ${formatMeasure(
        selectedMc.nome_mc.toLowerCase(),
        amountNum
      )}`
    : `${amountNum}${food.unidade || "g"}`;

  const handleAmountChange = (value: string) => {
    // Permite apenas números, vírgula e ponto
    const sanitizedValue = value.replace(/[^\d,.]/g, "");
    // Garante que só tenha uma vírgula ou ponto
    const parts = sanitizedValue.split(/[,.]/);
    if (parts.length > 2) {
      return;
    }
    setAmountStr(sanitizedValue);
  };

  const handleAmountBlur = () => {
    const numericValue = parseFloat(amountStr.replace(",", ".")) || 1;
    setAmountStr(numericValue.toString());
  };

  const handleConfirm = () => {
    const sanitizeAmount = parseFloat(amountStr.replace(",", ".")) || 1;
    onConfirm(sanitizeAmount, currentMcIndex);
  };

  return (
    <Collapse in={true} timeout={300}>
      <Card
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          bgcolor: "primary.50",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontSize: isMobile ? "1.1rem" : "1.25rem" }}
            >
              Alimento Selecionado
            </Typography>
            <IconButton size="small" onClick={onCancel}>
              <ClearIcon />
            </IconButton>
          </Box>

          <Typography variant="body1" fontWeight={600} gutterBottom>
            {food.nome}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 3 },
              mt: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <Box sx={{ flex: food.mc && food.mc.length > 0 ? 1 : 1 }}>
                  <TextField
                    type="text"
                    label="Quantidade"
                    value={amountStr}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onBlur={handleAmountBlur}
                    fullWidth
                    inputProps={{
                      inputMode: "decimal",
                      pattern: "[0-9]*[.,]?[0-9]*",
                    }}
                    size={isMobile ? "small" : "medium"}
                  />
                </Box>

                {food.mc && food.mc.length > 0 && (
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Medida</InputLabel>
                      <Select
                        value={currentMcIndex}
                        label="Medida"
                        onChange={(e) => setMcIndex(Number(e.target.value))}
                      >
                        {food.mc.map((mc, idx) => (
                          <MenuItem key={idx} value={idx}>
                            {formatMeasure(mc.nome_mc, 1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  fontWeight={600}
                  gutterBottom
                >
                  Valores para {portionText}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: isMobile ? 0.8 : 1.5,
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="primary.main"
                    fontWeight={700}
                    sx={{
                      minWidth: "auto",
                      px: isMobile ? 0.3 : 0.5,
                      textAlign: "left",
                    }}
                  >
                    {isNaN(calculatedNutrients.kcal)
                      ? "--"
                      : calculatedNutrients.kcal}{" "}
                    kcal
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{
                      minWidth: "auto",
                      px: isMobile ? 0.3 : 0.5,
                      textAlign: "left",
                    }}
                  >
                    P:{" "}
                    {isNaN(calculatedNutrients.protein)
                      ? "--"
                      : `${calculatedNutrients.protein}${formatMeasure(
                          "grama(s)",
                          calculatedNutrients.protein
                        )}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="info.main"
                    sx={{
                      minWidth: "auto",
                      px: isMobile ? 0.3 : 0.5,
                      textAlign: "left",
                    }}
                  >
                    C:{" "}
                    {isNaN(calculatedNutrients.carbs)
                      ? "--"
                      : `${calculatedNutrients.carbs}${formatMeasure(
                          "grama(s)",
                          calculatedNutrients.carbs
                        )}`}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{
                      minWidth: "auto",
                      px: isMobile ? 0.3 : 0.5,
                      textAlign: "left",
                    }}
                  >
                    G:{" "}
                    {isNaN(calculatedNutrients.fat)
                      ? "--"
                      : `${calculatedNutrients.fat}${formatMeasure(
                          "grama(s)",
                          calculatedNutrients.fat
                        )}`}
                  </Typography>
                  {(food.fibras || 0) > 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        minWidth: "auto",
                        px: isMobile ? 0.3 : 0.5,
                        textAlign: "left",
                      }}
                    >
                      Fb:{" "}
                      {isNaN(calculatedNutrients.fiber)
                        ? "--"
                        : `${calculatedNutrients.fiber}${formatMeasure(
                            "grama(s)",
                            calculatedNutrients.fiber
                          )}`}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={onCancel}
              size={isMobile ? "small" : "medium"}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              size={isMobile ? "small" : "medium"}
              disabled={amountNum <= 0}
            >
              Confirmar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Collapse>
  );
};

export default SelectedFoodCard;
