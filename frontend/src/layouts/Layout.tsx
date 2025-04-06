import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Dialog,
  DialogContent,
  Autocomplete,
  TextField,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { searchAll, SearchResult } from "../services/search.service";
import debounce from "lodash/debounce";

export function Layout() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<SearchResult | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SearchResult[]>([]);

  // Função para buscar resultados com debounce
  const debouncedSearch = React.useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchAll(query);
        setOptions(results);
      } catch (error) {
        console.error("Erro na busca:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Função para navegar quando um resultado é selecionado
  const handleResultSelect = (result: SearchResult | null) => {
    if (!result) return;

    if (result.type === "patient") {
      navigate(`/patients/${result.id}`);
    } else if (result.type === "mealPlan") {
      navigate(`/meal-plans/${result.id}`);
    }

    setSearchValue(null);
    setSearchInputValue("");
    setSearchOpen(false);
  };

  // Limpa o debounce quando o componente é desmontado
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "background.paper",
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              flexGrow: 1,
              fontWeight: "bold",
            }}
          >
            SmartNutri
          </Typography>

          {/* Ícones do lado direito */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Pesquisar">
              <IconButton
                onClick={() => setSearchOpen(true)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notificações">
              <IconButton
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#ff4b4b",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Configurações">
              <IconButton
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Perfil">
              <IconButton>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                  }}
                >
                  N
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modal de Pesquisa */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SearchIcon sx={{ color: "text.secondary" }} />
            <Autocomplete
              open={options.length > 0}
              value={searchValue}
              onChange={(event, newValue) => {
                setSearchValue(newValue);
                handleResultSelect(newValue);
              }}
              inputValue={searchInputValue}
              onInputChange={(event, newInputValue) => {
                setSearchInputValue(newInputValue);
                debouncedSearch(newInputValue);
              }}
              options={options}
              loading={loading}
              getOptionLabel={(option) => option.name}
              fullWidth
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="body1">{option.name}</Typography>
                    {option.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {option.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar pacientes ou planos..."
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  autoFocus
                />
              )}
            />
            <IconButton
              onClick={() => setSearchOpen(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Paper>
        </DialogContent>
      </Dialog>

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
