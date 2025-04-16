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

interface BasicDataSectionProps {
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  basicData: {
    weight: string;
    height: string;
    sittingHeight: string;
    kneeHeight: string;
  };
  onBasicDataChange: (
    field: string
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicDataSection: React.FC<BasicDataSectionProps> = ({
  expanded,
  onAccordionChange,
  basicData,
  onBasicDataChange,
}) => {
  return (
    <Accordion expanded={expanded} onChange={onAccordionChange("basicData")}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Dados antropométricos básicos</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Peso (Kg)"
              value={basicData.weight}
              onChange={onBasicDataChange("weight")}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Altura (cm)"
              value={basicData.height}
              onChange={onBasicDataChange("height")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Altura sentado (cm)"
              value={basicData.sittingHeight}
              onChange={onBasicDataChange("sittingHeight")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Altura do joelho (cm)"
              value={basicData.kneeHeight}
              onChange={onBasicDataChange("kneeHeight")}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
