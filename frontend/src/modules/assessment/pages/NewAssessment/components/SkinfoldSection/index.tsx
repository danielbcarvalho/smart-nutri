// skinfoldsection.tsx
import React, { useMemo } from "react";
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
  Tooltip,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { bodyDensityFormulas } from "../../../../calcs/formulas"; // Ajuste o caminho
import {
  BodyDensityFormula,
  SkinfoldsInput as SkinfoldsState,
} from "../../../../calcs/formulas/types"; // Ajuste o caminho

// Função utilitária para calcular idade
const calculateAge = (birthDateString?: string): number | undefined => {
  if (!birthDateString) return undefined;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return undefined; // Data inválida
  const ageDiffMs = new Date().getTime() - birthDate.getTime();
  return Math.floor(ageDiffMs / (1000 * 60 * 60 * 24 * 365.25));
};

interface SkinfoldSectionProps {
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  skinfolds: SkinfoldsState;
  skinfoldFormula: string; // ID da fórmula selecionada
  onSkinfoldFormulaChange: (formulaId: string) => void;
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
  const skinfoldLabels: Record<keyof SkinfoldsState, string> = {
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

  const currentPatientGender = useMemo(() => {
    const gender = patientGender?.toUpperCase();
    return gender;
  }, [patientGender]);
  const patientAge = useMemo(() => {
    const age = calculateAge(patient?.birthDate);
    return age;
  }, [patient?.birthDate]);

  const isMale =
    currentPatientGender === "M" || currentPatientGender === "MALE";
  const isFemale =
    currentPatientGender === "F" || currentPatientGender === "FEMALE";

  const selectedFormulaDef = useMemo(() => {
    const formula = bodyDensityFormulas.find((f) => f.id === skinfoldFormula);
    return formula;
  }, [skinfoldFormula]);

  const AgeWarningMessage: React.FC<{ formulaDef?: BodyDensityFormula }> = ({
    formulaDef,
  }) => {
    if (!formulaDef || !patientAge || !formulaDef.ageRange) return null;

    let message = "";
    let isOutsideRange = false;
    const generalMin = formulaDef.ageRange.min;
    const generalMax = formulaDef.ageRange.max;

    if (formulaDef.id === "petroski") {
      const range = formulaDef.ageRange as any; // Para acessar subpropriedades male/female
      let specificMin = generalMin;
      let specificMax = generalMax;
      let genderSpecificMsg = "";

      if (isMale && range.male) {
        specificMin = range.male.min;
        specificMax = range.male.max;
        genderSpecificMsg = `Para homens, é validada entre ${specificMin} e ${specificMax.toFixed(
          1
        )} anos.`;
      } else if (isFemale && range.female) {
        specificMin = range.female.min;
        specificMax = range.female.max;
        genderSpecificMsg = `Para mulheres, é validada entre ${specificMin} e ${specificMax} anos.`;
      }

      isOutsideRange = patientAge < specificMin || patientAge > specificMax;
      message = `⚠️ A fórmula de Petroski ${
        genderSpecificMsg
          ? genderSpecificMsg
          : `tem faixas de validação (geral: ${generalMin}-${generalMax} anos).`
      } Considere a aplicabilidade para este paciente com ${patientAge} anos.`;
    } else if (formulaDef.id === "durnin") {
      isOutsideRange = patientAge < generalMin || patientAge > generalMax;
      // Adicionando o alerta específico sobre a simplificação
      message = `⚠️ A fórmula de Durnin & Womersley (faixa ${generalMin}-${generalMax} anos) é uma versão simplificada do protocolo original, que possui constantes específicas por faixa etária. Considere a aplicabilidade para este paciente com ${patientAge} anos.`;
    } else if (formulaDef.id === "faulkner") {
      isOutsideRange = patientAge < generalMin || patientAge > generalMax;
      message = `⚠️ A fórmula de Faulkner (faixa ${generalMin}-${generalMax} anos) calcula o %G diretamente. Considere a aplicabilidade para este paciente com ${patientAge} anos.`;
    } else {
      // Para outras fórmulas como Guedes, Pollock3, Pollock7
      isOutsideRange = patientAge < generalMin || patientAge > generalMax;
      if (isOutsideRange) {
        message = `⚠️ A fórmula ${formulaDef.name} é indicada para a faixa etária de ${generalMin} a ${generalMax} anos. Considere a aplicabilidade para este paciente com ${patientAge} anos.`;
      }
    }

    return isOutsideRange ? (
      <Typography
        variant="body2"
        color="warning.main"
        sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
      >
        {message}
      </Typography>
    ) : null;
  };

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
            {bodyDensityFormulas.map((formula) => (
              <Tooltip
                key={formula.id}
                title={formula.description}
                placement="top"
                arrow
              >
                <ToggleButton
                  value={formula.id}
                  disabled={formula.status !== "active"}
                >
                  {formula.name.split("(")[0].trim()}
                </ToggleButton>
              </Tooltip>
            ))}
            <ToggleButton value="none">Nenhuma</ToggleButton>
          </ToggleButtonGroup>

          {skinfoldFormula !== "none" && selectedFormulaDef && (
            <AgeWarningMessage formulaDef={selectedFormulaDef} />
          )}
        </Box>

        <Grid container spacing={2}>
          {(Object.keys(skinfolds) as Array<keyof SkinfoldsState>).map(
            (key) => {
              let isSkinfoldRequired = false;
              if (
                selectedFormulaDef &&
                selectedFormulaDef.getRequiredSkinfolds
              ) {
                const requiredForFormula =
                  selectedFormulaDef.getRequiredSkinfolds(
                    currentPatientGender,
                    patientAge
                  );
                isSkinfoldRequired = requiredForFormula.includes(key);
              }

              return (
                <Box
                  sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }} // Ajuste para responsividade
                  key={key}
                >
                  <TextField
                    fullWidth
                    label={
                      <Typography
                        component="span"
                        sx={{
                          fontWeight: isSkinfoldRequired ? 700 : 400,
                          color: isSkinfoldRequired
                            ? "primary.main"
                            : "inherit",
                        }}
                      >
                        {`${skinfoldLabels[key]} (mm)`}
                      </Typography>
                    }
                    value={skinfolds[key]}
                    onChange={onSkinfoldChange(key)}
                    InputProps={{
                      sx: {
                        bgcolor: "background.paper",
                        ...(skinfoldFormula !== "none" &&
                          isSkinfoldRequired && {
                            // Destacar apenas se requerida
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.main",
                              borderWidth: isSkinfoldRequired ? "2px" : "1px", // Borda mais grossa se requerida
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "primary.dark",
                            },
                          }),
                      },
                    }}
                    type="number"
                    inputProps={{ min: "0", step: "0.1" }}
                  />
                </Box>
              );
            }
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
