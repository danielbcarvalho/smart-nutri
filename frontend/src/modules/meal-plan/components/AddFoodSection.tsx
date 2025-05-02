import React, { useEffect, useRef, useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Box,
  CircularProgress,
  Popper,
  ClickAwayListener,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import FoodDropdownItem from "./FoodDropdownItem";
import { Alimento } from "./AddFoodToMealModal";
import {
  Search as SearchIcon,
  CompareArrows as CompareArrowsIcon,
  Fastfood as FastfoodIcon,
  SearchOff as SearchOffIcon,
} from "@mui/icons-material";

interface AddFoodSectionProps {
  foodSearch: string;
  setFoodSearch: (v: string) => void;
  searchResults: Alimento[];
  setSearchResults: React.Dispatch<React.SetStateAction<Alimento[]>>;
  loadingFoods: boolean;
  setLoadingFoods: React.Dispatch<React.SetStateAction<boolean>>;
  showDropdown: boolean;
  setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  inputWidth: number | undefined;
  setInputWidth: React.Dispatch<React.SetStateAction<number | undefined>>;
  handleSelectFood: (food: Alimento) => void;
  handleOpenDetails: (food: Alimento) => void;
}
const AddFoodSection: React.FC<AddFoodSectionProps> = ({
  foodSearch,
  setFoodSearch,
  searchResults,
  loadingFoods,
  // ... (rest of props)
  handleSelectFood,
  handleOpenDetails,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  const [visibleCount, setVisibleCount] = useState(30);
  const listRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined); // Ensure state hook is here
  const anchorRef = useRef<HTMLDivElement | null>(null); // Ensure anchorRef is here
  const [showDropdown, setShowDropdown] = useState(false); // Ensure showDropdown state is managed

  // Effect to calculate input width (if not already present)
  useEffect(() => {
    if (anchorRef.current) {
      setInputWidth(anchorRef.current.offsetWidth);
    }
  }, [anchorRef]);

  // Handler de scroll para carregar mais
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      // Perto do fundo
      setVisibleCount((prev) => Math.min(prev + 30, searchResults.length));
    }
  };
  // Effect to show/hide dropdown based on search and loading (if not already present)
  useEffect(() => {
    if (!loadingFoods && foodSearch.length >= 2) {
      setShowDropdown(true);
    } else if (foodSearch.length < 2) {
      setShowDropdown(false);
      // Optionally clear results when search is too short
      // setsearchResults([]);
    }
    // Keep dropdown open if loading started from a valid search
  }, [foodSearch, loadingFoods]);

  // ... (useEffect for visibleCount, handleScroll remain the same)

  const limitedResults = Array.isArray(searchResults)
    ? searchResults.slice(0, visibleCount)
    : [];

  // Handler to close dropdown
  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  const highlightTerm = (text: string, term: string): React.ReactNode => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <Box
              component="span"
              key={i}
              sx={{ backgroundColor: "yellow", fontWeight: "bold" }}
            >
              {part}
            </Box>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        mb: 2,
      }}
    >
      {/* ... (Typography Title, Tabs remain the same) ... */}
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: theme.palette.primary.main,
          textAlign: "center",
        }}
      >
        Adicionar Alimento
      </Typography>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{
          mb: 2,
          minHeight: 40,
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
          },
        }}
        variant="fullWidth"
        aria-label="Opções de busca de alimentos"
      >
        <Tab
          icon={<SearchIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          iconPosition="start"
          label={
            <Typography
              sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}
            >
              Busca por Alimentos
            </Typography>
          }
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: { xs: "0.8rem", sm: "0.97rem" },
            px: { xs: 1, sm: 2 },
          }}
        />
        {/* Other Tabs */}
        <Tab
          icon={<CompareArrowsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          iconPosition="start"
          label={
            <Typography
              sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}
            >
              Busca por Equivalentes
            </Typography>
          }
          disabled
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: { xs: "0.8rem", sm: "0.97rem" },
            px: { xs: 1, sm: 2 },
            opacity: 0.6,
          }}
        />
        <Tab
          icon={<FastfoodIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          iconPosition="start"
          label={
            <Typography
              sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}
            >
              Busca por Refeições
            </Typography>
          }
          disabled
          sx={{
            minHeight: 40,
            textTransform: "none",
            fontSize: { xs: "0.8rem", sm: "0.97rem" },
            px: { xs: 1, sm: 2 },
            opacity: 0.6,
          }}
        />
      </Tabs>

      <Box ref={anchorRef} sx={{ position: "relative", width: "100%" }}>
        <TextField
          label="Buscar Alimento ou Receita"
          placeholder="Digite o nome do alimento ou receita"
          fullWidth
          value={foodSearch}
          onChange={(e) => setFoodSearch(e.target.value)}
          // Removed onFocus to rely on useEffect for showing dropdown
          InputProps={{
            endAdornment: loadingFoods ? (
              <CircularProgress
                size={20}
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
            ) : null,
          }}
          aria-label="Campo de busca de alimentos ou receitas"
        />
      </Box>
      <Popper
        open={
          showDropdown &&
          (limitedResults.length > 0 ||
            (!loadingFoods && foodSearch.length >= 2))
        }
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{
          zIndex: 1303,
          width: "100%", // Use 100% width of the anchor
          maxWidth: inputWidth || "100%", // Constrain max width if calculated
        }}
        modifiers={[
          // Added modifier to prevent overflow if needed
          {
            name: "preventOverflow",
            options: {
              padding: 8, // Adjust padding as needed
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleCloseDropdown}>
          <Paper
            elevation={3}
            sx={{
              mt: 1,
              maxHeight: 320,
              overflow: "auto",
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              // ... scrollbar styles remain the same
              "&::-webkit-scrollbar": {
                width: 6,
                background: theme.palette.grey[200],
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
            ref={listRef}
            onScroll={handleScroll}
          >
            {/* Cabeçalho de colunas - APPLY SAME LAYOUT LOGIC */}
            {searchResults.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.grey[100],
                  fontWeight: "bold",
                  gap: 0.5, // Keep gap
                }}
              >
                {/* Header: Food Name */}
                <Typography
                  sx={{
                    minWidth: 200,
                    maxWidth: 200,
                    fontWeight: 600,
                    fontSize: { xs: 12, sm: 13 },
                    textAlign: "left",
                    pr: 1, // Padding like in item
                  }}
                >
                  Nome do Alimento
                </Typography>
                {/* Header: Spacer */}
                <Box
                  sx={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {/* --- Header Columns Right-to-Left --- */}

                  {/* Header: Quantity */}
                  <Typography
                    sx={{
                      minWidth: 80,
                      maxWidth: 80,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1, // Padding
                      borderRight: "1px solid #eee", // Border right
                    }}
                  >
                    Quantidade
                  </Typography>

                  {/* Header: Calories */}
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1, // Padding
                      // Use display: flex and justify for alignment if needed, but right usually works for titles
                      display: { xs: "none", sm: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee", // Border right
                    }}
                  >
                    Calorias
                  </Typography>

                  {/* Header: Fat */}
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1, // Padding
                      display: { xs: "none", md: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee", // Border right
                    }}
                  >
                    Gordura
                  </Typography>

                  {/* Header: Carbs */}
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1, // Padding
                      display: { xs: "none", md: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee", // Border right
                    }}
                  >
                    Carbo
                  </Typography>

                  {/* Header: Protein */}
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1, // Padding
                      display: { xs: "none", md: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee", // Border right
                    }}
                  >
                    Proteína
                  </Typography>

                  {/* Header: Empty Box for Info Button Alignment */}
                  <Box
                    sx={{
                      minWidth: 40,
                      maxWidth: 40,
                      // Needs display matching item row logic if consistent alignment needed
                      display: "flex", // Match item row for alignment
                      pl: 0.5, // Padding like item row button box
                      // No border, no content needed, just takes space
                    }}
                  />
                </Box>{" "}
                {/* End Header Right Block */}
              </Box>
            )}
            {/* ... (Loading, No Results, List Mapping remain the same) ... */}
            {loadingFoods ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={80}
              >
                <CircularProgress
                  size={24}
                  sx={{ color: theme.palette.primary.main }}
                />
              </Box>
            ) : limitedResults.length === 0 && foodSearch.length >= 2 ? ( // Ensure search term exists before showing "no results"
              <Typography
                color="text.secondary"
                sx={{
                  p: 2,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <SearchOffIcon
                  sx={{ fontSize: 20, color: theme.palette.text.disabled }}
                />
                Nenhum resultado encontrado.
              </Typography>
            ) : (
              limitedResults.map((food) => (
                <FoodDropdownItem
                  key={food.id}
                  food={food}
                  foodSearch={foodSearch} // Pass search term for highlighting
                  onSelect={handleSelectFood}
                  onOpenDetails={handleOpenDetails}
                  highlightTerm={highlightTerm} // Pass the highlight function
                />
              ))
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Paper>
  );
};

export default AddFoodSection;
