import React from "react";
import {
  TextField,
  Grid,
  Box,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Accordion,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ArrowDropDown";
import { SkinfoldType } from "../../utils/formulas/types";
import { bodyDensityFormulas } from "../../utils/formulas";

type Skinfolds = {
  tricipital: string;
  bicipital: string;
  abdominal: string;
  subscapular: string;
  axillaryMedian: string;
  thigh: string;
  thoracic: string;
  suprailiac: string;
  calf: string;
  supraspinal: string;
};

interface SkinfoldSectionProps {
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  skinfolds: Skinfolds;
  skinfoldFormula: string;
  onSkinfoldFormulaChange: (value: string) => void;
  onSkinfoldChange: (
    field: keyof Skinfolds
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  patientGender?: string;
}

export const SkinfoldSection: React.FC<SkinfoldSectionProps> = ({
  expanded,
  onAccordionChange,
  skinfolds,
  skinfoldFormula,
  onSkinfoldFormulaChange,
  onSkinfoldChange,
  patientGender,
}) => {
  // Mapeamento das etiquetas das dobras
  const skinfoldLabels: Record<string, string> = {
    tricipital: "Tricipital",
    bicipital: "Bicipital",
    abdominal: "Abdominal",
    subscapular: "Subescapular",
    axillaryMedian: "Axilar Média",
    thigh: "Coxa",
    thoracic: "Torácica",
    suprailiac: "Suprailíaca",
    calf: "Panturrilha",
    supraspinal: "Supraespinhal",
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("skinfolds")}
      sx={{
        "&:before": {
          display: "none",
        },
        boxShadow: "none",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Dobras cutâneas (mm)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ p: 1, mb: 3, borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            Escolha a fórmula para cálculo:
          </Typography>
          <ToggleButtonGroup
            value={skinfoldFormula}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                onSkinfoldFormulaChange(newValue);
              }
            }}
            size="small"
            sx={{
              flexWrap: "wrap",
              gap: 1,
              "& .MuiToggleButton-root": {
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: "8px !important",
                color: "text.secondary",
                textTransform: "none",
                px: 2,
                py: 1,
                "&:hover": {
                  borderColor: "primary.main",
                },
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
                "&.Mui-disabled": {
                  opacity: 0.6,
                  color: "grey.500",
                  borderColor: "grey.300",
                  backgroundColor: "transparent",
                },
              },
            }}
          >
            <ToggleButton value="pollock3">Pollock 3</ToggleButton>
            <ToggleButton value="pollock7">Pollock 7</ToggleButton>
            <ToggleButton value="petroski" disabled>
              Petroski (Em breve)
            </ToggleButton>
            <ToggleButton value="guedes" disabled>
              Guedes (Em breve)
            </ToggleButton>
            <ToggleButton value="durnin" disabled>
              Durnin (Em breve)
            </ToggleButton>
            <ToggleButton value="faulkner" disabled>
              Faulkner (Em breve)
            </ToggleButton>
            <ToggleButton value="none">Nenhuma</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={2}>
          {Object.entries(skinfolds).map(([key, value]) => {
            const formula = bodyDensityFormulas.find(
              (f) => f.id === skinfoldFormula
            );

            const isRequired =
              formula &&
              formula.requiredSkinfolds.includes(key as SkinfoldType) &&
              (skinfoldFormula === "pollock3"
                ? patientGender === "M" || String(patientGender) === "MALE"
                  ? ["thoracic", "abdominal", "thigh"].includes(key)
                  : ["tricipital", "suprailiac", "thigh"].includes(key)
                : skinfoldFormula === "pollock7"
                ? [
                    "thoracic",
                    "axillaryMedian",
                    "tricipital",
                    "subscapular",
                    "abdominal",
                    "suprailiac",
                    "thigh",
                  ].includes(key)
                : false);

            return (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: isRequired ? 700 : 400,
                        color: isRequired ? "primary.main" : "inherit",
                      }}
                    >
                      {`${skinfoldLabels[key]} (mm)`}
                    </Typography>
                  }
                  value={value}
                  onChange={onSkinfoldChange(key as keyof Skinfolds)}
                  InputProps={{
                    sx: {
                      bgcolor: "background.paper",
                      ...(skinfoldFormula !== "none" && {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: isRequired ? "primary.main" : "grey.300",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: isRequired ? "primary.main" : "grey.300",
                        },
                      }),
                    },
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
