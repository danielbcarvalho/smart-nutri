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
import NutrientAnalysis from "./NutrientAnalysis";
import AddFoodSection from "./AddFoodSection";
import PrescribedFoodsSection from "./PrescribedFoodsSection";
import { mealPlanService } from "../services/mealPlanService";
import type { CreateMeal, UpdateMeal } from "../services/mealPlanService";
import CloseIcon from "@mui/icons-material/Close";
import NutrientAnalysisIndividualMeal from "./NutrientAnalysisIndividualMeal";
import FoodSearchModal from "./FoodSearchModal";

interface AddFoodToMealModalProps {
  open: boolean;
  onClose: () => void;
  planId: string;
  mealId: string;
  mealName: string;
  mealTime: string;
  initialFoods?: Array<{ food: Alimento; amount: number; mcIndex?: number }>;
  initialNotes?: string;
  onSave?: (
    foods: Array<{ food: Alimento; amount: number; mcIndex?: number }>,
    notes: string
  ) => void;
}

// Definição de Alimento e MedidaCaseira (se não vierem de AddFoodToMealModal.ts)
// Remova ou ajuste isso se a importação acima estiver correta
export interface MedidaCaseira {
  nome_mc: string;
  peso: string | number;
}

export interface Alimento {
  id: string;
  nome: string;
  grupo?: string;
  unidade?: string;
  mc?: MedidaCaseira[];
  /**
   * Origem do alimento (ex: 'taco', 'tbca', 'personalizado').
   * Obrigatório para integração com backend.
   */
  origem: string;
  exibido?: string | null;
  destacado?: string | null;
  substitutos?: string[];
  kcal?: number;
  ptn?: number;
  lip?: number;
  cho?: number;
  fibras?: number;
  ca?: number;
  mg?: number;
  p?: number;
  fe?: number;
  na?: number;
  k?: number;
  co?: number;
  zn?: number;
  se?: number;
  re?: number;
  rea?: number;
  tiamina?: number;
  riboflavina?: number;
  piridoxina?: number;
  niacina?: number;
  vitc?: number;
  vitb12?: number;
  vitb9?: number;
  vite?: number;
  vitd?: number;
  gorduramono?: number;
  gordurapoli?: number;
  gordurasat?: number;
  gorduratrans?: number;
  colesterol?: number;
  alcool?: number;
  sku?: string | null;
  img?: string | null;
  liah?: string;
  usageCount?: number;
  // Adicione outros campos conforme necessário
}

// Novo tipo para alimento prescrito com substitutos
interface PrescribedFood {
  food: Alimento;
  amount: number;
  mcIndex?: number;
  substitutes?: Array<{ food: Alimento; amount: number; mcIndex?: number }>;
}

