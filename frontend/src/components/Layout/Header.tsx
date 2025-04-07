import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Modal,
  TextField,
  Avatar,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Groups as GroupsIcon,
  NotificationsNone as EmptyNotificationsIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { searchAll } from "../../services/search.service";
import { SearchResult } from "../../types/search";
import debounce from "lodash/debounce";

export const Header = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length >= 3) {
        const results = await searchAll(term);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "white",
          color: "text.primary",
        }}
      >
        <Toolbar>
          {/* Logo/Título */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: "pointer",
              fontWeight: "bold",
              color: "primary.main",
            }}
            onClick={() => navigate("/")}
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

            <Tooltip title="Pacientes">
              <IconButton
                onClick={() => navigate("/patients")}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <GroupsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notificações">
              <IconButton
                onClick={() => setNotificationsOpen(true)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Configurações">
              <IconButton
                onClick={() => setSettingsOpen(true)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                cursor: "pointer",
              }}
            >
              N
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modal de Pesquisa */}
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          pt: 8,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 2,
            mx: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Pesquisar..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
            />
            <IconButton
              size="small"
              onClick={() => setSearchOpen(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Resultados da pesquisa */}
          {searchResults.length > 0 && (
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {searchResults.map((result, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    "&:hover": { bgcolor: "action.hover" },
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigate(result.link);
                    setSearchOpen(false);
                  }}
                >
                  <Typography variant="subtitle1">{result.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Modal>

      {/* Modal de Notificações */}
      <Modal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          pt: 8,
          pr: 2,
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 400,
            maxHeight: "calc(100vh - 100px)",
            overflow: "auto",
            borderRadius: 1,
            boxShadow: 24,
          }}
        >
          {/* Header do Modal */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Notificações</Typography>
            <IconButton
              size="small"
              onClick={() => setNotificationsOpen(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conteúdo - Estado Vazio */}
          <Box
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: "text.secondary",
            }}
          >
            <EmptyNotificationsIcon sx={{ fontSize: 48 }} />
            <Typography variant="body1">
              Nenhuma notificação no momento
            </Typography>
          </Box>
        </Paper>
      </Modal>

      {/* Modal de Configurações */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          pt: 8,
          pr: 2,
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: 400,
            maxHeight: "calc(100vh - 100px)",
            overflow: "auto",
            borderRadius: 1,
            boxShadow: 24,
          }}
        >
          {/* Header do Modal */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Configurações</Typography>
            <IconButton
              size="small"
              onClick={() => setSettingsOpen(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conteúdo - Em Breve */}
          <Box
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: "text.secondary",
            }}
          >
            <PaletteIcon sx={{ fontSize: 48 }} />
            <Typography variant="body1" textAlign="center">
              Em breve, modifique o tema do site e muito mais
            </Typography>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};
