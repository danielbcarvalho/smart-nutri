import React, { useState } from "react";
import {
  Modal,
  Fade,
  Paper,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PatientFormModal } from "../PatientForm/PatientFormModal";

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (to: string) => void;
}

export default function HelpModal({
  open,
  onClose,
  onNavigate,
}: HelpModalProps) {
  const theme = useTheme();
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const [showPlanInfo, setShowPlanInfo] = useState(false);
  const [showAssessmentInfo, setShowAssessmentInfo] = useState(false);

  const handleOpenPatientModal = () => {
    onClose();
    setTimeout(() => setOpenPatientModal(true), 200); // delay para evitar sobreposição de modais
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          mt: "88px",
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
                Dúvidas Frequentes
              </Typography>
              <IconButton size="small" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Conteúdo */}
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleOpenPatientModal}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                >
                  Cadastrar novo paciente
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    onClose();
                    onNavigate("/patients");
                  }}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                >
                  Ver todos os pacientes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowPlanInfo((v) => !v)}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                >
                  Como criar plano alimentar?
                </Button>
                {showPlanInfo && (
                  <Box
                    sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, mt: 1 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      "Estamos trabalhando na funcionalidade de plano alimentar.
                      Em breve, você poderá criar planos personalizados, buscar
                      alimentos, acessar tabelas nutricionais, visualizar macros
                      e micronutrientes, receber sugestões inteligentes e muito
                      mais!
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  onClick={() => setShowAssessmentInfo((v) => !v)}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                >
                  Como criar uma avaliação antropométrica?
                </Button>
                {showAssessmentInfo && (
                  <Box
                    sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, mt: 1 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Para cadastrar uma avaliação antropométrica, primeiro
                      busque ou cadastre o paciente. A opção aparecerá na página
                      de detalhes do paciente.
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open("https://wa.me/5535991640981", "_blank")
                  }
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                >
                  Reportar erro / Sugerir melhoria
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Fade>
      </Modal>
      <PatientFormModal
        open={openPatientModal}
        onClose={() => setOpenPatientModal(false)}
        onSuccess={() => setOpenPatientModal(false)}
      />
    </>
  );
}
