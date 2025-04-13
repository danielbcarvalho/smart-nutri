import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme/index";
import ErrorSnackbar from "./components/ErrorHandling/ErrorSnackbar";
import { Layout } from "./layouts/Layout";
import { PatientLayout } from "./layouts/PatientLayout";
import { Home } from "./pages/Home";
import { Patients } from "./pages/Patients";
import { PatientForm } from "./pages/PatientForm";
import { MealPlan } from "./pages/MealPlan";
import { MealPlanDetails } from "./pages/MealPlanDetails";
import { PatientInfo } from "./pages/PatientInfo";
import { NewAssessment } from "./pages/NewAssessment/index";
import { NewMealPlan } from "./pages/NewMealPlan";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PrivateRoute } from "./components/PrivateRoute";
import { Box, Typography } from "@mui/material";
import { Assessments } from "./pages/Assessments/index";
import { ViewAssessment } from "./pages/ViewAssessment";

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
        path: "patients/new",
        element: <PatientForm />,
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
                path: "view/:measurementId",
                element: <ViewAssessment />,
              },
            ],
          },
        ],
      },
      {
        path: "patient/:patientId/edit",
        element: <PatientForm />,
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
