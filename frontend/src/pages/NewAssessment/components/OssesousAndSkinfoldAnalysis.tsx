import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";

interface Props {
  anthropometricResults: Record<string, any>;
  getReferenceTooltip: (calculation: string) => string;
}

export const OssesousAndSkinfoldAnalysis: React.FC<Props> = ({
  anthropometricResults,
  getReferenceTooltip,
}) => (
  <>
    <Box
      sx={{ display: "flex", justifyContent: "space-between", mb: 2, mt: 3 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6">
          Análises por dobras e diâmetro ósseo
        </Typography>
        <Tooltip title="Informações sobre os cálculos">
          <span>
            <HelpIcon color="action" fontSize="small" />
          </span>
        </Tooltip>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>
            Percentual de Gordura
          </Typography>
          <Tooltip title={getReferenceTooltip("bodyFatPercentage")}>
            {" "}
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>{" "}
          </Tooltip>
        </Box>
        <Typography color="text.secondary">
          {anthropometricResults.bodyFatPercentage}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Percentual Ideal</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.idealFatPercentage}
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
          {anthropometricResults.bodyFatClassification}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Peso de gordura</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.fatMass}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>Peso ósseo</Typography>
          <Tooltip title={getReferenceTooltip("boneMass")}>
            {" "}
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>{" "}
          </Tooltip>
        </Box>
        <Typography color="text.secondary">
          {anthropometricResults.boneMass}
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
          {anthropometricResults.muscleMass}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: "bold" }}>Peso residual</Typography>
          <Tooltip title={getReferenceTooltip("residualWeight")}>
            {" "}
            <span>
              <HelpIcon color="action" fontSize="small" />
            </span>{" "}
          </Tooltip>
        </Box>
        <Typography color="text.secondary">
          {anthropometricResults.residualWeight}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>
          Massa Livre de Gordura
        </Typography>
        <Typography color="text.secondary">
          {anthropometricResults.fatFreeMass}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Somatório de Dobras</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.skinfoldsSum}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Densidade Corporal</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.bodyDensity}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Referência usada</Typography>
        <Typography color="text.secondary">
          {anthropometricResults.referenceUsed}
        </Typography>
      </Box>
    </Box>
  </>
);
