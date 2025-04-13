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
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Info,
  RestaurantMenu,
  Assessment,
  Description,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../services/patientService";

export function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  return (
    <Box sx={{ display: "flex" }}>
      {/* SEU HEADER ORIGINAL AQUI (preservado) */}
      <AppBar position="fixed" elevation={1}>
        <Toolbar>
          {/* Seus botões, notificações e logo atual */}
          <Typography variant="h6">Header Principal</Typography>
        </Toolbar>
      </AppBar>

      {/* SEGUNDO header com botão hamburguer (visível somente no mobile) */}
      {mobile && (
        <Paper
          sx={{
            position: "fixed",
            top: "64px", // altura do header principal
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            height: "48px",
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
      )}

      {/* Drawer no mobile */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {SidebarContent}
      </Drawer>

      {/* Sidebar fixa no desktop */}
      {!mobile && (
        <Paper
          elevation={3}
          sx={{
            width: 250,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            position: "fixed",
            top: "64px", // altura do header principal
            left: 0,
          }}
        >
          {SidebarContent}
        </Paper>
      )}

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: theme.palette.grey[100],
          // mt: mobile ? "112px" : "64px", // 64px + novo header no mobile
          ml: { xs: 0, md: "250px" },
          p: { xs: 2, md: 4 },
          minHeight: mobile ? "calc(100vh - 112px)" : "calc(100vh - 64px)",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
