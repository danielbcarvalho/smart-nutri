import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CssBaseline from "@mui/material/CssBaseline";
import ErrorSnackbar from "./components/ErrorHandling/ErrorSnackbar";
import { Layout } from "./layouts/Layout";
import { PatientLayout } from "./layouts/PatientLayout";
import { Home } from "@modules/home/pages/HomePage";
import { NewAssessment } from "@modules/assessment/pages/NewAssessment/NewAssessmentPage";
import { Login } from "./modules/auth/pages/Login/LoginPage";
import { Register } from "./modules/auth/pages/Register/RegisterPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { Box, Typography, Button } from "@mui/material";
import { Assessments } from "@modules/assessment/pages/AssessentsPage";
import { AssessmentEvolution } from "@modules/assessment/pages/AssessmentEvolution/AssessmentEvolutionPage";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Patients } from "./modules/patient/pages/Patients/PatientsPage";
import { PatientInfo } from "./modules/patient/pages/PatientInfo/PatientInfoPage";
import { MealPlan } from "./modules/meal-plan/pages/MealPlansListPage";
import { MealPlanDetails } from "./modules/meal-plan/pages/MealPlanDetails/MealPlanDetailsPage";
import EnergyPlanPage from "@/modules/energy-plan/pages/EnergyPlanListPage";
import EnergyPlanMain from "@/modules/energy-plan/pages/EnergyPlanDetailsPage";
import { ThemeProvider } from "./theme/ThemeContext";
import { LogoProvider } from "./contexts/LogoContext";
import { NutritionistSettingsProvider } from "./contexts/NutritionistSettingsContext";
import React from "react";

// Placeholder components
const DocumentsPlaceholder = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5">Documentos</Typography>
    <Typography color="text.secondary">Em desenvolvimento...</Typography>
  </Box>
);

const PlansPlaceholder = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5">Planos alimentares</Typography>
    <Typography color="text.secondary">Em desenvolvimento...</Typography>
  </Box>
);

const queryClient = new QueryClient();

// Componente de erro amigável
function ErrorFallback() {
  const error = useRouteError();
  let title = "Ocorreu um erro inesperado";
  let description = "Tente novamente ou entre em contato com o suporte.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Página não encontrada (404)";
      description = "A página que você tentou acessar não existe.";
    } else if (error.status === 401) {
      title = "Não autorizado (401)";
      description = "Você não tem permissão para acessar esta página.";
    } else if (error.status === 500) {
      title = "Erro interno do servidor (500)";
      description = "Algo deu errado no servidor.";
    }
  }

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {description}
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Voltar para o início
      </Button>
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "patients",
        element: <Patients />,
      },
      {
        path: "patient/:patientId",
        element: <PatientLayout />,
        children: [
          {
            index: true,
            element: <PatientInfo />,
          },
          {
            path: "meal-plans",
            children: [
              {
                index: true,
                element: <MealPlan />,
              },
              {
                path: "new",
                element: <PlansPlaceholder />,
              },
              {
                path: ":planId",
                element: <MealPlanDetails />,
              },
            ],
          },
          {
            path: "documents",
            element: <DocumentsPlaceholder />,
          },
          {
            path: "assessments",
            children: [
              {
                index: true,
                element: <Assessments />,
              },
              {
                path: "new",
                element: <NewAssessment />,
              },
              {
                path: "edit/:measurementId",
                element: <NewAssessment />,
              },
              {
                path: "evolution/measurements",
                element: <AssessmentEvolution />,
              },
              {
                path: "evolution/photos",
                element: <AssessmentEvolution />,
              },
            ],
          },
          {
            path: "energy-plans",
            children: [
              {
                index: true,
                element: <EnergyPlanPage />,
              },
              {
                path: "edit/:planId",
                element: <EnergyPlanMain />,
              },
              {
                path: "new",
                element: <EnergyPlanMain />,
              },
            ],
          },
        ],
      },
      {
        path: "patient/:patientId/edit",
        element: <PatientInfo />,
      },
    ],
  },
]);

function App() {
  const [user, setUser] = React.useState(() => {
    const storedUser = localStorage.getItem("@smartnutri:user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("@smartnutri:user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    // Listener para mudanças no localStorage (outras abas)
    window.addEventListener("storage", handleStorageChange);

    // Listener para mudanças no localStorage (mesma aba)
    const handleLocalStorageChange = (e: StorageEvent) => {
      if (e.key === "@smartnutri:user") {
        handleStorageChange();
      }
    };

    window.addEventListener("storage", handleLocalStorageChange);

    // Disparar um evento personalizado quando o usuário fizer login
    const handleLogin = () => {
      const storedUser = localStorage.getItem("@smartnutri:user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    window.addEventListener("userLogin", handleLogin);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage", handleLocalStorageChange);
      window.removeEventListener("userLogin", handleLogin);
    };
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NutritionistSettingsProvider user={user}>
          <LogoProvider>
            <CssBaseline />
            <ErrorSnackbar />
            <RouterProvider router={router} />
          </LogoProvider>
        </NutritionistSettingsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
