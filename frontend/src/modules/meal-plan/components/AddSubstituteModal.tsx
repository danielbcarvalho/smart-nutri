import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  foodService,
  MacroNutrients,
  searchFoods,
} from "@/services/foodService";
import { useFoodDb } from "@/services/useFoodDb";
import FoodDetailsModal from "./FoodDetailsModal";
import CloseIcon from "@mui/icons-material/Close";
import { mealPlanService } from "../services/mealPlanService";
import type { Alimento } from "./AddFoodToMealModal";

interface AddSubstituteModalProps {
  open: boolean;
  onClose: () => void;
  mealFoodId: string;
  originalFood: {
    name: string;
    amount: number;
    unit: string;
  };
  onSubstituteAdded: () => void;
}

export const AddSubstituteModal: React.FC<AddSubstituteModalProps> = ({
  open,
  onClose,
  mealFoodId,
  originalFood,
  onSubstituteAdded,
}) => {
  const [foodSearch, setFoodSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Alimento[]>([]);
  const [selectedFood, setSelectedFood] = useState<Alimento | null>(null);
  const [amount, setAmount] = useState<number>(originalFood.amount);
  const [selectedMcIndex, setSelectedMcIndex] = useState<number | undefined>(
    undefined
  );
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const [selectedFoodForDetails, setSelectedFoodForDetails] =
    useState<Alimento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: foodDb } = useFoodDb();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Efeito para busca de alimentos
  useEffect(() => {
    if (foodSearch.length < 2) {
      setSearchResults([]);
      setLoadingFoods(false);
      setShowDropdown(false);
      return;
    }
    setLoadingFoods(true);
    const handler = setTimeout(() => {
      (async () => {
        try {
          const filtered = searchFoods(
            foodSearch,
            Array.isArray(foodDb) ? foodDb : []
          );

          setSearchResults(Array.isArray(filtered) ? filtered : []);
          setShowDropdown(true);
        } catch {
          setSearchResults([]);
          setShowDropdown(false);
        }
        setLoadingFoods(false);
      })();
    }, 300);
    return () => clearTimeout(handler);
  }, [foodSearch, foodDb]);

  // Atualiza a largura do input para o dropdown
  useEffect(() => {
    function updateWidth() {
      if (anchorRef.current) {
        setInputWidth(anchorRef.current.getBoundingClientRect().width);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [showDropdown]);

  const handleSelectFood = (food: Alimento) => {
    setSelectedFood(food);
    setShowDropdown(false);
    setFoodSearch("");
    // Define mcIndex como 0 se houver medidas caseiras, caso contrário undefined
    const defaultMcIndex = food.mc && food.mc.length > 0 ? 0 : undefined;
    setSelectedMcIndex(defaultMcIndex);
  };

  const handleOpenDetails = (food: Alimento) => {
    setShowDropdown(false);
    setSelectedFoodForDetails(food);
  };

  const handleSave = async () => {
    setError(null);
    if (!selectedFood) {
      setError("Selecione um alimento substituto.");
      return;
    }

    setLoading(true);
    try {
      let unit = selectedFood.unidade || "g";
      if (
        selectedFood.mc &&
        typeof selectedMcIndex === "number" &&
        selectedFood.mc[selectedMcIndex]
      ) {
        unit = selectedFood.mc[selectedMcIndex].nome_mc || unit;
      }

      await mealPlanService.addSubstitute(mealFoodId, {
        foodId: selectedFood.id,
        source: selectedFood.origem || "taco",
        amount: Number(amount),
        unit,
      });

      onSubstituteAdded();
      onClose();
    } catch (err: unknown) {
      let msg = "Erro ao adicionar substituto.";
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response: unknown }).response;
        if (
          typeof response === "object" &&
          response !== null &&
          "data" in response
        ) {
          const data = (response as { data: unknown }).data;
          if (
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            Array.isArray((data as { message: unknown }).message) &&
            typeof (data as { message: unknown[] }).message[0] === "string"
          ) {
            msg = (data as { message: string[] }).message[0];
          }
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resetar estado ao fechar
  useEffect(() => {
    if (!open) {
      setFoodSearch("");
      setSearchResults([]);
      setSelectedFood(null);
      setAmount(originalFood.amount);
      setSelectedMcIndex(undefined);
      setLoadingFoods(false);
      setShowDropdown(false);
      setSelectedFoodForDetails(null);
      setError(null);
    }
  }, [open, originalFood.amount]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: "#fff",
          borderRadius: isMobile ? 0 : 4,
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
          p: 0,
          maxWidth: isMobile ? "100vw" : 800,
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100vh" : "auto",
          position: "relative",
        },
      }}
    >
      <DialogContent sx={{ p: isMobile ? 2 : 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Adicionar Substituto para {originalFood.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Alimento Original: {originalFood.name} ({originalFood.amount}{" "}
            {originalFood.unit})
          </Typography>
        </Box>

        <Box ref={anchorRef} sx={{ position: "relative", mb: 3 }}>
          <TextField
            fullWidth
            label="Buscar alimento substituto"
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            variant="outlined"
            placeholder="Digite o nome do alimento..."
          />
          {showDropdown && searchResults.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 1,
                mt: 1,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {searchResults.map((food) => (
                <Box
                  key={food.id}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => handleSelectFood(food)}
                >
                  <Typography variant="body1">{food.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {food.mc?.[0]?.nome_mc || food.unidade || "g"}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {selectedFood && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Alimento Selecionado: {selectedFood.nome}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                type="number"
                label="Quantidade"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                sx={{ width: 150 }}
              />
              <Typography>
                {selectedFood.mc && selectedMcIndex !== undefined
                  ? selectedFood.mc[selectedMcIndex]?.nome_mc
                  : selectedFood.unidade || "g"}
              </Typography>
            </Box>
          </Box>
        )}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
        >
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!selectedFood || loading}
          >
            Adicionar Substituto
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <FoodDetailsModal
        open={!!selectedFoodForDetails}
        onClose={() => setSelectedFoodForDetails(null)}
        food={selectedFoodForDetails}
        onAdd={(food) => {
          handleSelectFood(food);
          setSelectedFoodForDetails(null);
        }}
      />
    </Dialog>
  );
};

export default AddSubstituteModal;
