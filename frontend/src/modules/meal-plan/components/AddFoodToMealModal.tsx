import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Typography,
  Box,
  useTheme,
  TextField,
  IconButton, // Importar IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Importar Ícone de Fechar
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

interface AddFoodToMealModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (
    foods: Array<{ food: Alimento; amount: number; mcIndex?: number }>,
    notes: string
  ) => void; // Callback para salvar os dados ao confirmar
  mealName?: string;
  initialFoods?: Array<{ food: Alimento; amount: number; mcIndex?: number }>; // Alimentos iniciais, se houver
  initialNotes?: string; // Observações iniciais, se houver
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
  origem?: string;
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

export const AddFoodToMealModal: React.FC<AddFoodToMealModalProps> = ({
  open,
  onClose,
  onSave,
  mealName,
  initialFoods = [],
  initialNotes = "",
}) => {
  const theme = useTheme();
  const [foodSearch, setFoodSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Alimento[]>([]);
  const [selectedFoods, setSelectedFoods] =
    useState<Array<{ food: Alimento; amount: number; mcIndex?: number }>>(
      initialFoods
    );
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const [selectedFoodForDetails, setSelectedFoodForDetails] =
    useState<Alimento | null>(null);

  const { data: foodDb } = useFoodDb();

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

  // Função utilitária para identificar medidas contáveis
  const isCountableUnit = (nome: string) => {
    const keywords = [
      "unidade",
      "fatia",
      "colher",
      "pedaço",
      "porção",
      "concha",
      "copo",
      "xícara",
      "biscoito",
      "tablete",
      "fatias",
      "unidades",
      "unid",
    ];
    return keywords.some((kw) => nome.includes(kw));
  };

  // Handlers para interação com alimentos
  const handleSelectFood = (food: Alimento) => {
    if (!selectedFoods.find((f) => f.food.id === food.id)) {
      // Define mcIndex como 0 se houver medidas caseiras, caso contrário undefined
      const defaultMcIndex = food.mc && food.mc.length > 0 ? 0 : undefined;
      const nome = food.mc?.[0]?.nome_mc?.toLowerCase() || "";
      const isCountable = isCountableUnit(nome);
      const defaultAmount = isCountable ? 1 : Number(food.mc?.[0]?.peso) || 100;
      setSelectedFoods([
        ...selectedFoods,
        { food, amount: defaultAmount, mcIndex: defaultMcIndex },
      ]); // Começa com 1 unidade ou peso padrão
    }
    setShowDropdown(false);
    setFoodSearch("");
  };

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
    newMcIndex: number | undefined // Aceita undefined se não houver medida caseira
  ) => {
    setSelectedFoods((prev) =>
      prev.map((item) =>
        item.food.id === foodId
          ? { ...item, amount: newAmount, mcIndex: newMcIndex }
          : item
      )
    );
  };

  // Handler para salvar os dados ao confirmar
  const handleSave = () => {
    if (onSave) {
      onSave(selectedFoods, notes);
    }
    onClose(); // Fecha o modal após salvar
  };

  // Resetar estado ao fechar
  useEffect(() => {
    if (!open) {
      setFoodSearch("");
      setSearchResults([]);
      setSelectedFoods(initialFoods.map((item) => ({ ...item })));
      setNotes(initialNotes);
      setLoadingFoods(false);
      setShowDropdown(false);
      setSelectedFoodForDetails(null);
    } else {
      setSelectedFoods(initialFoods.map((item) => ({ ...item })));
      setNotes(initialNotes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Remove initialFoods e initialNotes das dependências para evitar loop

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={window.innerWidth < 600} // Tela cheia em dispositivos muito pequenos
      aria-labelledby="add-food-dialog-title" // Melhor usar aria-labelledby
    >
      {/* === HEADER MODIFICADO === */}
      <DialogTitle
        sx={{
          m: 0, // Remove margens padrão
          p: 2, // Padding consistente
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`, // Linha divisória
          // background: theme.palette.background.paper, // Mantém um fundo (opcional)
        }}
        id="add-food-dialog-title" // ID para aria-labelledby
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          {" "}
          {/* Usar h6 é mais comum para títulos de modal */}
          {mealName ? `Refeição: ${mealName}` : "Adicionar Alimento à Refeição"}
        </Typography>
        <IconButton
          aria-label="fechar"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[600], // Cor sutil para o ícone
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {/* === FIM DO HEADER MODIFICADO === */}

      <DialogContent
        dividers // Adiciona divisores padrão do MUI (alternativa à borda manual no header/footer)
        sx={{
          py: 3, // Ajusta padding vertical se usar dividers
          px: { xs: 2, sm: 3 },
          position: "relative",
          // overflowY: "auto", // 'dividers' pode já cuidar disso
          backgroundColor: theme.palette.background.default, // Fundo do conteúdo
          "&::-webkit-scrollbar": {
            width: 6,
            background: theme.palette.grey[200],
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.grey[400],
            borderRadius: 3,
            minHeight: 20,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme.palette.grey[600],
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${theme.palette.grey[400]} ${theme.palette.grey[200]}`,
        }}
      >
        {/* Overlay para foco no dropdown, restrito ao modal */}
        {showDropdown && (
          <Box
            onClick={() => setShowDropdown(false)}
            sx={{
              position: "fixed", // Usa fixed para cobrir toda a viewport DENTRO do modal
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(30, 30, 30, 0.2)",
              zIndex: 1, // Abaixo do dropdown, mas acima do conteúdo
            }}
          />
        )}
        {/* Seção de Adicionar Alimento */}
        <AddFoodSection
          foodSearch={foodSearch}
          setFoodSearch={setFoodSearch}
          searchResults={searchResults}
          setSearchResults={setSearchResults} // Passando o setter
          loadingFoods={loadingFoods}
          setLoadingFoods={setLoadingFoods} // Passando o setter
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          anchorRef={anchorRef}
          inputWidth={inputWidth}
          setInputWidth={setInputWidth} // Passando o setter
          handleSelectFood={handleSelectFood}
          handleOpenDetails={handleOpenDetails}
        />
        {/* Seção de Alimentos Prescritos/Selecionados */}
        <PrescribedFoodsSection
          selectedFoods={selectedFoods}
          handleRemoveFood={handleRemoveFood}
          handleUpdatePrescribedFood={handleUpdatePrescribedFood}
          handleOpenDetails={handleOpenDetails}
        />
        {/* Seção de Análise de Nutrientes */}
        <NutrientAnalysis
          protein={totalMacros.protein || 0}
          fat={totalMacros.fat || 0}
          carbohydrates={totalMacros.carbohydrates || 0}
          calories={totalMacros.calories || 0}
          totalWeight={totalWeight}
        />
        {/* Seção de Observações da Refeição (Usando o componente externo, se existir) */}
        {/* <MealNotesSection notes={notes} setNotes={setNotes} /> */}

        {/* Ou mantendo o TextField diretamente aqui se MealNotesSection não existir */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            mb: 0, // Remover margem inferior se o footer cuida do espaçamento
            mt: 2, // Adicionar margem superior para separar da Análise
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2, // Reduzir margem inferior
              fontWeight: "bold",
              color: theme.palette.primary.main, // Manter cor primária
              textAlign: "left", // Alinhar à esquerda
            }}
          >
            Observações da Refeição
          </Typography>
          <TextField
            value={notes} // Controlar o valor
            onChange={(e) => setNotes(e.target.value)} // Atualizar o estado
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            placeholder="Adicione comentários ou orientações sobre esta refeição..."
            aria-label="Observações sobre a refeição"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: theme.palette.grey[50], // Fundo leve para destaque
                "& fieldset": {
                  borderColor: theme.palette.grey[300], // Borda sutil
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.light, // Interação no hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main, // Foco
                  borderWidth: "1px", // Evitar aumento de espessura no foco
                },
              },
            }}
          />
        </Paper>
      </DialogContent>

      {/* === FOOTER MODIFICADO === */}
      <DialogActions
        sx={{
          p: 2, // Padding consistente
          // borderTop: `1px solid ${theme.palette.divider}`, // Linha divisória (redundante se DialogContent tem 'dividers')
          justifyContent: "flex-end", // Alinha botões à direita
          gap: 1, // Espaçamento entre botões
          backgroundColor: theme.palette.background.paper, // Fundo (opcional, para contraste)
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined" // Menos destaque que o botão principal
          sx={{ minWidth: 100, borderRadius: 2 }} // Ajuste de largura mínima
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="success" // Ação principal positiva
          sx={{ minWidth: 100, borderRadius: 2 }} // Ajuste de largura mínima
        >
          Confirmar
        </Button>
      </DialogActions>
      {/* === FIM DO FOOTER MODIFICADO === */}

      {/* Modal de Detalhes do Alimento */}
      <FoodDetailsModal
        open={!!selectedFoodForDetails}
        onClose={() => setSelectedFoodForDetails(null)}
        food={selectedFoodForDetails}
        onAdd={(food) => {
          // Lógica para adicionar vinda dos detalhes, similar ao handleSelectFood
          if (!selectedFoods.find((f) => f.food.id === food.id)) {
            const defaultMcIndex =
              food.mc && food.mc.length > 0 ? 0 : undefined;
            setSelectedFoods([
              ...selectedFoods,
              { food, amount: 100, mcIndex: defaultMcIndex },
            ]);
          }
          setSelectedFoodForDetails(null); // Fecha o modal de detalhes
        }}
      />
    </Dialog>
  );
};

export default AddFoodToMealModal;
