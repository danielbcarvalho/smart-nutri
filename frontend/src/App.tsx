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
import { PatientDetails } from "./pages/PatientDetails";
import { MealPlan } from "./pages/MealPlan";
import { MealPlanDetails } from "./pages/MealPlanDetails";
import { PatientInfo } from "./pages/PatientInfo";

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
            element: <PatientDetails />,
          },
          {
            path: "meal-plans",
            children: [
              {
                index: true,
                element: <MealPlan />,
              },
              {
                path: ":planId",
                element: <MealPlanDetails />,
              },
            ],
          },
          {
            path: "info",
            element: <PatientInfo />,
          },
          {
            path: "documents",
            element: <PatientInfo />, // Using PatientInfo as a placeholder until you create a Documents component
          },
          {
            path: "assessments",
            element: <PatientInfo />, // Using PatientInfo as a placeholder until you create an Assessments component
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
