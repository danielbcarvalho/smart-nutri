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

type BoneDiameters = {
  humerus: string;
  wrist: string;
  femur: string;
};

interface BoneDiameterSectionProps {
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  boneDiameters: BoneDiameters;
  onBoneDiameterChange: (
    field: keyof BoneDiameters
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BoneDiameterSection: React.FC<BoneDiameterSectionProps> = ({
  expanded,
  onAccordionChange,
  boneDiameters,
  onBoneDiameterChange,
}) => {
  // Mapeamento das etiquetas dos diâmetros ósseos
  const boneDiameterLabels: Record<keyof BoneDiameters, string> = {
    humerus: "Diâmetro do Úmero",
    wrist: "Diâmetro do Punho",
    femur: "Diâmetro do Fêmur",
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("boneDiameters")}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Diâmetros ósseos (cm)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {Object.entries(boneDiameters).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                fullWidth
                label={`${boneDiameterLabels[key as keyof BoneDiameters]} (cm)`}
                value={value}
                onChange={onBoneDiameterChange(key as keyof BoneDiameters)}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
