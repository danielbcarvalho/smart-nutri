import React, { useState } from "react";
import { Box, Fab, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/LiveHelpOutlined";
import HelpModal from "./Modals/HelpModal";
import { useNavigate } from "react-router-dom";

const FloatingHelpButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1300,
        }}
      >
        <Tooltip title="Dúvidas?">
          <Fab
            color="primary"
            aria-label="ajuda"
            onClick={() => setOpen(true)}
            size="small"
            variant="circular"
          >
            <HelpOutlineIcon fontSize="medium" />
          </Fab>
        </Tooltip>
      </Box>
      <HelpModal
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={navigate}
      />
    </>
  );
};

export default FloatingHelpButton;
