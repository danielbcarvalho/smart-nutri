import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#00875F",
      light: "#00B37E",
      dark: "#015F43",
    },
    secondary: {
      main: "#7C7C8A",
      light: "#C4C4CC",
      dark: "#323238",
    },
    background: {
      default: "#F8F9FC",
      paper: "#ffffff",
    },
    text: {
      primary: "#323238",
      secondary: "#7C7C8A",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)",
        },
      },
    },
  },
});
