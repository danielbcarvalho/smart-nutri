import React from "react";
import {
  TextField,
  Grid,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Accordion,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ArrowDropDown";

type Circumferences = {
  neck: string;
  shoulder: string;
  chest: string;
  waist: string;
  abdomen: string;
  hip: string;
  relaxedArmLeft: string;
  relaxedArmRight: string;
  contractedArmLeft: string;
  contractedArmRight: string;
  forearmLeft: string;
  forearmRight: string;
  proximalThighLeft: string;
  proximalThighRight: string;
  medialThighLeft: string;
  medialThighRight: string;
  distalThighLeft: string;
  distalThighRight: string;
  calfLeft: string;
  calfRight: string;
};

interface CircumferenceSectionProps {
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  circumferences: Circumferences;
  onCircumferenceChange: (
    field: keyof Circumferences
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CircumferenceSection: React.FC<CircumferenceSectionProps> = ({
  expanded,
  onAccordionChange,
  circumferences,
  onCircumferenceChange,
}) => {
  // Mapeamento das etiquetas das circunferências
  const circumferenceLabels: Record<keyof Circumferences, string> = {
    neck: "Pescoço",
    shoulder: "Ombros",
    chest: "Tórax",
    waist: "Cintura",
    abdomen: "Abdominal",
    hip: "Quadril",
    relaxedArmLeft: "Braço Relaxado Esquerdo",
    relaxedArmRight: "Braço Relaxado Direito",
    contractedArmLeft: "Braço Contraído Esquerdo",
    contractedArmRight: "Braço Contraído Direito",
    forearmLeft: "Antebraço Esquerdo",
    forearmRight: "Antebraço Direito",
    proximalThighLeft: "Coxa Proximal Esquerda",
    proximalThighRight: "Coxa Proximal Direita",
    medialThighLeft: "Coxa Medial Esquerda",
    medialThighRight: "Coxa Medial Direita",
    distalThighLeft: "Coxa Distal Esquerda",
    distalThighRight: "Coxa Distal Direita",
    calfLeft: "Panturrilha Esquerda",
    calfRight: "Panturrilha Direita",
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("circumferences")}
      sx={{
        "&:before": {
          display: "none",
        },
        boxShadow: "none",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Circunferências (cm)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {Object.entries(circumferences).map(([key, value]) => (
            <Box
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}
              key={key}
            >
              <TextField
                fullWidth
                label={`${
                  circumferenceLabels[key as keyof Circumferences]
                } (cm)`}
                value={value}
                onChange={onCircumferenceChange(key as keyof Circumferences)}
                InputLabelProps={{ sx: { fontSize: 13 } }}
              />
            </Box>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