export const AddFoodToMealModal: React.FC<AddFoodToMealModalProps> = ({
  open,
  onClose,
  planId,
  mealId,
  mealName,
  mealTime,
  initialFoods = [],
  initialNotes = "",
  onSave,
}) => {
  const [foodSearch, setFoodSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Alimento[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<PrescribedFood[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const [selectedFoodForDetails, setSelectedFoodForDetails] =
    useState<Alimento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [substituteTargetFoodId, setSubstituteTargetFoodId] = useState<
    string | null
  >(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchContext, setSearchContext] = useState<
    "principal" | "substituto" | null
  >(null);

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

  // Converte Alimento para o formato do foodService
  const convertAlimentoToFood = (alimento: Alimento) => {
    return {
      id: alimento.id,
      name: alimento.nome,
      servingSize: 100,
      servingUnit: alimento.unidade || "g",
      calories: Number(alimento.kcal) || 0,
      protein: Number(alimento.ptn) || 0,
      carbohydrates: Number(alimento.cho) || 0,
      fat: Number(alimento.lip) || 0,
      fiber: Number(alimento.fibras) || 0,
      sugar: undefined,
      sodium: undefined,
      categories: [],
      isFavorite: false,
      usageCount: 0,
    };
  };

  // Calcula macronutrientes e peso total
  const macroInputArray = selectedFoods.map(({ food, amount, mcIndex }) => {
    let peso = amount;
    let pesoMc = 1;
    if (
      food.mc &&
      typeof mcIndex === "number" &&
      mcIndex >= 0 &&
      food.mc[mcIndex]
    ) {
      pesoMc = Number(food.mc[mcIndex].peso) || 1; // Garante que pesoMc seja um número válido
      peso = amount * pesoMc;
    } else {
      peso = amount;
    }
    return {
      food: convertAlimentoToFood(food),
      amount: peso,
    };
  });

  const totalMacros: MacroNutrients = foodService.sumMacros(macroInputArray);

  const totalWeight = selectedFoods.reduce((acc, cur) => {
    // Reutiliza a lógica de cálculo de peso com verificação aprimorada
    let pesoItem = cur.amount;
    if (
      cur.food.mc &&
      typeof cur.mcIndex === "number" &&
      cur.mcIndex >= 0 &&
      cur.food.mc[cur.mcIndex]
    ) {
      const pesoMc = Number(cur.food.mc[cur.mcIndex].peso) || 1;
      pesoItem = cur.amount * pesoMc;
    }
    return acc + pesoItem;
  }, 0);

  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.food.id !== foodId));
  };

  const handleOpenDetails = (food: Alimento) => {
    setShowDropdown(false);
    setSelectedFoodForDetails(food);
  };

  const handleUpdatePrescribedFood = (
    foodId: string,
    newAmount: number,
    newMcIndex: number
  ) => {
    setSelectedFoods((prev) =>
      prev.map((item) =>
        item.food.id === foodId
          ? { ...item, amount: newAmount, mcIndex: newMcIndex }
          : item
      )
    );
  };

  const handleRemoveSubstitute = (foodId: string, substituteId: string) => {
    setSelectedFoods((prev) =>
      prev.map((item) =>
        item.food.id === foodId
          ? {
              ...item,
              substitutes: item.substitutes?.filter(
                (sub) => sub.food.id !== substituteId
              ),
            }
          : item
      )
    );
  };

  const handleUpdateSubstitute = (
    foodId: string,
    substituteId: string,
    newAmount: number,
    newMcIndex: number
  ) => {
    setSelectedFoods((prev) =>
      prev.map((item) =>
        item.food.id === foodId
          ? {
              ...item,
              substitutes: item.substitutes?.map((sub) =>
                sub.food.id === substituteId
                  ? { ...sub, amount: newAmount, mcIndex: newMcIndex }
                  : sub
              ),
            }
          : item
      )
    );
  };

  // Handler para abrir modal de busca para alimento principal
  const handleOpenAddFoodModal = () => {
    setSearchContext("principal");
    setSearchModalOpen(true);
  };

  // Handler para abrir modal de busca para substituto
  const handleOpenAddSubstituteModal = (foodId: string) => {
    setSubstituteTargetFoodId(foodId);
    setSearchContext("substituto");
    setSearchModalOpen(true);
  };

  // Handler para fechar modal de busca
  const handleCloseSearchModal = () => {
    setSearchModalOpen(false);
    setSearchContext(null);
    setSubstituteTargetFoodId(null);
  };

  // Handler para seleção no modal de busca
  const handleFoodSearchSelect = (
    food: Alimento,
    amount: number,
    mcIndex?: number
  ) => {
    if (searchContext === "principal") {
      // Adiciona alimento principal
      if (!selectedFoods.find((f) => f.food.id === food.id)) {
        setSelectedFoods([...selectedFoods, { food, amount, mcIndex }]);
      }
    } else if (searchContext === "substituto" && substituteTargetFoodId) {
      setSelectedFoods((prev) =>
        prev.map((item) =>
          item.food.id === substituteTargetFoodId
            ? {
                ...item,
                substitutes: [
                  ...(item.substitutes || []),
                  { food, amount, mcIndex },
                ],
              }
            : item
        )
      );
    }
  };

  // Handler para salvar os dados ao confirmar
  const handleSave = async () => {
    setError(null);
    if (!planId || !mealName || !mealTime) {
      setError("Dados obrigatórios ausentes. Tente novamente.");
      return;
    }
    setLoading(true);
    const mealFoods = selectedFoods.map(
      ({ food, amount, mcIndex, substitutes }) => {
        let unit = food.unidade || "g";
        if (food.mc && typeof mcIndex === "number" && food.mc[mcIndex]) {
          unit = food.mc[mcIndex].nome_mc || unit;
        }

        const baseFood = {
          foodId: food.id,
          source: food.origem || "taco",
          amount: Number(amount),
          unit,
        };

        // Se houver substitutos, adiciona ao payload
        if (substitutes && substitutes.length > 0) {
          const substitutesPayload = substitutes.map(
            ({ food: subFood, amount: subAmount, mcIndex: subMcIndex }) => {
              let subUnit = subFood.unidade || "g";
              if (
                subFood.mc &&
                typeof subMcIndex === "number" &&
                subFood.mc[subMcIndex]
              ) {
                subUnit = subFood.mc[subMcIndex].nome_mc || subUnit;
              }
              return {
                foodId: subFood.id,
                source: subFood.origem || "taco",
                name: subFood.nome,
                amount: Number(subAmount),
                unit: subUnit,
              };
            }
          );
          return {
            ...baseFood,
            substitutes: substitutesPayload,
          };
        }

        return baseFood;
      }
    );

    try {
      if (mealId) {
        const updatePayload: UpdateMeal = { mealFoods, notes };
        await mealPlanService.updateMeal(planId, mealId, updatePayload);
      } else {
        const meal: CreateMeal = {
          name: mealName,
          time: mealTime,
          notes,
          mealFoods,
        };
        await mealPlanService.addMeal(planId, meal);
      }
      if (onSave) {
        onSave(selectedFoods, notes);
      }
      onClose();
    } catch (err: unknown) {
      let msg = "Erro ao salvar refeição.";
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

  useEffect(() => {
    if (open) {
      setSelectedFoods(initialFoods.map((item) => ({ ...item })));
      setNotes(initialNotes);
    }
  }, [open, initialFoods, initialNotes]);

  useEffect(() => {
    if (open && initialFoods.length === 0) {
      setSearchContext("principal");
      setSearchModalOpen(true);
    }
  }, [open, initialFoods.length]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: "#fff",
          borderRadius: isMobile ? 0 : 4,
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
          p: 0,
          maxWidth: isMobile ? "100vw" : 1100,
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "100vh" : "auto",
          position: "relative",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "center",
        },
      }}
      aria-labelledby="add-food-dialog-title"
    >
      <DialogContent
        sx={{
          p: isMobile ? 1 : 4,
          backgroundColor: "#fff",
          borderRadius: isMobile ? 0 : 4,
          boxShadow: "none",
          minWidth: isMobile ? "100vw" : 420,
          maxWidth: isMobile ? "100vw" : 1040,
          width: "100%",
          mx: "auto",
          overflow: "visible",
          position: "relative",
        }}
      >
        {/* Botão de fechar visível no topo direito */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: "grey.100",
            borderRadius: 2,
            boxShadow: 1,
            "&:hover": { bgcolor: "grey.200" },
          }}
          aria-label="Fechar"
        >
          <CloseIcon />
        </IconButton>
        {/* Título minimalista */}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, textAlign: "left", color: "#222", fontSize: 22 }}
        >
          {mealName ? `Refeição: ${mealName}` : "Adicionar Alimento à Refeição"}
        </Typography>
        {/* Lista de alimentos prescritos */}
        <PrescribedFoodsSection
          selectedFoods={selectedFoods}
          handleRemoveFood={handleRemoveFood}
          handleUpdatePrescribedFood={handleUpdatePrescribedFood}
          handleOpenDetails={handleOpenDetails}
          onAddSubstitute={handleOpenAddSubstituteModal}
          onAddFood={handleOpenAddFoodModal}
          handleRemoveSubstitute={handleRemoveSubstitute}
          handleUpdateSubstitute={handleUpdateSubstitute}
        />
        {/* Seção de Análise de Nutrientes */}
        <NutrientAnalysisIndividualMeal
          protein={totalMacros.protein || 0}
          fat={totalMacros.fat || 0}
          carbohydrates={totalMacros.carbohydrates || 0}
          calories={totalMacros.calories || 0}
          totalWeight={totalWeight}
        />
        {/* Observações da Refeição */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: (theme) => theme.shadows[1],
            border: (theme) => `1px solid ${theme.palette.divider}`,
            mb: 0,
            mt: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1.5,
              fontWeight: 600,
              color: "#222",
              textAlign: "left",
              fontSize: 16,
            }}
          >
            Observações da Refeição
          </Typography>
          <TextField
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            placeholder="Adicione observações sobre esta refeição"
            aria-label="Observações sobre a refeição"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: "#bdbdbd",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8bc34a",
                  borderWidth: "1px",
                },
              },
            }}
          />
        </Paper>
        {/* Botões de ação minimalistas */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "stretch" : "flex-end",
            gap: 2,
            mt: 4,
            width: "100%",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ minWidth: 100, borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="success"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ minWidth: 100, borderRadius: 2 }}
            disabled={loading}
          >
            Confirmar
          </Button>
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      {/* Modal de Detalhes do Alimento */}
      <FoodDetailsModal
        open={!!selectedFoodForDetails}
        onClose={() => setSelectedFoodForDetails(null)}
        food={selectedFoodForDetails}
        onAdd={(food) => {
          if (!selectedFoods.find((f) => f.food.id === food.id)) {
            const defaultMcIndex =
              food.mc && food.mc.length > 0 ? 0 : undefined;
            setSelectedFoods([
              ...selectedFoods,
              { food, amount: 100, mcIndex: defaultMcIndex },
            ]);
          }
          setSelectedFoodForDetails(null);
        }}
      />
      <FoodSearchModal
        open={searchModalOpen}
        onClose={handleCloseSearchModal}
        onSelect={handleFoodSearchSelect}
        context={searchContext || "principal"}
        targetFoodName={
          searchContext === "substituto"
            ? selectedFoods.find((f) => f.food.id === substituteTargetFoodId)
                ?.food.nome
            : undefined
        }
      />
    </Dialog>
  );
};

export default AddFoodToMealModal;
