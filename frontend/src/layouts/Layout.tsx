import { Box } from "@mui/material";
import { Header } from "../components/Layout/Header";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px", // altura do header
          width: "100%",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
