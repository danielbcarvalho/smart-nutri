import React from "react";
import { Outlet, useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../services/patientService";

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    label: "Informações Pessoais",
    icon: <PersonIcon />,
    path: "",
  },
  {
    label: "Planos Alimentares",
    icon: <RestaurantIcon />,
    path: "/meal-plans",
  },
  {
    label: "Avaliações",
    icon: <AssessmentIcon />,
    path: "/assessments",
  },
  {
    label: "Histórico",
    icon: <HistoryIcon />,
    path: "/history",
  },
  {
    label: "Documentos",
    icon: <DescriptionIcon />,
    path: "/documents",
  },
];

export function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  if (!patientId || !patient) {
    return null;
  }

  return (
    <Box sx={{ display: "flex" }}>
      {/* Side Menu */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" noWrap>
            {patient.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {patient.email}
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={
                  location.pathname === `/patient/${patientId}${item.path}`
                }
                onClick={() => navigate(`/patient/${patientId}${item.path}`)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar>
            <Breadcrumbs aria-label="breadcrumb">
              <MuiLink
                component={Link}
                to="/patients"
                color="inherit"
                underline="hover"
              >
                Pacientes
              </MuiLink>
              <MuiLink
                component={Link}
                to={`/patient/${patientId}`}
                color="inherit"
                underline="hover"
              >
                {patient.name}
              </MuiLink>
              <Typography color="text.primary">
                {menuItems.find(
                  (item) =>
                    location.pathname === `/patient/${patientId}${item.path}`
                )?.label || ""}
              </Typography>
            </Breadcrumbs>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
