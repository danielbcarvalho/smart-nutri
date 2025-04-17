import React from "react";
import {
  TextField,
  Grid,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Accordion,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ArrowDropDown";

type Circumferences = {
  neck: string;
  shoulder: string;
  chest: string;
  waist: string;
  abdomen: string;
  hip: string;
  relaxedArm: string;
  contractedArm: string;
  forearm: string;
  proximalThigh: string;
  medialThigh: string;
  distalThigh: string;
  calf: string;
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
    relaxedArm: "Braço Relaxado",
    contractedArm: "Braço Contraído",
    forearm: "Antebraço",
    proximalThigh: "Proximal da Coxa",
    medialThigh: "Medial da Coxa",
    distalThigh: "Distal da Coxa",
    calf: "Panturrilha",
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("circumferences")}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Circunferências (cm)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {Object.entries(circumferences).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                fullWidth
                label={`${
                  circumferenceLabels[key as keyof Circumferences]
                } (cm)`}
                value={value}
                onChange={onCircumferenceChange(key as keyof Circumferences)}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
