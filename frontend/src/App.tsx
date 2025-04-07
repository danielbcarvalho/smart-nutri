import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme/index";
import { Layout } from "./layouts/Layout";
import { PatientLayout } from "./layouts/PatientLayout";
import { Home } from "./pages/Home";
import { Patients } from "./pages/Patients";
import { PatientForm } from "./pages/PatientForm";
import { MealPlan } from "./pages/MealPlan";
import { MealPlanDetails } from "./pages/MealPlanDetails";
import { PatientInfo } from "./pages/PatientInfo";
import { NewAssessment } from "./pages/NewAssessment";
import { NewMealPlan } from "./pages/NewMealPlan";
import { Box, Typography } from "@mui/material";

// Placeholder components
const DocumentsPlaceholder = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5">Documentos</Typography>
    <Typography color="text.secondary">Em desenvolvimento...</Typography>
  </Box>
);

const AssessmentsPlaceholder = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5">Avaliações</Typography>
    <Typography color="text.secondary">Em desenvolvimento...</Typography>
  </Box>
);

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
                element: <MealPlan />,
              },
              {
                path: "new",
                element: <NewMealPlan />,
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
                element: <AssessmentsPlaceholder />,
              },
              {
                path: "new",
                element: <NewAssessment />,
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
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
