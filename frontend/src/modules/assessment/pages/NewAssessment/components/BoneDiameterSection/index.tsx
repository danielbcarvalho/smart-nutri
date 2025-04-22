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
    humerus: "Úmero",
    wrist: "Punho",
    femur: "Fêmur",
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("boneDiameters")}
      sx={{
        "&:before": {
          display: "none",
        },
        boxShadow: "none",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Diâmetros ósseos (cm)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {Object.entries(boneDiameters).map(([key, value]) => (
            <Box
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}
              key={key}
            >
              {" "}
              <TextField
                fullWidth
                label={`${boneDiameterLabels[key as keyof BoneDiameters]} (cm)`}
                value={value}
                onChange={onBoneDiameterChange(key as keyof BoneDiameters)}
              />
            </Box>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
