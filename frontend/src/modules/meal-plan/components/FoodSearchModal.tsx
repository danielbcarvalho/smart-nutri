import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ManageSearch as EmptySearchIcon,
} from "@mui/icons-material";
import { searchFoods } from "@/services/foodService";
import { useFoodDb } from "@/services/useFoodDb";
import type { Alimento } from "./AddFoodToMealModal";
import SelectedFoodCard from "./SelectedFoodCard";

interface FoodSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (food: Alimento, amount: number, mcIndex?: number) => void;
  context: "principal" | "substituto";
  targetFoodName?: string;
}

const ITEMS_PER_PAGE = 12;
const SEARCH_DELAY = 300;

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  open,
  onClose,
  onSelect,
  context,
  targetFoodName,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: foodDb } = useFoodDb();

  // Estados
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState<Alimento[]>([]);
  const [displayedResults, setDisplayedResults] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Alimento | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const hasContent = search.length >= 2 || selectedFood;
  const hasResults = displayedResults.length > 0;
  const isSearching = loading && search.length >= 2;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([]);
      setDisplayedResults([]);
      setLoading(false);
      setCurrentPage(0);
      return;
    }

    setLoading(true);
    const filtered = searchFoods(
      debouncedSearch,
      Array.isArray(foodDb) ? foodDb : []
    );
    const filteredArray = Array.isArray(filtered) ? filtered : [];

    setResults(filteredArray);
    setDisplayedResults(filteredArray.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredArray.length > ITEMS_PER_PAGE);
    setCurrentPage(0);
    setLoading(false);
  }, [debouncedSearch, foodDb]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
      setResults([]);
      setDisplayedResults([]);
      setSelectedFood(null);
      setCurrentPage(0);
    }
  }, [open]);

  const loadMoreItems = useCallback(() => {
    const nextPage = currentPage + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newItems = results.slice(startIndex, endIndex);

    setDisplayedResults((prev) => [...prev, ...newItems]);
    setCurrentPage(nextPage);
    setHasMore(endIndex < results.length);
  }, [currentPage, results]);

  const handleSelectFood = useCallback((food: Alimento) => {
    setSelectedFood(food);
  }, []);

  const handleConfirm = useCallback(
    (amount: number, mcIndex: number) => {
      if (selectedFood) {
        onSelect(selectedFood, amount, mcIndex);
        onClose();
      }
    },
    [selectedFood, onSelect, onClose]
  );

  const clearSelection = useCallback(() => {
    setSelectedFood(null);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
  }, []);

  const getModalHeight = () => {
    if (isMobile) return "100%";
    if (!hasContent) return "auto";
    if (selectedFood && !hasResults) return "auto";
    if (hasResults || isSearching) return "75vh";
    return "auto";
  };

  const getMaxWidth = () => {
    if (!hasContent) return "sm";
    return "md";
  };

  // Food Item Component
  const FoodItem = ({ food }: { food: Alimento }) => {
    const isSelected = selectedFood?.id === food.id;

    // 1. Determinar a medida base para exibição no card
    let baseWeight = 100; // Default: os dados nutricionais do alimento são por 100g/ml
    let baseName = `100${food.unidade || "g"}`;
    let isAVontade = false;

    const mcs =
      food.mc && Array.isArray(food.mc)
        ? food.mc.map((m) => ({ ...m, pesoNum: Number(m.peso) }))
        : [];

    const mcsComPeso = mcs.filter((m) => m.pesoNum > 0);

    if (mcsComPeso.length > 0) {
      const primaryMc = mcsComPeso.find((m) => {
        const nomeMcLower = m.nome_mc.toLowerCase();
        return (
          !nomeMcLower.includes("grama") &&
          !nomeMcLower.match(/^g$|^ml$/i) &&
          m.pesoNum > 0
        );
      });

      if (primaryMc) {
        baseWeight = primaryMc.pesoNum;
        baseName = primaryMc.nome_mc;
      }
    } else {
      const aVontadeMc = mcs.find(
        (m) => m.pesoNum === 0 && m.nome_mc.toLowerCase().includes("vontade")
      );
      if (aVontadeMc) {
        isAVontade = true;
        baseWeight = 0;
        baseName = aVontadeMc.nome_mc;
      }
    }

    // 2. Calcular multiplicador e valores nutricionais
    const multiplier = baseWeight > 0 ? baseWeight / 100 : 0;

    const formatKcal = (val: number | undefined | null): string =>
      val !== undefined && val !== null ? Math.round(val).toString() : "0";

    const formatMacro = (val: number | undefined | null): string => {
      if (val === undefined || val === null || isNaN(val)) return "--";
      if (Object.is(val, -0)) val = 0;
      if (val === 0) return "0";
      let fixedStr;
      if (Math.abs(val) >= 10) fixedStr = val.toFixed(0);
      else if (Math.abs(val) >= 0.1) fixedStr = val.toFixed(1);
      else fixedStr = val.toFixed(2);
      if (fixedStr.endsWith(".0")) {
        fixedStr = fixedStr.substring(0, fixedStr.length - 2);
      }
      return fixedStr;
    };

    let displayKcal = formatKcal((food.kcal || 0) * multiplier);
    let displayPtn = formatMacro((food.ptn || 0) * multiplier);
    let displayCho = formatMacro((food.cho || 0) * multiplier);
    let displayLip = formatMacro((food.lip || 0) * multiplier);
    let displayFibras = food.fibras
      ? formatMacro(food.fibras * multiplier)
      : "0";

    if (isAVontade) {
      displayKcal = "--";
      displayPtn = "--";
      displayCho = "--";
      displayLip = "--";
      displayFibras = "--";
    }

    // 3. Formatar o texto da porção base
    let finalBaseInfoText: string;
    const foodUnit = (food.unidade || "g").toLowerCase();

    if (isAVontade) {
      finalBaseInfoText = `por ${baseName.toLowerCase()}`;
    } else {
      const baseNameLower = baseName.toLowerCase();
      if (
        baseWeight === 100 &&
        baseNameLower.match(new RegExp(`^100\\s?${foodUnit}$`, "i"))
      ) {
        finalBaseInfoText = `por ${baseNameLower}`;
      } else if (
        baseNameLower.match(new RegExp(`\\(${baseWeight}${foodUnit}\\)`, "i"))
      ) {
        finalBaseInfoText = `por ${baseNameLower}`;
      } else {
        finalBaseInfoText = `por ${baseNameLower} (${baseWeight}${foodUnit})`;
      }
    }

    return (
      <Card
        sx={{
          cursor: "pointer",
          border: "1px solid",
          borderColor: isSelected ? "primary.main" : "divider",
          bgcolor: isSelected ? "primary.50" : "background.paper",
          mb: 1,
          boxShadow: isSelected ? 2 : 0,
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: 2,
          },
          p: 0,
        }}
        onClick={() => handleSelectFood(food)}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              mb: 0.5,
            }}
          >
            <Box sx={{ flexGrow: 1, minWidth: "50%" }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{
                  fontSize: "1rem",
                  lineHeight: 1.3,
                  color: isSelected ? "primary.main" : "text.primary",
                }}
              >
                {food.nome}
              </Typography>
              {food.grupo && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1.2 }}
                >
                  {food.grupo}
                </Typography>
              )}
            </Box>
          </Box>

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
              {displayKcal} kcal
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
              P: {displayPtn !== "--" ? `${displayPtn}g` : "--"}
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
              C: {displayCho !== "--" ? `${displayCho}g` : "--"}
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
              G: {displayLip !== "--" ? `${displayLip}g` : "--"}
            </Typography>
            {food.fibras && displayFibras !== "0" && displayFibras !== "--" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  minWidth: "auto",
                  px: isMobile ? 0.3 : 0.5,
                  textAlign: "left",
                }}
              >
                Fb: {displayFibras}g
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 0.5,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Valores {finalBaseInfoText}
            </Typography>
            {food.origem && (
              <>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.disabled"
                  sx={{ mx: 0.25 }}
                >
                  •
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Origem: {food.origem}
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Empty State Component
  const EmptyState = () => (
    <Fade in={!hasContent}>
      <Box
        sx={{
          py: 6,
          px: 3,
          textAlign: "center",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EmptySearchIcon
          sx={{
            fontSize: 64,
            color: "text.secondary",
            mb: 2,
            opacity: 0.6,
          }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {context === "principal"
            ? "Procure por um alimento"
            : "Encontre um substituto"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 300 }}
        >
          Digite o nome do alimento que você está procurando no campo acima.
        </Typography>
        {context === "substituto" && targetFoodName && (
          <Chip
            label={`Substituto para: ${targetFoodName}`}
            color="primary"
            variant="outlined"
            sx={{ mt: 2 }}
          />
        )}
      </Box>
    </Fade>
  );

  // Loading State Component
  const LoadingState = () => (
    <Fade in={isSearching}>
      <Box
        sx={{
          py: 4,
          px: 3,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Procurando alimentos...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          "{search}"
        </Typography>
      </Box>
    </Fade>
  );

  // Food Selection Component
  const FoodSelection = () => {
    if (!selectedFood) return null;

    return (
      <SelectedFoodCard
        food={selectedFood}
        onConfirm={handleConfirm}
        onCancel={clearSelection}
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={getMaxWidth()}
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={Grow}
      transitionDuration={300}
      PaperProps={{
        sx: {
          height: getModalHeight(),
          maxHeight: isMobile ? "100%" : getModalHeight(),
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            {context === "principal"
              ? "Adicionar alimento"
              : "Adicionar substituto"}
          </Typography>
          {context === "substituto" && targetFoodName && hasContent && (
            <Typography variant="body2" color="text.secondary">
              Para: {targetFoodName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            flexShrink: 0,
          }}
        >
          <TextField
            fullWidth
            label="Buscar alimento"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
              endAdornment: search && (
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              ),
            }}
            placeholder="Digite pelo menos 2 caracteres..."
            size={isMobile ? "small" : "medium"}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            py: hasContent || hasResults ? 2 : 0,
            px: 2,
          }}
        >
          {!hasContent && <EmptyState />}
          {isSearching && <LoadingState />}

          {!loading && hasContent && (
            <>
              <FoodSelection />

              {debouncedSearch.length >= 2 &&
                results.length === 0 &&
                !selectedFood && (
                  <Fade in={true}>
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography
                        color="text.secondary"
                        variant="h6"
                        gutterBottom
                      >
                        Nenhum resultado encontrado
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Tente buscar por "{debouncedSearch}" com outros termos.
                      </Typography>
                    </Box>
                  </Fade>
                )}

              {displayedResults.length > 0 && (
                <Fade in={true} timeout={500}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {results.length} resultado
                      {results.length !== 1 ? "s" : ""} encontrado
                      {results.length !== 1 ? "s" : ""}
                      {displayedResults.length < results.length &&
                        ` (mostrando ${displayedResults.length})`}
                    </Typography>

                    {displayedResults.map((food, index) => (
                      <Box
                        key={`${food.id}-${index}-${food.nome}`}
                        sx={{ animationDelay: `${index * 50}ms` }}
                      >
                        <FoodItem food={food} />
                      </Box>
                    ))}

                    {hasMore && (
                      <Fade in={true}>
                        <Box sx={{ textAlign: "center", mt: 3, mb: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={loadMoreItems}
                            size={isMobile ? "small" : "medium"}
                          >
                            Carregar mais (
                            {results.length - displayedResults.length}{" "}
                            restantes)
                          </Button>
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </Fade>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchModal;
