import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import InfoIcon from "@mui/icons-material/Info";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SaveIcon from "@mui/icons-material/Save";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useParams } from "react-router-dom";
import {
  useCreateEnergyPlan,
  useUpdateEnergyPlan,
} from "../hooks/useEnergyPlans";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/modules/patient/services/patientService";
import { authService } from "../../auth/services/authService";
import { EnergyPlanResponseDto } from "../services/energyPlanService";
import {
  calculateTMB,
  calculateGET,
  calculateAge,
} from "../utils/energyCalculations";
import {
  FORMULA_DESCRIPTIONS,
  ACTIVITY_FACTOR_DESCRIPTIONS,
  INJURY_FACTOR_DESCRIPTIONS,
} from "../constants/energyPlanConstants";
import { ImportMeasurementsModal } from "./ImportMeasurementsModal";

// Constantes
const EQUACOES = [
  { label: "Harris-Benedict (1984)", value: "harris_benedict_1984" },
  { label: "FAO/OMS (2004)", value: "fao_who_2004" },
  { label: "IOM EER (2005)", value: "iom_eer_2005" },
];

const NIVEL_ATIVIDADE = [
  { label: "Sedentário (1.200)", value: "1.200" },
  { label: "Pouco ativo (1.375)", value: "1.375" },
  { label: "Ativo (1.550)", value: "1.550" },
  { label: "Muito ativo (1.725)", value: "1.725" },
  { label: "Atlético (1.900)", value: "1.900" },
];

const FATOR_CLINICO = [
  { label: "Saudável (1.000)", value: "1.000" },
  { label: "Pós-operatório simples (1.200)", value: "1.200" },
  { label: "Trauma moderado (1.350)", value: "1.350" },
  { label: "Infecção grave (1.500)", value: "1.500" },
];

// Cor primária do tema
const COR_TEMA = "#1976d2";

export interface DadosPlanoEnergetico {
  nome: string;
  dataCalculo: string;
  equacao: string;
  peso: number | string | undefined; // Input value can be string
  altura: number | string | undefined; // Input value can be string
  massaMagra?: number | string; // Input value can be string
  nivelAtividade: string;
  fatorClinico: string;
}

interface EnergyPlanFormProps {
  onSuccess?: () => void;
  planToEdit?: EnergyPlanResponseDto | null;
}

// Helper to format numbers for text input, ensuring dot as decimal separator
const formatNumberForInput = (
  num: number | undefined | null
): string | undefined => {
  if (num === undefined || num === null) return undefined;
  return String(num).replace(",", "."); // Explicitly use dot
};

// Helper to parse numeric fields from form data for payload
const parseNumericField = (
  value: string | number | undefined
): number | undefined => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }
  const num = Number(String(value).replace(",", ".")); // Also handle comma input just in case
  return isNaN(num) ? undefined : num;
};

