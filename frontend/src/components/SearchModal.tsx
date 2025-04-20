import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  Fade,
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  SearchOff as SearchOffIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import debounce from "lodash/debounce";
import { searchAll } from "../services/search.service";
import { SearchResult } from "../types/search";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // reset on close
  useEffect(() => {
    if (!open) {
      setSearchValue("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await searchAll(q);
      setResults(res);
      setLoading(false);
    }, 350),
    []
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    doSearch(e.target.value);
  };

  const onClear = () => {
    setSearchValue("");
    setResults([]);
  };

  const onResultClick = (link: string) => {
    window.location.href = link;
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      aria-labelledby="search-modal"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        mt: "88px",
        px: 2,
        zIndex: theme.zIndex.tooltip + 1,
      }}
    >
      <Fade in={open}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 600,
            borderRadius: 2,
            boxShadow: 24,
            outline: "none",
            overflow: "hidden",
          }}
        >
          {/* Header + input */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <SearchIcon color="action" sx={{ mr: 1 }} />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Pesquisar pacientes ou planos..."
              value={searchValue}
              onChange={onChange}
              autoFocus
              InputProps={{
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <IconButton onClick={onClear} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 64 }}
            />
            <IconButton onClick={onClose} sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Loading */}
          {loading && (
            <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {/* Resultados */}
          {!loading && results.length > 0 && (
            <List sx={{ maxHeight: 360, overflow: "auto" }}>
              {results.map((r) => (
                <ListItemButton
                  key={r.id}
                  onClick={() => onResultClick(r.link)}
                >
                  <ListItemText
                    primary={r.title}
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {r.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={r.type === "patient" ? "primary" : "secondary"}
                        >
                          {r.type === "patient"
                            ? "Paciente"
                            : "Plano alimentar"}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}

          {/* Empty */}
          {!loading && searchValue.length >= 3 && results.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
              <SearchOffIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6">Nenhum resultado</Typography>
              <Typography variant="body2">
                Tente outra palavra-chave.
              </Typography>
            </Box>
          )}
        </Paper>
      </Fade>
    </Modal>
  );
};
