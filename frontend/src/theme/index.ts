import { createTheme, alpha } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }
  interface PaletteOptions {
    custom: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }
}

// Cores do sistema (não personalizáveis)
const systemColors = {
  error: "#d32f2f",
  warning: "#ed6c02",
  info: "#0288d1",
  success: "#2e7d32",
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
  white: "#ffffff",
  black: "#2a2a2a",
};

// Cores padrão personalizáveis
export const defaultCustomColors = {
  primary: "#2a8b8b", // Teal
  secondary: "#75c58e", // Light Green
  accent: "#ffd2bf", // Peach
};

// Função auxiliar para gerar variações de cor
const generateColorVariations = (color: string) => ({
  main: color,
  light: alpha(color, 0.8),
  dark: alpha(color, 0.4),
});

export const createCustomTheme = (customColors = defaultCustomColors) => {
  const primary = generateColorVariations(customColors.primary);
  const secondary = generateColorVariations(customColors.secondary);
  const accent = generateColorVariations(customColors.accent);

  return createTheme({
    palette: {
      mode: "light",
      primary: {
        ...primary,
        contrastText: systemColors.white,
      },
      secondary: {
        ...secondary,
        contrastText: systemColors.black,
      },
      custom: {
        primary: customColors.primary,
        secondary: customColors.secondary,
        accent: customColors.accent,
      },
      error: {
        main: systemColors.error,
      },
      warning: {
        main: systemColors.warning,
      },
      info: {
        main: systemColors.info,
      },
      success: {
        main: systemColors.success,
      },
      grey: systemColors.grey,
      background: {
        default: systemColors.grey[100],
        paper: systemColors.white,
      },
      text: {
        primary: systemColors.black,
        secondary: systemColors.grey[700],
      },
    },
    typography: {
      fontFamily: '"inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
        color: systemColors.black,
      },
      h2: {
        fontWeight: 600,
        color: systemColors.black,
      },
      h3: {
        fontWeight: 600,
        color: systemColors.black,
      },
      h4: {
        fontWeight: 600,
        color: systemColors.black,
      },
      h5: {
        fontWeight: 600,
        color: systemColors.black,
      },
      h6: {
        fontWeight: 600,
        color: systemColors.black,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 500,
            "&.Mui-disabled": {
              backgroundColor: "rgba(0, 0, 0, 0.12)",
            },
            "&:focus": {
              outline: "none",
            },
            "&:focus-visible": {
              outline: "none",
            },
          },
          contained: {
            "&.MuiButton-contained": {
              backgroundColor: primary.main,
              color: systemColors.white,
              "&:hover": {
                backgroundColor: primary.dark,
              },
            },
          },
          outlined: {
            "&.MuiButton-outlined": {
              borderColor: primary.main,
              color: primary.main,
              "&:hover": {
                borderColor: primary.dark,
                backgroundColor: "transparent",
              },
            },
          },
          text: {
            "&.MuiButton-text": {
              color: primary.main,
              "&:hover": {
                backgroundColor: "transparent",
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: primary.main,
              },
              "&:focus": {
                outline: "none",
              },
              "&:focus-visible": {
                outline: "none",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: primary.main,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            "&.Mui-checked": {
              color: primary.main,
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            "&.Mui-focused": {
              color: primary.main,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            "&:focus": {
              outline: "none !important",
            },
            "&:focus-visible": {
              outline: "none !important",
            },
          },
        },
      },
    },
  });
};

// Exporta o tema padrão
export const theme = createCustomTheme();
