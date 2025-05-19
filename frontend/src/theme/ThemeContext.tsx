import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { createCustomTheme, defaultCustomColors } from "./index";

interface ThemeContextType {
  customColors: typeof defaultCustomColors;
  updateColors: (colors: typeof defaultCustomColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Carrega as cores salvas ou usa as padrão
  const [customColors, setCustomColors] = useState(() => {
    const savedColors = localStorage.getItem("customColors");
    return savedColors ? JSON.parse(savedColors) : defaultCustomColors;
  });

  // Cria o tema com as cores atuais
  const theme = createCustomTheme(customColors);

  // Salva as cores no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem("customColors", JSON.stringify(customColors));
  }, [customColors]);

  const updateColors = (newColors: typeof defaultCustomColors) => {
    setCustomColors(newColors);
  };

  return (
    <ThemeContext.Provider value={{ customColors, updateColors }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
