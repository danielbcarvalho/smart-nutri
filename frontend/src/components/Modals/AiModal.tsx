import {
  Modal,
  Paper,
  Box,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface AiModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AiModal({ open, onClose }: AiModalProps) {
  const theme = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "flex-start", // alinha no topo
        justifyContent: "center", // centraliza horizontalmente
        mt: "88px", // distância do topo
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: 24,
          overflow: "hidden",
          mt: 2, // pequeno afastamento interno extra se quiser
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Inteligência Artificial
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            color: "text.secondary",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <img
              src="/images/ai-animated.gif"
              alt="IA Smart Nutri"
              style={{ width: 64, height: 64, borderRadius: 8 }}
            />
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Em breve
              </Typography>
              <Typography variant="body2">
                IA Smart Nutri vai turbinar sua rotina.
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Nossa inteligência artificial está chegando para:
            <ul style={{ paddingLeft: 20, marginTop: 4 }}>
              <li>Gerar planos alimentares</li>
              <li>Dar insights sobre pacientes</li>
              <li>Montar relatórios</li>
              <li>Economizar seu tempo</li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </Modal>
  );
}
