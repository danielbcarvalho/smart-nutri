import React from "react";
import { Paper, Box, Typography, Tooltip, Button, Modal } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import { OssesousAndSkinfoldAnalysis } from "./OssesousAndSkinfoldAnalysis";
import { BioimpedanceAnalysis } from "./BioimpedanceAnalysis";

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
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h5">Resultados analíticos</Typography>
          <Tooltip title="Informações sobre os cálculos">
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>
          </Tooltip>
        </Box>
        <Button variant="text" onClick={() => setOpenGraphsModal(true)}>
          Ver gráficos
        </Button>
      </Box>

      {/* Análises de pesos e medidas */}
      <Typography variant="h6" gutterBottom>
        Análises de pesos e medidas
      </Typography>

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>Peso atual</Typography>
          <Typography color="text.secondary">
            {anthropometricResults.currentWeight}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>Altura atual</Typography>
          <Typography color="text.secondary">
            {anthropometricResults.currentHeight}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
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

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>
            Classificação do IMC
          </Typography>
          <Typography color="text.secondary">
            {anthropometricResults.bmiClassification}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>
            Faixa de peso ideal
          </Typography>
          <Typography color="text.secondary">
            {anthropometricResults.idealWeightRange}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              Relação da Cintura/Quadril (RCQ)
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

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>
            Risco Metabólico por RCQ
          </Typography>
          <Typography color="text.secondary">
            {anthropometricResults.waistHipRiskClassification}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: "bold" }}>CMB (cm)</Typography>
            <Tooltip title={getReferenceTooltip("cmb")}>
              <span>
                <HelpIcon color="action" fontSize="small" />
              </span>
            </Tooltip>
          </Box>
          <Typography color="text.secondary">
            {anthropometricResults.cmb}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>Classificação CMB</Typography>
          <Typography color="text.secondary">
            {anthropometricResults.cmbClassification}
          </Typography>
        </Box>
      </Box>

      {/* Análises por dobras e diâmetro ósseo */}
      <OssesousAndSkinfoldAnalysis
        anthropometricResults={anthropometricResults}
        getReferenceTooltip={getReferenceTooltip}
      />

      {/* Análises por bioimpedância */}
      <BioimpedanceAnalysis
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
            borderRadius: 1,
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
