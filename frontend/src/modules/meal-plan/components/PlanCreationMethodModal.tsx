import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Close,
  CreateOutlined,
  BookmarkBorderOutlined,
  ArrowForward,
  EditNote,
  ContentCopy,
} from "@mui/icons-material";

interface PlanCreationMethodModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFromScratch: () => void;
  onCreateFromTemplate: () => void;
  patientName?: string;
}

export const PlanCreationMethodModal: React.FC<PlanCreationMethodModalProps> = ({
  open,
  onClose,
  onCreateFromScratch,
  onCreateFromTemplate,
  patientName,
}) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "visible",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
              Como você gostaria de criar o plano?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {patientName ? `Novo plano alimentar para ${patientName.split(" ")[0]}` : "Escolha o método de criação"}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: "text.secondary",
              "&:hover": { 
                backgroundColor: alpha(theme.palette.text.secondary, 0.08) 
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Create from Scratch Option */}
          <Card 
            elevation={0}
            sx={{
              border: 2,
              borderColor: "divider",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "primary.main",
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
                "& .action-arrow": {
                  transform: "translateX(4px)",
                  color: "primary.main",
                },
              },
            }}
            onClick={onCreateFromScratch}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    mt: 0.5,
                  }}
                >
                  <CreateOutlined sx={{ fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Criar do Zero
                    </Typography>
                    <ArrowForward 
                      className="action-arrow"
                      sx={{ 
                        fontSize: 20, 
                        color: "text.secondary",
                        transition: "all 0.2s ease-in-out",
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                    Comece com um plano em branco e adicione refeições e alimentos conforme sua prescrição personalizada.
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EditNote sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Máxima personalização e controle total
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Create from Template Option */}
          <Card 
            elevation={0}
            sx={{
              border: 2,
              borderColor: "divider",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "secondary.main",
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
                "& .action-arrow": {
                  transform: "translateX(4px)",
                  color: "secondary.main",
                },
              },
            }}
            onClick={onCreateFromTemplate}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    color: "secondary.main",
                    mt: 0.5,
                  }}
                >
                  <BookmarkBorderOutlined sx={{ fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      Usar Template
                    </Typography>
                    <ArrowForward 
                      className="action-arrow"
                      sx={{ 
                        fontSize: 20, 
                        color: "text.secondary",
                        transition: "all 0.2s ease-in-out",
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                    Acelere o processo usando um dos seus templates salvos como base e adapte conforme necessário.
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ContentCopy sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Economia de tempo com base comprovada
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Bottom tip */}
        <Box 
          sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="caption" color="info.main" fontWeight={500}>
            💡 Dica: Você pode sempre salvar qualquer plano como template para reutilizar no futuro
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};