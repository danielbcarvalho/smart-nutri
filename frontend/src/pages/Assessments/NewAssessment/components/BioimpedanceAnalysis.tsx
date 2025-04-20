import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";

interface Props {
  anthropometricResults: Record<string, any>;
  getReferenceTooltip: (calculation: string) => string;
}

export const BioimpedanceAnalysis: React.FC<Props> = ({
  anthropometricResults,
  getReferenceTooltip,
}) => (
  <>
    <Box
      sx={{ display: "flex", justifyContent: "space-between", mb: 2, mt: 3 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6">Análises por bioimpedância</Typography>
        <Tooltip title="Informações sobre os cálculos">
          <span>
            <HelpIcon color="action" fontSize="small" />
          </span>
        </Tooltip>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          Percentual de Gordura
        </Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceBodyFatPercentage}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Percentual Ideal</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceIdealFatPercentage}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>Classif. do % GC</Typography>
          <Tooltip title={getReferenceTooltip("bodyFatClassification")}>
            {" "}
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>{" "}
          </Tooltip>
        </Box>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceBodyFatClassification}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          Percentual de Massa Muscular
        </Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceMuscleMassPercentage}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>Massa Muscular</Typography>
          <Tooltip title={getReferenceTooltip("muscleMass")}>
            {" "}
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>{" "}
          </Tooltip>
        </Box>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceMuscleMass}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Água Corporal Total</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceBodyWater}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>Peso Ósseo</Typography>
          <Tooltip title={getReferenceTooltip("boneMass")}>
            {" "}
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>{" "}
          </Tooltip>
        </Box>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceBoneMass}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Massa de gordura</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceFatMass}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          Massa Livre de Gordura
        </Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceFatFreeMass}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          Índice de Gordura Visceral
        </Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceVisceralFat}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Idade Metabólica</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bioimpedanceMetabolicAge}
        </Typography>
      </Box>
    </Box>
  </>
);
