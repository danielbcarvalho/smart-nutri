import React from "react";
import {
  Modal,
  Fade,
  Paper,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseIcon from "@mui/icons-material/Close";

export interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsModal({
  open,
  onClose,
}: NotificationsModalProps) {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: "flex",
        alignItems: "flex-start", // fixa logo abaixo do topo
        justifyContent: "center", // centraliza no eixo X
        mt: "88px", // mesma distância do perfil
        px: 2,
        zIndex: theme.zIndex.tooltip + 1,
      }}
    >
      <Fade in={open}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: 24,
            overflow: "hidden",
          }}
        >
          {/* Cabeçalho */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Notificações
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conteúdo */}
          <Box sx={{ p: 2 }}>
            {/* Se futuramente você tiver uma lista de notificações, basta mapear aqui */}
            <List
              sx={{
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
              }}
            >
              {/* Empty State */}
              <Box
                sx={{
                  py: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "text.secondary",
                }}
              >
                <NotificationsNoneIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body1">
                  Nenhuma notificação no momento
                </Typography>
              </Box>
            </List>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
}
