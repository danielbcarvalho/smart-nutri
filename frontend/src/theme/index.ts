import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      main: string;
      light: string;
      lighter: string;
      lightest: string;
      accent: string;
    };
  }
  interface PaletteOptions {
    custom: {
      main: string;
      light: string;
      lighter: string;
      lightest: string;
      accent: string;
    };
  }
}

const baseColors = {
  teal: "#2a8b8b",
  lightGreen: "#75c58e",
  lime: "#bfff91",
  yellowGreen: "#dfe9a8",
  peach: "#ffd2bf",
  darkTeal: "#1e6161",
  white: "#ffffff",
  black: "#2a2a2a",
  grey: "#666666",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: baseColors.teal,
      light: baseColors.lightGreen,
      dark: baseColors.darkTeal,
      contrastText: baseColors.white,
    },
    secondary: {
      main: baseColors.lime,
      light: baseColors.yellowGreen,
      dark: baseColors.lightGreen,
      contrastText: baseColors.black,
    },
    custom: {
      main: baseColors.teal,
      light: baseColors.lightGreen,
      lighter: baseColors.lime,
      lightest: baseColors.yellowGreen,
      accent: baseColors.peach,
    },
    background: {
      default: "#f5f5f5",
      paper: baseColors.white,
    },
    text: {
      primary: baseColors.black,
      secondary: baseColors.grey,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: baseColors.black,
    },
    h2: {
      fontWeight: 600,
      color: baseColors.black,
    },
    h3: {
      fontWeight: 600,
      color: baseColors.black,
    },
    h4: {
      fontWeight: 600,
      color: baseColors.black,
    },
    h5: {
      fontWeight: 600,
      color: baseColors.black,
    },
    h6: {
      fontWeight: 600,
      color: baseColors.black,
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
            backgroundColor: baseColors.teal,
            color: baseColors.white,
            "&:hover": {
              backgroundColor: baseColors.darkTeal,
            },
          },
        },
        outlined: {
          "&.MuiButton-outlined": {
            borderColor: baseColors.teal,
            color: baseColors.teal,
            "&:hover": {
              borderColor: baseColors.darkTeal,
              backgroundColor: "transparent",
            },
          },
        },
        text: {
          "&.MuiButton-text": {
            color: baseColors.teal,
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
              borderColor: baseColors.teal,
            },
            "&:focus": {
              outline: "none",
            },
            "&:focus-visible": {
              outline: "none",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: baseColors.teal,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: baseColors.teal,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: baseColors.teal,
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
