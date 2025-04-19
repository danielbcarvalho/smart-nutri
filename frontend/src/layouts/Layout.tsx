import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Container } from "../components/Layout/Container";

import { HeaderGlobal } from "../components/Layout/HeaderGlobal";

export const Layout = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F6FA", p: 4 }}>
      <Container
        sx={{
          backgroundColor: "white",
          borderRadius: "32px",

          boxShadow: "0 2px 16px 0 rgba(0,0,0,0.04)",
          px: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: "auto", md: "90vh" },
          overflow: "hidden",
        }}
      >
        <HeaderGlobal />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
          }}
        >
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};
