import React, { useEffect, useRef, useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Box,
  CircularProgress,
  Popper,
  ClickAwayListener,
  useTheme,
  InputAdornment,
} from "@mui/material";
import FoodDropdownItem from "./FoodDropdownItem";
import { Alimento } from "./AddFoodToMealModal";
import {
  Search as SearchIcon,
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
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        mb: 2,
      }}
    >
      <Box ref={anchorRef} sx={{ position: "relative", width: "100%" }}>
        <TextField
          placeholder="Adicione um alimento ou receita"
          fullWidth
          value={foodSearch}
          onChange={(e) => setFoodSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.grey[500] }} />
              </InputAdornment>
            ),
            endAdornment: loadingFoods ? (
              <CircularProgress
                size={20}
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
            ) : null,
            sx: {
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.grey[300],
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.light,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
            },
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
          width: "100%",
          maxWidth: inputWidth || "100%",
        }}
        modifiers={[
          {
            name: "preventOverflow",
            options: {
              padding: 8,
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
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              border: `1px solid ${theme.palette.divider}`,
            }}
            ref={listRef}
            onScroll={handleScroll}
          >
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
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    minWidth: 200,
                    maxWidth: 200,
                    fontWeight: 600,
                    fontSize: { xs: 12, sm: 13 },
                    textAlign: "left",
                    pr: 1,
                  }}
                >
                  Nome do Alimento
                </Typography>
                <Box
                  sx={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      minWidth: 80,
                      maxWidth: 80,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1,
                      borderRight: "1px solid #eee",
                    }}
                  >
                    Quantidade
                  </Typography>
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1,
                      display: { xs: "none", sm: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee",
                    }}
                  >
                    Calorias
                  </Typography>
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1,
                      display: { xs: "none", md: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee",
                    }}
                  >
                    Gordura
                  </Typography>
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1,
                      display: { xs: "none", md: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee",
                    }}
                  >
                    Carbo
                  </Typography>
                  <Typography
                    sx={{
                      minWidth: 70,
                      maxWidth: 70,
                      fontWeight: 600,
                      fontSize: { xs: 12, sm: 13 },
                      textAlign: "right",
                      pr: 1,
                      display: { xs: "none", md: "flex" },
                      justifyContent: "flex-end",
                      borderRight: "1px solid #eee",
                    }}
                  >
                    Proteína
                  </Typography>
                  <Box
                    sx={{
                      minWidth: 40,
                      maxWidth: 40,
                      display: "flex",
                      pl: 0.5,
                    }}
                  />
                </Box>
              </Box>
            )}
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
            ) : limitedResults.length === 0 && foodSearch.length >= 2 ? (
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
                  foodSearch={foodSearch}
                  onSelect={handleSelectFood}
                  onOpenDetails={handleOpenDetails}
                  highlightTerm={highlightTerm}
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
