import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import {
  createCustomTheme,
  defaultCustomColors,
  defaultCustomFonts,
} from "./index";
import { useNutritionistSettings } from "../contexts/NutritionistSettingsContext";

interface ThemeContextType {
  customColors: typeof defaultCustomColors;
  customFonts: typeof defaultCustomFonts;
  updateColors: (colors: typeof defaultCustomColors) => void;
  updateFonts: (fonts: typeof defaultCustomFonts) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Função para carregar uma fonte do Google Fonts
const loadGoogleFont = (fontName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
      /\s+/g,
      "+"
    )}:wght@400;500;600;700&display=swap`;

    fontLink.onload = () => resolve();
    fontLink.onerror = () => reject(new Error("Fonte não encontrada"));

    document.head.appendChild(fontLink);
  });
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useNutritionistSettings();
  const [customColors, setCustomColors] = useState(() => {
    // Prioriza as configurações do nutricionista, depois o localStorage, por fim o padrão
    if (settings?.customColors) {
      return settings.customColors;
    }
    const savedColors = localStorage.getItem("customColors");
    return savedColors ? JSON.parse(savedColors) : defaultCustomColors;
  });

  const [customFonts, setCustomFonts] = useState(() => {
    // Prioriza as configurações do nutricionista, depois o localStorage, por fim o padrão
    if (settings?.customFonts) {
      return settings.customFonts;
    }
    const savedFonts = localStorage.getItem("customFonts");
    return savedFonts ? JSON.parse(savedFonts) : defaultCustomFonts;
  });

  const theme = useMemo(
    () => createCustomTheme(customColors, customFonts),
    [customColors, customFonts]
  );

  const updateColors = React.useCallback(
    (colors: typeof defaultCustomColors) => {
      setCustomColors(colors);
      localStorage.setItem("customColors", JSON.stringify(colors));
    },
    []
  );

  const updateFonts = React.useCallback((fonts: typeof defaultCustomFonts) => {
    setCustomFonts(fonts);
    localStorage.setItem("customFonts", JSON.stringify(fonts));
  }, []);

  // Carregar configurações do nutricionista
  useEffect(() => {
    const loadSettings = async () => {
      if (settings?.customColors) {
        setCustomColors(settings.customColors);
        localStorage.setItem(
          "customColors",
          JSON.stringify(settings.customColors)
        );
      }

      if (settings?.customFonts?.primary && settings?.customFonts?.secondary) {
        setCustomFonts(settings.customFonts);
        localStorage.setItem(
          "customFonts",
          JSON.stringify(settings.customFonts)
        );
        try {
          await loadGoogleFont(settings.customFonts.primary);
          await loadGoogleFont(settings.customFonts.secondary);
        } catch (error) {
          console.error("Erro ao carregar fontes personalizadas:", error);
        }
      }
    };

    loadSettings();
  }, [settings?.customColors, settings?.customFonts]);

  // Atualizar tema quando o usuário fizer login
  useEffect(() => {
    const handleUserLogin = async () => {
      const user = JSON.parse(localStorage.getItem("@smartnutri:user") || "{}");

      if (user.customColors) {
        setCustomColors(user.customColors);
        localStorage.setItem("customColors", JSON.stringify(user.customColors));
      }

      if (user.customFonts?.primary && user.customFonts?.secondary) {
        setCustomFonts(user.customFonts);
        localStorage.setItem("customFonts", JSON.stringify(user.customFonts));
        try {
          await loadGoogleFont(user.customFonts.primary);
          await loadGoogleFont(user.customFonts.secondary);
        } catch (error) {
          console.error("Erro ao carregar fontes personalizadas:", error);
        }
      }
    };

    window.addEventListener("userLogin", handleUserLogin);
    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      customColors,
      customFonts,
      updateColors,
      updateFonts,
    }),
    [customColors, customFonts, updateColors, updateFonts]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
