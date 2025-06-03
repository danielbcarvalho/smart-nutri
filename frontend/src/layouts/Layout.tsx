import { Box, useTheme, alpha } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Container } from "../components/Layout/Container";
import { HeaderGlobal } from "../components/Layout/HeaderGlobal";
import { Footer } from "../components/Layout/Footer";
import FloatingHelpButton from "../components/FloatingHelpButton";
import { useState } from "react";
import { GlobalSnackbar } from "../components/GlobalSnackbar";

export const Layout = () => {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Função para mostrar notificação
  const showNotification = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  // Função para fechar notificação
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F6FA",
        p: {
          xs: 1.5,
          sm: 2.5,
          md: 4,
        },
        typography: {
          fontSize: {
            xs: "0.875rem",
            sm: "0.9375rem",
            md: "1rem",
          },
          lineHeight: {
            xs: 1.4,
            sm: 1.5,
            md: 1.6,
          },
        },
        WebkitOverflowScrolling: "touch",
        touchAction: "manipulation",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container
        sx={{
          backgroundColor: "white",
          borderRadius: {
            xs: "12px",
            sm: "20px",
            md: "32px",
          },
          boxShadow: (theme) =>
            `0 2px 16px 0 ${alpha(theme.palette.common.black, 0.04)}`,
          display: "flex",
          flexDirection: "column",
          minHeight: {
            xs: "100vh",
            sm: "95vh",
            md: "90vh",
          },
          overflow: "hidden",
          maxWidth: {
            xs: "100%",
            sm: "100%",
            md: "1200px",
          },
          margin: {
            xs: 0,
            sm: "auto",
          },
          transition: theme.transitions.create(["padding", "border-radius"], {
            duration: theme.transitions.duration.shorter,
          }),
          willChange: "transform",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <HeaderGlobal />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            py: {
              xs: 1.5,
              sm: 2.5,
              md: 4,
            },
            px: {
              xs: 1,
              sm: 2,
              md: 3,
            },
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Outlet context={{ showNotification }} />
        </Box>
        <Footer />
        <FloatingHelpButton />
      </Container>

      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};
