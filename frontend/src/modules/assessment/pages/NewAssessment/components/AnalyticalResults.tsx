import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Paper, Box, Typography, Tooltip, Button, Modal } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import BarChartIcon from "@mui/icons-material/BarChart";
import { OssesousAndSkinfoldAnalysis } from "./OssesousAndSkinfoldAnalysis";

interface AnalyticalResultsProps {
  anthropometricResults: Record<string, any>;
  openGraphsModal: boolean;
  setOpenGraphsModal: (open: boolean) => void;
  getReferenceTooltip: (calculation: string) => string;
}

export const AnalyticalResults: React.FC<AnalyticalResultsProps> = ({
  anthropometricResults,
  openGraphsModal,
  setOpenGraphsModal,
  getReferenceTooltip,
}) => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  return (
    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h5" color="primary">
            Resultados analíticos
          </Typography>
          <Tooltip title="Informações sobre os cálculos">
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>
          </Tooltip>
        </Box>
        <Button
          variant="outlined"
          startIcon={<BarChartIcon />}
          onClick={() =>
            navigate(`/patient/${patientId}/assessments/evolution/measurements`)
          }
          sx={{ borderRadius: 2 }}
        >
          Ver evolução
        </Button>
      </Box>

      {/* Análises de pesos e medidas */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          mb: 2,
          pb: 1,
          fontWeight: 600,
          borderBottom: "1px solid",
          borderColor: "grey.300",
        }}
      >
        Análises de pesos e medidas
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            bgcolor: "grey.100",
            borderRadius: 2,
            mb: 1,
            p: 0.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>Peso atual</Typography>
            <Typography color="text.secondary">
              {anthropometricResults.currentWeight}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "grey.100",
            borderRadius: 2,
            mb: 1,
            p: 0.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>Altura</Typography>
            <Typography color="text.secondary">
              {anthropometricResults.currentHeight}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "grey.100",
            borderRadius: 2,
            mb: 1,
            p: 0.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: "bold" }}>
                Índice de Massa Corporal
              </Typography>
              <Tooltip title={getReferenceTooltip("bmi")}>
                <span>
                  <HelpIcon color="action" fontSize="small" />
                </span>
              </Tooltip>
            </Box>
            <Typography color="text.secondary">
              {anthropometricResults.bmi}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "grey.100",
            borderRadius: 2,
            mb: 1,
            p: 0.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Classificação do IMC
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              {anthropometricResults.bmiClassification}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "grey.100",
            borderRadius: 2,
            mb: 1,
            p: 0.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Faixa de peso ideal
            </Typography>
            <Typography color="text.secondary">
              {anthropometricResults.idealWeightRange}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Typography
        variant="h6"
        gutterBottom
        sx={{
          mb: 2,
          pb: 1,
          fontWeight: 600,
          borderBottom: "1px solid",
          borderColor: "grey.300",
        }}
      >
        Relações corporais
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            bgcolor: "grey.100",
            borderRadius: 2,
            mb: 1,
            p: 0.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: "bold" }}>
                Razão de Cintura/Quadril (RCQ)
              </Typography>
              <Tooltip title={getReferenceTooltip("waistHipRatio")}>
                <span>
                  <HelpIcon color="action" fontSize="small" />
                </span>
              </Tooltip>
            </Box>
            <Typography color="text.secondary">
              {anthropometricResults.waistHipRatio}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "grey.100",
            borderRadius: 2,
            mb: 1,
            p: 0.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: "grey.200",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Risco Metabólico por RCQ
            </Typography>
            <Typography>
              {anthropometricResults.waistHipRiskClassification}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Análises por dobras e diâmetro ósseo */}
      <OssesousAndSkinfoldAnalysis
        anthropometricResults={anthropometricResults}
        getReferenceTooltip={getReferenceTooltip}
      />

      {/* Modal de Gráficos */}
      <Modal
        open={openGraphsModal}
        onClose={() => setOpenGraphsModal(false)}
        aria-labelledby="modal-graphs"
        aria-describedby="modal-graphs-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Gráficos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Em breve você poderá visualizar os gráficos aqui.
          </Typography>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setOpenGraphsModal(false)}>Fechar</Button>
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};
