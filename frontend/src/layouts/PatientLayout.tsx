import React, { useState } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  Info,
  RestaurantMenu,
  Assessment,
  Description,
  ChevronLeft,
  ChevronRight,
  Timeline as TimelineIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../modules/patient/services/patientService";
import { Container } from "../components/Layout/Container";
import { getPreloadFoodDb } from "@/services/useFoodDb";
import { HeaderGlobal } from "../components/Layout/HeaderGlobal";

export function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const theme = useTheme();
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
      label: "Evolução de Medidas",
      icon: <TimelineIcon />,
      path: `/patient/${patientId}/assessments/evolution/measurements`,
    },
    {
      label: "Evolução Fotográfica",
      icon: <PhotoCameraIcon />,
      path: `/patient/${patientId}/assessments/evolution/photos`,
    },
    {
      label: "Documentos",
      icon: <Description />,
      path: `/patient/${patientId}/documents`,
    },
  ];

  const handleMenuClick = (item: { label: string }) => {
    if (item.label === "Planos Alimentares") {
      getPreloadFoodDb(queryClient);
    }
    // Drawer control agora é feito pelo HeaderGlobal
  };

  const SidebarContent = (
    <Box
      sx={{
        width: sidebarMinimized ? 60 : 250,
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: sidebarMinimized ? "center" : "stretch",
        transition: "width 0.2s",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: sidebarMinimized ? "center" : "flex-end",
          mb: 2,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setSidebarMinimized((v) => !v)}
          sx={{ mb: sidebarMinimized ? 0 : 1 }}
        >
          {sidebarMinimized ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      {!sidebarMinimized && (
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          mb={2}
          textAlign="left"
        >
          Paciente:
          <br />
          <Typography component="span" color="primary">
            {patient?.name || "Carregando..."}
          </Typography>
        </Typography>
      )}
      <List component="nav" sx={{ mt: 1 }}>
        {menuItems.map((item) => (
          <Tooltip
            key={item.path}
            title={sidebarMinimized ? item.label : ""}
            placement="right"
          >
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={() => handleMenuClick(item)}
              {...(item.label === "Informações pessoais" ? { end: true } : {})}
              sx={{
                justifyContent: sidebarMinimized ? "center" : "flex-start",
                px: sidebarMinimized ? 1 : 2,
                "&.active": {
                  bgcolor: theme.palette.primary.main + "15",
                  "& .MuiListItemIcon-root, & .MuiListItemText-root": {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarMinimized ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!sidebarMinimized && <ListItemText primary={item.label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <Container>
      {/* HeaderGlobal com menu contextual apenas no mobile */}
      {isMobile && (
        <HeaderGlobal
          drawerContent={SidebarContent}
          drawerTitle="Menu Paciente"
        />
      )}
      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: sidebarMinimized ? 60 : 250,
            bgcolor: "transparent",
            py: 4,
            px: 2,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
            transition: "width 0.2s",
            minHeight: "100vh",
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
            m: { xs: 0, md: 4 },
            p: { xs: 0, md: 4 },
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Container>
  );
}
