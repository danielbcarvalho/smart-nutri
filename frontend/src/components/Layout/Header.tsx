import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Avatar,
  Divider,
  Modal,
  Paper,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { authService } from "../../services/authService";
import { SearchModal } from "../SearchModal";

export const Header = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = authService.getUser();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    authService.logout();
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

            <Tooltip title="Perfil">
              <IconButton
                onClick={() => setProfileOpen(true)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                  }}
                >
                  {user ? getInitials(user.name) : <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modal de pesquisa */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

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
            <NotificationsIcon sx={{ fontSize: 48 }} />
            <Typography variant="body1">
              Nenhuma notificação no momento
            </Typography>
          </Box>
        </Paper>
      </Modal>

      {/* Modal de Perfil */}
      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          mt: "64px", // Altura do header
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">Meu Perfil</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Logout">
                <IconButton
                  onClick={handleLogout}
                  size="small"
                  sx={{ color: "text.secondary" }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                size="small"
                onClick={() => setProfileOpen(false)}
                sx={{ color: "text.secondary" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Conteúdo do Perfil */}
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                }}
              >
                {user ? getInitials(user.name) : <PersonIcon />}
              </Avatar>
              <Typography variant="h6">{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {user?.crn && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    CRN
                  </Typography>
                  <Typography variant="body1">{user.crn}</Typography>
                </Box>
              )}

              {user?.clinicName && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Clínica
                  </Typography>
                  <Typography variant="body1">{user.clinicName}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};
