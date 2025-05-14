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
import { SkinfoldType } from "../../../../calcs/formulas/types";
import { bodyDensityFormulas } from "../../../../calcs/formulas";

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
  patient?: { birthDate?: string };
}

export const SkinfoldSection: React.FC<SkinfoldSectionProps> = ({
  expanded,
  onAccordionChange,
  skinfolds,
  skinfoldFormula,
  onSkinfoldFormulaChange,
  onSkinfoldChange,
  patientGender,
  patient,
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

  const handleSkinfoldValueChange =
    (field: keyof Skinfolds) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      console.log("Skinfold change:", {
        field,
        value,
        type: typeof value,
        parsedValue: parseFloat(value),
      });

      onSkinfoldChange(field)(event);
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
            <ToggleButton value="petroski">Petroski</ToggleButton>
            <ToggleButton value="guedes">Guedes</ToggleButton>
            <ToggleButton value="durnin" disabled>
              Durnin (Em breve)
            </ToggleButton>
            <ToggleButton value="faulkner" disabled>
              Faulkner (Em breve)
            </ToggleButton>
            <ToggleButton value="none">Nenhuma</ToggleButton>
          </ToggleButtonGroup>

          {(skinfoldFormula === "guedes" || skinfoldFormula === "petroski") &&
            patient?.birthDate &&
            (() => {
              const patientAge = Math.floor(
                (new Date().getTime() - new Date(patient.birthDate).getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25)
              );

              if (skinfoldFormula === "guedes") {
                const isOutsideRange = patientAge < 17 || patientAge > 30;
                return isOutsideRange ? (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    ⚠️ A fórmula de Guedes foi desenvolvida e validada para
                    adultos jovens (17-30 anos). Para outras faixas etárias,
                    considere utilizar outras fórmulas mais específicas.
                    (Paciente com {patientAge} anos)
                  </Typography>
                ) : null;
              }

              if (skinfoldFormula === "petroski") {
                const isOutsideRange = (() => {
                  if (
                    patientGender === "M" ||
                    String(patientGender) === "MALE"
                  ) {
                    return patientAge < 20 || patientAge >= 40;
                  } else {
                    return patientAge < 18 || patientAge > 51;
                  }
                })();

                return isOutsideRange ? (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    ⚠️ A fórmula de Petroski tem variações específicas por
                    gênero e idade:
                    {patientGender === "M" || String(patientGender) === "MALE"
                      ? " para homens é válida entre 20 e 39,9 anos"
                      : " para mulheres é válida entre 18 e 51 anos"}
                    . Para outras faixas etárias, considere utilizar outras
                    fórmulas mais específicas. (Paciente com {patientAge} anos)
                  </Typography>
                ) : null;
              }

              return null;
            })()}
        </Box>

        <Grid container spacing={2}>
          {Object.entries(skinfolds).map(([key, value]) => {
            const formula = bodyDensityFormulas.find(
              (f) => f.id === skinfoldFormula
            );

            const isRequired =
              formula &&
              (skinfoldFormula === "guedes"
                ? patientGender === "M" || String(patientGender) === "MALE"
                  ? ["thoracic", "abdominal", "thigh"].includes(key)
                  : ["thigh", "suprailiac", "subscapular"].includes(key)
                : skinfoldFormula === "petroski"
                ? (() => {
                    const patientAge = patient?.birthDate
                      ? Math.floor(
                          (new Date().getTime() -
                            new Date(patient.birthDate).getTime()) /
                            (1000 * 60 * 60 * 24 * 365.25)
                        )
                      : 0;

                    if (
                      patientGender === "M" ||
                      String(patientGender) === "MALE"
                    ) {
                      // Homens (20-39,9 anos)
                      return patientAge >= 20 && patientAge < 40
                        ? [
                            "subscapular",
                            "tricipital",
                            "suprailiac",
                            "calf",
                          ].includes(key as keyof Skinfolds)
                        : false;
                    } else {
                      // Mulheres
                      if (patientAge >= 20 && patientAge < 40) {
                        // Mulheres (20-39,9 anos)
                        return [
                          "subscapular",
                          "tricipital",
                          "suprailiac",
                          "calf",
                        ].includes(key as keyof Skinfolds);
                      } else if (patientAge >= 18 && patientAge <= 51) {
                        // Mulheres (18-51 anos)
                        return [
                          "axillaryMedian",
                          "suprailiac",
                          "thigh",
                          "calf",
                        ].includes(key as keyof Skinfolds);
                      }
                      return false;
                    }
                  })()
                : formula.requiredSkinfolds.includes(key as keyof Skinfolds));

            return (
              <Box
                sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}
                key={key}
              >
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
                  onChange={handleSkinfoldValueChange(key as keyof Skinfolds)}
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
              </Box>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
