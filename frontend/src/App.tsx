import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme/index";
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
                element: <PlansPlaceholder />,
                // element: <MealPlan />,
              },
              {
                path: "new",
                element: <PlansPlaceholder />,
                // element: <NewMealPlan />,
              },
              {
                path: ":planId",
                element: <PlansPlaceholder />,
                // element: <MealPlanDetails />,
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
                path: "evolution",
                element: <AssessmentEvolution />,
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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorSnackbar />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
