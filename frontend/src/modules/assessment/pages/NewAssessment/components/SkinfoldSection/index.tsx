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
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { bodyDensityFormulas } from "../../../../calcs/formulas";

type SkinfoldsState = {
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
  skinfolds: SkinfoldsState;
  skinfoldFormula: string;
  onSkinfoldFormulaChange: (value: string) => void;
  onSkinfoldChange: (
    field: keyof SkinfoldsState
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
  const skinfoldLabels: Record<string, string> = {
    tricipital: "Tricipital",
    bicipital: "Bicipital",
    abdominal: "Abdominal (Paraumbilical)",
    subscapular: "Subescapular",
    axillaryMedian: "Axilar Média",
    thigh: "Coxa (Anterior)",
    thoracic: "Torácica (Peitoral)",
    suprailiac: "Suprailíaca",
    calf: "Panturrilha",
    supraspinal: "Supraespinhal",
  };

  const currentPatientGender = patientGender?.toUpperCase();
  const isMale =
    currentPatientGender === "M" || currentPatientGender === "MALE";
  const isFemale =
    currentPatientGender === "F" || currentPatientGender === "FEMALE";

  const guedesFormulaDef = bodyDensityFormulas.find((f) => f.id === "guedes");
  const guedesAgeRange = guedesFormulaDef?.ageRange;

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("skinfolds")}
      sx={{ "&:before": { display: "none" }, boxShadow: "none" }}
    >
      <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
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
                "&:hover": { borderColor: "primary.main" },
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                  "&:hover": { backgroundColor: "primary.dark" },
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

          {skinfoldFormula === "guedes" &&
            patient?.birthDate &&
            guedesAgeRange &&
            (() => {
              const patientAge = Math.floor(
                (new Date().getTime() -
                  new Date(patient.birthDate!).getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25)
              );
              const isOutsideGuedesRange =
                patientAge < guedesAgeRange.min ||
                patientAge > guedesAgeRange.max;

              return isOutsideGuedesRange ? (
                <Typography
                  variant="body2"
                  color="warning.main"
                  sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  ⚠️ A fórmula de Guedes selecionada é indicada para a faixa
                  etária de {guedesAgeRange.min} a {guedesAgeRange.max} anos.
                  Considere a aplicabilidade para este paciente com {patientAge}{" "}
                  anos.
                </Typography>
              ) : null;
            })()}

          {skinfoldFormula === "petroski" &&
            patient?.birthDate &&
            (() => {
              const patientAge = Math.floor(
                (new Date().getTime() -
                  new Date(patient.birthDate!).getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25)
              );
              const petroskiFormulaDef = bodyDensityFormulas.find(
                (f) => f.id === "petroski"
              );
              let isOutsidePetroskiRange = true;
              let petroskiMessage =
                "A fórmula de Petroski tem faixas etárias específicas.";

              if (
                petroskiFormulaDef?.ageRange &&
                typeof petroskiFormulaDef.ageRange !== "string"
              ) {
                if (isMale) {
                  const maleMin =
                    (
                      petroskiFormulaDef.ageRange as {
                        min: number;
                        max: number;
                        male?: { min: number; max: number };
                      }
                    ).male?.min ?? 20;
                  const maleMax =
                    (
                      petroskiFormulaDef.ageRange as {
                        min: number;
                        max: number;
                        male?: { min: number; max: number };
                      }
                    ).male?.max ?? 39.9;
                  isOutsidePetroskiRange =
                    patientAge < maleMin || patientAge >= maleMax + 0.1;
                  petroskiMessage = `Para homens, Petroski é validada entre ${maleMin} e ${maleMax.toFixed(
                    1
                  )} anos.`;
                } else if (isFemale) {
                  const femaleMin =
                    (
                      petroskiFormulaDef.ageRange as {
                        min: number;
                        max: number;
                        female?: { min: number; max: number };
                      }
                    ).female?.min ?? 18;
                  const femaleMax =
                    (
                      petroskiFormulaDef.ageRange as {
                        min: number;
                        max: number;
                        female?: { min: number; max: number };
                      }
                    ).female?.max ?? 51;
                  isOutsidePetroskiRange =
                    patientAge < femaleMin || patientAge > femaleMax;
                  petroskiMessage = `Para mulheres, Petroski é validada entre ${femaleMin} e ${femaleMax} anos.`;
                }
              }

              return isOutsidePetroskiRange ? (
                <Typography
                  variant="body2"
                  color="warning.main"
                  sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  ⚠️ {petroskiMessage} Para outras faixas etárias, considere
                  outras fórmulas. (Paciente com {patientAge} anos)
                </Typography>
              ) : null;
            })()}
        </Box>

        <Grid container spacing={2}>
          {Object.entries(skinfolds).map(([key, value]) => {
            const currentFormulaDef = bodyDensityFormulas.find(
              (f) => f.id === skinfoldFormula
            );
            let isSkinfoldRequired = false;

            if (currentFormulaDef) {
              if (skinfoldFormula === "guedes") {
                if (isMale) {
                  isSkinfoldRequired = [
                    "tricipital",
                    "suprailiac",
                    "abdominal",
                  ].includes(key);
                } else if (isFemale) {
                  isSkinfoldRequired = [
                    "subscapular",
                    "suprailiac",
                    "thigh",
                  ].includes(key);
                }
              } else if (skinfoldFormula === "petroski") {
                const patientAge = patient?.birthDate
                  ? Math.floor(
                      (new Date().getTime() -
                        new Date(patient.birthDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365.25)
                    )
                  : 0;

                const requiredSkinfolds =
                  currentFormulaDef.getRequiredSkinfolds?.(
                    currentPatientGender || "",
                    patientAge
                  ) || [];

                isSkinfoldRequired = requiredSkinfolds.includes(
                  key as keyof SkinfoldsState
                );
              } else {
                isSkinfoldRequired =
                  currentFormulaDef.requiredSkinfolds.includes(
                    key as keyof SkinfoldsState
                  );
              }
            }

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
                        fontWeight: isSkinfoldRequired ? 700 : 400,
                        color: isSkinfoldRequired ? "primary.main" : "inherit",
                      }}
                    >
                      {`${skinfoldLabels[key as keyof SkinfoldsState]} (mm)`}
                    </Typography>
                  }
                  value={value}
                  onChange={onSkinfoldChange(key as keyof SkinfoldsState)}
                  InputProps={{
                    sx: {
                      bgcolor: "background.paper",
                      ...(skinfoldFormula !== "none" && {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: isSkinfoldRequired
                            ? "primary.main"
                            : "grey.300",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: isSkinfoldRequired
                            ? "primary.dark"
                            : "grey.400",
                        },
                      }),
                    },
                  }}
                  type="number"
                  inputProps={{ min: "0", step: "0.1" }}
                />
              </Box>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