export const EnergyPlanForm: React.FC<EnergyPlanFormProps> = ({
  onSuccess,
  planToEdit,
}) => {
  const { patientId } = useParams<{ patientId: string }>();
  const createPlan = useCreateEnergyPlan();
  const updatePlan = useUpdateEnergyPlan();
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const nutritionistId = authService.getUser()?.id;

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue, // Added setValue for more control if needed
    formState: { errors },
  } = useForm<DadosPlanoEnergetico>({
    defaultValues: {
      nome: "",
      dataCalculo: new Date().toISOString().split("T")[0], // Default to today
      equacao: "harris_benedict_1984",
      peso: undefined,
      altura: undefined,
      massaMagra: undefined,
      nivelAtividade: "1.200",
      fatorClinico: "1.000",
    },
  });

  const watchedPeso = watch("peso");
  const watchedAltura = watch("altura");
  const watchedMassaMagra = watch("massaMagra");
  const watchedEquacao = watch("equacao");
  const watchedNivelAtividade = watch("nivelAtividade");
  const watchedFatorClinico = watch("fatorClinico");

  const [calculatedTMB, setCalculatedTMB] = React.useState<number | null>(null);
  const [calculatedGET, setCalculatedGET] = React.useState<number | null>(null);
  const [calculationDetails, setCalculationDetails] = React.useState<{
    formula: string;
    activityFactor: string;
    injuryFactor: string;
    isValid: boolean;
    validationMessage?: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [importModalOpen, setImportModalOpen] = React.useState(false);

  const handleImportMeasurements = (measurement: {
    weight: number;
    height: number;
    muscleMass?: number;
  }) => {
    // Use setValue to ensure correct formatting for number inputs
    setValue("peso", formatNumberForInput(measurement.weight), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("altura", formatNumberForInput(measurement.height), {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (measurement.muscleMass !== undefined) {
      setValue("massaMagra", formatNumberForInput(measurement.muscleMass), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setImportModalOpen(false);
  };

  const validateFormulaInputs = (
    formula: string,
    weight: number | undefined,
    height: number | undefined,
    age: number
  ) => {
    if (weight === undefined || height === undefined) {
      return {
        isValid: false,
        message: "Peso e altura são necessários para o cálculo.",
      };
    }
    switch (formula) {
      case "harris_benedict_1984":
        if (age < 18) {
          return {
            isValid: false,
            message:
              "A fórmula Harris-Benedict é recomendada apenas para adultos (18+ anos).",
          };
        }
        break;
      case "fao_who_2004":
        if (age > 60) {
          return {
            isValid: false,
            message:
              "A fórmula FAO/OMS tem limitações para idosos acima de 60 anos.",
          };
        }
        break;
      // case "iom_eer_2005":
      //   break; // Specific checks in its calculation function
    }
    return { isValid: true };
  };

  React.useEffect(() => {
    if (!patient || !watchedPeso || !watchedAltura || !patient.birthDate) {
      setCalculatedTMB(null);
      setCalculatedGET(null);
      setCalculationDetails(null);
      return;
    }

    setIsCalculating(true);
    const ageYears = calculateAge(
      patient.birthDate,
      new Date(watch("dataCalculo"))
    );
    const gender = patient.gender.toLowerCase() === "f" ? "female" : "male";

    const currentPeso = parseNumericField(watchedPeso);
    const currentAltura = parseNumericField(watchedAltura);
    const currentMassaMagra = parseNumericField(watchedMassaMagra);

    const validation = validateFormulaInputs(
      watchedEquacao,
      currentPeso,
      currentAltura,
      ageYears
    );

    let tmb: number | null = null;
    let get: number | null = null;

    if (validation.isValid && currentPeso && currentAltura) {
      tmb = calculateTMB({
        formulaKey: watchedEquacao,
        weightKg: currentPeso,
        heightCm: currentAltura,
        ageYears,
        gender,
        fatFreeMassKg: currentMassaMagra,
      });

      if (tmb !== null) {
        get = calculateGET({
          tmbKcal: tmb,
          activityFactorValue: Number(watchedNivelAtividade),
          injuryFactorValue: Number(watchedFatorClinico),
        });
      }
    }

    setCalculatedTMB(tmb);
    setCalculatedGET(get);
    setCalculationDetails({
      formula:
        FORMULA_DESCRIPTIONS[
          watchedEquacao as keyof typeof FORMULA_DESCRIPTIONS
        ]?.formula[gender as "male" | "female"] || "N/A",
      activityFactor:
        ACTIVITY_FACTOR_DESCRIPTIONS[
          watchedNivelAtividade as keyof typeof ACTIVITY_FACTOR_DESCRIPTIONS
        ]?.name || "N/A",
      injuryFactor:
        INJURY_FACTOR_DESCRIPTIONS[
          watchedFatorClinico as keyof typeof INJURY_FACTOR_DESCRIPTIONS
        ]?.name || "N/A",
      isValid: validation.isValid && tmb !== null && get !== null,
      validationMessage: validation.message,
    });

    setIsCalculating(false);
  }, [
    patient,
    watchedPeso,
    watchedAltura,
    watchedMassaMagra,
    watchedEquacao,
    watchedNivelAtividade,
    watchedFatorClinico,
    watch, // Recalculate if dataCalculo changes age
  ]);

  React.useEffect(() => {
    if (planToEdit) {
      reset({
        nome: planToEdit.name || "",
        dataCalculo:
          planToEdit.calculationDate || new Date().toISOString().split("T")[0],
        equacao: planToEdit.formulaKey || "harris_benedict_1984",
        peso: formatNumberForInput(planToEdit.weightAtCalculationKg),
        altura: formatNumberForInput(planToEdit.heightAtCalculationCm),
        massaMagra: formatNumberForInput(planToEdit.fatFreeMassAtCalculationKg),
        nivelAtividade: planToEdit.activityFactorKey || "1.200",
        fatorClinico: planToEdit.injuryFactorKey || "1.000",
      });
    } else {
      // Reset to initial default values (already handled by useForm defaultValues)
      // but explicitly ensure dataCalculo is set for new forms if not editing
      reset({
        nome: "",
        dataCalculo: new Date().toISOString().split("T")[0],
        equacao: "harris_benedict_1984",
        peso: undefined,
        altura: undefined,
        massaMagra: undefined,
        nivelAtividade: "1.200",
        fatorClinico: "1.000",
      });
    }
  }, [planToEdit, reset]);

  const onSubmit = (data: DadosPlanoEnergetico) => {
    if (
      !patientId ||
      !patient ||
      calculatedGET === null ||
      calculatedTMB === null
    ) {
      setSnackbar({
        open: true,
        message:
          "Não foi possível calcular GET/TMB. Verifique os dados do paciente e do plano.",
        severity: "error",
      });
      return;
    }
    if (!calculationDetails?.isValid) {
      setSnackbar({
        open: true,
        message:
          calculationDetails?.validationMessage ||
          "Dados inválidos para a fórmula selecionada.",
        severity: "warning",
      });
      return;
    }

    const nomePlano =
      data.nome && data.nome.trim().length > 0
        ? data.nome.trim()
        : "Plano Energético Padrão"; // More descriptive default

    const payload = {
      name: nomePlano,
      calculationDate: data.dataCalculo, // Already in correct format
      formulaKey: data.equacao,
      weightAtCalculationKg: parseNumericField(data.peso),
      heightAtCalculationCm: parseNumericField(data.altura),
      fatFreeMassAtCalculationKg: parseNumericField(data.massaMagra),
      activityFactorKey: data.nivelAtividade,
      injuryFactorKey: data.fatorClinico,
      ageAtCalculationYears: patient.birthDate
        ? calculateAge(patient.birthDate, new Date(data.dataCalculo))
        : 0, // Should ideally not be 0 if birthDate is present
      genderAtCalculation:
        patient.gender.toLowerCase() === "f"
          ? "female"
          : patient.gender.toLowerCase() === "m"
          ? "male"
          : "other", // Or handle unknown gender more robustly
      calculatedGetKcal: Math.round(calculatedGET), // GET is validated not null
      calculatedTmbKcal: Math.round(calculatedTMB), // TMB is validated not null
      nutritionistId: nutritionistId,
      patientId: patientId,
    };

    const mutationOptions = {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: planToEdit
            ? "Plano atualizado com sucesso!"
            : "Plano criado com sucesso!",
          severity: "success" as "success" | "error",
        });
        // Reset to initial default values after successful submission
        reset({
          nome: "",
          dataCalculo: new Date().toISOString().split("T")[0],
          equacao: "harris_benedict_1984",
          peso: undefined,
          altura: undefined,
          massaMagra: undefined,
          nivelAtividade: "1.200",
          fatorClinico: "1.000",
        });
        if (onSuccess) onSuccess();
      },
      onError: (error: Error) => {
        setSnackbar({
          open: true,
          message: `Erro ao ${
            planToEdit ? "atualizar" : "criar"
          } plano energético: ${error.message}`,
          severity: "error" as "success" | "error",
        });
      },
    };

    if (planToEdit && planToEdit.id) {
      updatePlan.mutate(
        { id: planToEdit.id, data: payload, patientId },
        mutationOptions
      );
    } else {
      createPlan.mutate({ patientId, data: payload }, mutationOptions);
    }
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isLoadingPatient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // If patient data failed to load or patient is null after loading
  if (!isLoadingPatient && !patient) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Não foi possível carregar os dados do paciente. Verifique o ID ou tente
        novamente.
      </Alert>
    );
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5, // Slightly increased gap
        }}
      >
        {/* Seção de nome do plano e data */}
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <Controller
                  name="nome"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 100,
                      message: "Nome deve ter no máximo 100 caracteres",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Nome do Plano"
                      size="small"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Controller
                  name="dataCalculo"
                  control={control}
                  rules={{ required: "Data é obrigatória" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Data do Cálculo"
                      type="date"
                      size="small"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Seção de dados antropométricos */}
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Medidas Corporais
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="altura"
                  control={control}
                  rules={{
                    required: "Altura é obrigatória",
                    min: { value: 50, message: "Altura mínima: 50cm" },
                    max: { value: 300, message: "Altura máxima: 300cm" },
                    pattern: {
                      value: /^[0-9]+([.,][0-9]+)?$/,
                      message: "Altura inválida (use . ou , para decimais)",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Altura (cm)"
                      type="text" // Use text to allow comma and dot, parse on submit/calculate
                      inputMode="decimal"
                      size="small"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="peso"
                  control={control}
                  rules={{
                    required: "Peso é obrigatório",
                    min: { value: 1, message: "Peso mínimo: 1kg" },
                    max: { value: 500, message: "Peso máximo: 500kg" },
                    pattern: {
                      value: /^[0-9]+([.,][0-9]+)?$/,
                      message: "Peso inválido (use . ou , para decimais)",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Peso (kg)"
                      type="text" // Use text to allow comma and dot
                      inputMode="decimal"
                      size="small"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Controller
                  name="massaMagra"
                  control={control}
                  rules={{
                    min: { value: 0, message: "Massa magra deve ser >= 0" },
                    max: {
                      value: 300,
                      message: "Valor de massa magra parece irreal",
                    },
                    pattern: {
                      value: /^[0-9]*([.,][0-9]+)?$/, // Optional field
                      message:
                        "Massa magra inválida (use . ou , para decimais)",
                    },
                    validate: (value) => {
                      if (!value || String(value).trim() === "") return true; // Optional
                      const mm = parseNumericField(value);
                      const p = parseNumericField(watchedPeso);
                      if (mm === undefined) return true; // Allow if parsing failed but pattern matched (e.g. just ".")
                      if (p !== undefined && mm > p) {
                        return "Massa magra não pode ser maior que o peso";
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Massa Magra (kg)"
                      type="text" // Use text to allow comma and dot
                      inputMode="decimal"
                      size="small"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Button
              variant="text"
              startIcon={<FileUploadIcon />}
              size="small"
              onClick={() => setImportModalOpen(true)}
              sx={{ mt: 1.5, color: COR_TEMA, textTransform: "none" }}
            >
              Importar medidas da avaliação
            </Button>
          </CardContent>
        </Card>

        {/* Seção de equações */}
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Métodos de Cálculo
              </Typography>
              <Tooltip
                title={
                  <Box sx={{ p: 1, maxWidth: 300 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sobre as Fórmulas
                    </Typography>
                    {Object.entries(FORMULA_DESCRIPTIONS).map(
                      ([key, value]) => (
                        <Box key={key} sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {value.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: "block", whiteSpace: "normal" }}
                          >
                            {value.description}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                }
              >
                <IconButton size="small" sx={{ color: COR_TEMA }}>
                  <InfoIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={2}>
              {/* Adjusted grid to allow natural width or expand */}
              <Grid item xs={12} md="auto" flexGrow={1}>
                <Controller
                  name="equacao"
                  control={control}
                  rules={{ required: "Equação é obrigatória" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      select
                      label="Equação"
                      size="small"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                      sx={{
                        // Removed fixed height, allow natural sizing
                        minWidth: { md: 220 }, // Ensure a minimum width on medium screens
                        "& .MuiInputBase-root": {
                          alignItems: "flex-start", // Good for multiline items
                        },
                      }}
                    >
                      {EQUACOES.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ whiteSpace: "normal" }}
                        >
                          <Box>
                            <Typography variant="body2">
                              {option.label}
                            </Typography>
                            {FORMULA_DESCRIPTIONS[
                              option.value as keyof typeof FORMULA_DESCRIPTIONS
                            ]?.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  // whiteSpace: "normal", // already on MenuItem
                                  // maxHeight: 32, // Let it flow or be controlled by lineclamp
                                }}
                              >
                                {
                                  FORMULA_DESCRIPTIONS[
                                    option.value as keyof typeof FORMULA_DESCRIPTIONS
                                  ].description
                                }
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md="auto" flexGrow={1}>
                <Controller
                  name="nivelAtividade"
                  control={control}
                  rules={{ required: "Nível de atividade é obrigatório" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      select
                      label="Nível de Atividade Física"
                      size="small"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                      sx={{
                        minWidth: { md: 220 },
                        "& .MuiInputBase-root": {
                          alignItems: "flex-start",
                        },
                      }}
                    >
                      {NIVEL_ATIVIDADE.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ whiteSpace: "normal" }}
                        >
                          <Box>
                            <Typography variant="body2">
                              {option.label}
                            </Typography>
                            {ACTIVITY_FACTOR_DESCRIPTIONS[
                              option.value as keyof typeof ACTIVITY_FACTOR_DESCRIPTIONS
                            ]?.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {
                                  ACTIVITY_FACTOR_DESCRIPTIONS[
                                    option.value as keyof typeof ACTIVITY_FACTOR_DESCRIPTIONS
                                  ].description
                                }
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md="auto" flexGrow={1}>
                <Controller
                  name="fatorClinico"
                  control={control}
                  rules={{ required: "Fator clínico é obrigatório" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      select
                      label="Fator Clínico"
                      size="small"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      fullWidth
                      sx={{
                        minWidth: { md: 220 },
                        "& .MuiInputBase-root": {
                          alignItems: "flex-start",
                        },
                      }}
                    >
                      {FATOR_CLINICO.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ whiteSpace: "normal" }}
                        >
                          <Box>
                            <Typography variant="body2">
                              {option.label}
                            </Typography>
                            {INJURY_FACTOR_DESCRIPTIONS[
                              option.value as keyof typeof INJURY_FACTOR_DESCRIPTIONS
                            ]?.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {
                                  INJURY_FACTOR_DESCRIPTIONS[
                                    option.value as keyof typeof INJURY_FACTOR_DESCRIPTIONS
                                  ].description
                                }
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
            {calculationDetails &&
              !calculationDetails.isValid &&
              calculationDetails.validationMessage && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {calculationDetails.validationMessage}
                </Alert>
              )}
          </CardContent>
        </Card>

        {/* Seção de ajustes */}
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Ajustes Adicionais{" "}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                (Funcionalidade futura)
              </Typography>
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                  startIcon={<DirectionsRunIcon />}
                  size="small"
                  sx={{ borderRadius: 2, textTransform: "none", py: 1 }}
                >
                  Ajustar MET
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                  startIcon={<MonitorWeightIcon />}
                  size="small"
                  sx={{ borderRadius: 2, textTransform: "none", py: 1 }}
                >
                  Ajustar Peso
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled
                  startIcon={<AddCircleOutlineIcon />}
                  size="small"
                  sx={{ borderRadius: 2, textTransform: "none", py: 1 }}
                >
                  Adicionar Fator
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Seção de resultados */}
        <Card
          variant="elevation"
          elevation={2}
          sx={{ bgcolor: "rgba(76, 175, 80, 0.08)" }} // Slightly adjusted alpha
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography
              variant="h6"
              fontWeight={700} // Bolder
              sx={{ mb: 1.5, color: "success.dark" }} // Using theme color
            >
              Resultados Estimados
            </Typography>

            {isCalculating ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 80, // Consistent height
                }}
              >
                <CircularProgress size={32} sx={{ color: "success.main" }} />
                <Typography sx={{ ml: 1.5, color: "text.secondary" }}>
                  Calculando...
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body1" // Slightly larger label
                      color="text.secondary"
                      gutterBottom
                    >
                      Taxa Metabólica Basal (TMB)
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ color: "success.darker", letterSpacing: "0.5px" }}
                    >
                      {calculatedTMB !== null
                        ? `${Math.round(calculatedTMB)} kcal`
                        : "-- kcal"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Gasto Energético Total (GET)
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{ color: "success.darker", letterSpacing: "0.5px" }}
                    >
                      {calculatedGET !== null
                        ? `${Math.round(calculatedGET)} kcal`
                        : "-- kcal"}
                    </Typography>
                  </Grid>
                </Grid>
                {calculationDetails?.formula && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 2, display: "block", lineHeight: 1.5 }}
                  >
                    Usando: {calculationDetails.formula} (TMB)
                    <br />
                    Fator Atividade: {calculationDetails.activityFactor}
                    <br />
                    Fator Clínico: {calculationDetails.injuryFactor}
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          startIcon={<SaveIcon />}
          sx={{
            mt: 1.5,
            py: 1.5, // More padding
            borderRadius: "8px", // Slightly more rounded
            fontWeight: "600", // Semibold
            fontSize: "1rem", // Ensure good readability
            textTransform: "none",
            bgcolor: COR_TEMA,
            "&:hover": {
              bgcolor: "#1565c0",
            },
          }}
          disabled={
            createPlan.isPending ||
            updatePlan.isPending ||
            isCalculating ||
            isLoadingPatient || // Crucial: disable if patient isn't loaded
            (calculationDetails !== null &&
              !calculationDetails.isValid &&
              calculationDetails.validationMessage !== undefined) // Disable if there's a validation message from calculations
          }
        >
          {createPlan.isPending || updatePlan.isPending
            ? "Salvando..."
            : planToEdit
            ? "Atualizar Plano"
            : "Salvar Plano"}
        </Button>
      </Box>

      <ImportMeasurementsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSelect={handleImportMeasurements}
        patientId={patientId!} // PatientId should exist here
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EnergyPlanForm;
