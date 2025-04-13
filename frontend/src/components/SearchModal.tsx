import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Modal,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Fade,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  SearchOff as SearchOffIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { searchAll } from "../services/search.service";
import { SearchResult } from "../types/search";
import debounce from "lodash/debounce";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSearchValue("");
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [open]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length >= 3) {
        setIsSearching(true);
        const results = await searchAll(term);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 350),
    []
  );

  // Handle input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    debouncedSearch(newValue);
  };

  // Clear search input
  const handleClear = () => {
    setSearchValue("");
    setSearchResults([]);
  };

  // Handle result click
  const handleResultClick = (link: string) => {
    window.location.href = link;
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="search-modal"
      closeAfterTransition
      sx={{ zIndex: 1300 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 540,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: "none",
            minHeight: 120,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <SearchIcon sx={{ color: "text.secondary", fontSize: 28 }} />
            <TextField
              fullWidth
              placeholder="Pesquisar pacientes ou planos..."
              variant="standard"
              value={searchValue}
              onChange={handleSearchChange}
              autoFocus
              InputProps={{
                endAdornment: searchValue ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar pesquisa"
                      onClick={handleClear}
                      size="small"
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              inputProps={{
                "aria-label": "Campo de pesquisa",
                maxLength: 64,
              }}
            />
            <IconButton
              onClick={onClose}
              sx={{ color: "text.secondary" }}
              aria-label="Fechar"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Loading State */}
          {isSearching && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {/* Results */}
          {!isSearching && searchResults.length > 0 && (
            <Paper
              sx={{ mt: 2, maxHeight: 340, overflow: "auto", borderRadius: 2 }}
            >
              {searchResults.map((result, index) => (
                <Box
                  key={result.id}
                  sx={{
                    p: 2,
                    borderBottom:
                      index !== searchResults.length - 1
                        ? "1px solid #eee"
                        : "none",
                    "&:hover": { bgcolor: "action.hover" },
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onClick={() => handleResultClick(result.link)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ir para ${result.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleResultClick(result.link);
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {result.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={
                      result.type === "patient"
                        ? "primary.main"
                        : "secondary.main"
                    }
                  >
                    {result.type === "patient" ? "Paciente" : "Plano alimentar"}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}

          {/* Empty State */}
          {!isSearching &&
            searchValue.length >= 3 &&
            searchResults.length === 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 6,
                  color: "text.secondary",
                  gap: 1,
                }}
              >
                <SearchOffIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" fontWeight={500}>
                  Ops! Termo não encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tente usar outras palavras-chave ou revise sua busca.
                </Typography>
              </Box>
            )}
        </Box>
      </Fade>
    </Modal>
  );
};
