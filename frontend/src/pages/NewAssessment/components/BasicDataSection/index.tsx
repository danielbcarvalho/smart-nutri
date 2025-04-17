import React from "react";
import {
  TextField,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Accordion,
  Box,
  Paper,
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
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("basicData")}
      disableGutters
      sx={{
        borderRadius: 0,
        "&:before": {
          display: "none",
        },
        boxShadow: "none",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Dados antropométricos básicos</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}>
            <TextField
              fullWidth
              label="Peso (Kg)"
              value={basicData.weight}
              onChange={onBasicDataChange("weight")}
              required
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}>
            <TextField
              fullWidth
              label="Altura (cm)"
              value={
                basicData.height !== undefined &&
                basicData.height !== null &&
                basicData.height !== ""
                  ? Math.trunc(Number(basicData.height)).toString()
                  : ""
              }
              onChange={onBasicDataChange("height")}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}>
            <TextField
              fullWidth
              label="Altura sentado (cm)"
              value={basicData.sittingHeight}
              onChange={onBasicDataChange("sittingHeight")}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}>
            <TextField
              fullWidth
              label="Altura de joelho (cm)"
              value={basicData.kneeHeight}
              onChange={onBasicDataChange("kneeHeight")}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
