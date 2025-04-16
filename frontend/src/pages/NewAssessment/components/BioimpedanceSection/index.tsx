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

type Bioimpedance = {
  fatPercentage: string;
  fatMass: string;
  muscleMassPercentage: string;
  muscleMass: string;
  fatFreeMass: string;
  boneMass: string;
  visceralFat: string;
  bodyWater: string;
  metabolicAge: string;
};

interface BioimpedanceSectionProps {
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  bioimpedance: Bioimpedance;
  onBioimpedanceChange: (
    field: keyof Bioimpedance
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BioimpedanceSection: React.FC<BioimpedanceSectionProps> = ({
  expanded,
  onAccordionChange,
  bioimpedance,
  onBioimpedanceChange,
}) => {
  // Mapeamento das etiquetas dos dados de bioimpedância
  const bioimpedanceLabels: Record<keyof Bioimpedance, string> = {
    fatPercentage: "Percentual de Gordura (%)",
    fatMass: "Massa Gorda (kg)",
    muscleMassPercentage: "Percentual de Massa Muscular (%)",
    muscleMass: "Massa Muscular (kg)",
    fatFreeMass: "Massa Livre de Gordura (kg)",
    boneMass: "Massa Óssea (kg)",
    visceralFat: "Gordura Visceral",
    bodyWater: "Água Corporal (%)",
    metabolicAge: "Idade Metabólica (anos)",
  };

  return (
    <Accordion expanded={expanded} onChange={onAccordionChange("bioimpedance")}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Dados de Bioimpedância</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {Object.entries(bioimpedance).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                fullWidth
                label={bioimpedanceLabels[key as keyof Bioimpedance]}
                value={value}
                onChange={onBioimpedanceChange(key as keyof Bioimpedance)}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
