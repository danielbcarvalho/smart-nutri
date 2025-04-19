import React, { useState } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Avatar,
  Modal,
  Tooltip,
} from "@mui/material";
import {
  Info,
  RestaurantMenu,
  Assessment,
  Description,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../services/patientService";
import { Container } from "../components/Layout/Container";
import { authService } from "../services/authService";
import { SearchModal } from "../components/SearchModal";
import { HeaderGlobal } from "../components/Layout/HeaderGlobal";

export function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const user = authService.getUser();

  // Buscar os dados do paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  const menuItems = [
    {
      label: "Informações pessoais",
      icon: <Info />,
      path: `/patient/${patientId}`,
    },
    {
      label: "Planos Alimentares",
      icon: <RestaurantMenu />,
      path: `/patient/${patientId}/meal-plans`,
    },
    {
      label: "Avaliações",
      icon: <Assessment />,
      path: `/patient/${patientId}/assessments`,
    },
    {
      label: "Documentos",
      icon: <Description />,
      path: `/patient/${patientId}/documents`,
    },
  ];

  const SidebarContent = (
    <Box sx={{ width: 250, p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Paciente:
        <br />
        <Typography component="span" color="primary">
          {patient?.name || "Carregando..."}
        </Typography>
      </Typography>
      <Divider />
      <List component="nav" sx={{ mt: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
            sx={{
              "&.active": {
                bgcolor: theme.palette.primary.main + "15",
                "& .MuiListItemIcon-root, & .MuiListItemText-root": {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

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
    <Container>
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

      {/* Modal de IA - NOVO */}
      <Modal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
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
            <Typography variant="h6">Inteligência Artificial</Typography>
            <IconButton
              size="small"
              onClick={() => setAiOpen(false)}
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conteúdo do Modal de IA */}
          <Box
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            <img
              src="/images/ai-animated.gif"
              alt="IA Smart Nutri"
              style={{ width: 120, height: 120 }}
            />
            <Typography
              variant="h5"
              color="primary.main"
              sx={{ fontWeight: "bold" }}
            >
              Em breve
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Inteligência Artificial Smart Nutri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nossa IA especializada está chegando para auxiliar na criação de
              planos alimentares, relatórios nutricionais, insights de pacientes
              e aumentar sua produtividade.
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
          mt: "88px", // Altura do header
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

      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 250,
            bgcolor: "transparent",
            borderRight: "1px solid #F0F1F3",
            py: 4,
            px: 2,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          {SidebarContent}
        </Box>

        {/* Conteúdo principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#FAFAFA",
            minHeight: "60vh",
            borderRadius: "24px",
            m: 4,
            p: { xs: 2, md: 4 },
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Mobile: Drawer e header flutuante */}
      {mobile && (
        <>
          <Paper
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: theme.zIndex.appBar,
              height: "56px",
              display: "flex",
              alignItems: "center",
              px: 1,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
            }}
          >
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1">Menu Paciente</Typography>
          </Paper>
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            {SidebarContent}
          </Drawer>
        </>
      )}
    </Container>
  );
}
