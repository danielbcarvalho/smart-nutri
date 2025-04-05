import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { theme } from "./theme";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { MealPlan } from "./pages/MealPlan";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/meal-plan" element={<MealPlan />} />
              {/* Adicione mais rotas aqui conforme necessário */}
            </Routes>
          </DashboardLayout>
        </Router>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
