import React from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { energyPlanService } from "../services/energyPlanService";
import SaveIcon from "@mui/icons-material/Save";
import { useForm } from "react-hook-form";
import { patientService } from "@/modules/patient/services/patientService";
import EnergyPlanGoalSection from "../components/EnergyPlanGoalSection";
import EnergyPlanResultsSection from "../components/EnergyPlanResultsSection";
import EnergyPlanFormSection from "../components/EnergyPlanFormSection";
import MacronutrientDistributionSection from "../components/MacronutrientDistributionSection";
import { ImportMeasurementsModal } from "../components/ImportMeasurementsModal";
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
import {
  useCreateEnergyPlan,
  useUpdateEnergyPlan,
} from "../hooks/useEnergyPlans";
import { authService } from "../../auth/services/authService";
import { CreateEnergyPlanDto } from "../services/energyPlanService";
import EnergyPlanMethodSection from "../components/EnergyPlanMethodSection";
import { DesignSystemButton } from "../../../components/DesignSystem/Button/ButtonVariants";

export interface DadosPlanoEnergetico {
  nome: string;
  dataCalculo: string;
  equacao: string;
  peso: number | string | undefined;
  altura: number | string | undefined;
  massaMagra?: number | string;
  nivelAtividade: string;
  fatorClinico: string;
}

// Helper to format numbers for text input, ensuring dot as decimal separator
const formatNumberForInput = (
  num: number | undefined | null
): string | undefined => {
  if (num === undefined || num === null) return undefined;
  return String(num).replace(",", ".");
};

// Helper to parse numeric fields from form data for payload
const parseNumericField = (
  value: string | number | undefined
): number | undefined => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }
  const num = Number(String(value).replace(",", "."));
  return isNaN(num) ? undefined : num;
};

interface FormData {
  nome: string;
  dataCalculo: string;
  equacao: string;
  peso: string | number | undefined;
  altura: string | number | undefined;
  massaMagra?: string | number | undefined;
  nivelAtividade: string;
  fatorClinico: string;
}

interface CalculationDetails {
  formula: string;
  activityFactor: string;
  injuryFactor: string;
  isValid: boolean;
  validationMessage?: string;
}

const EnergyPlanMain: React.FC = () => {
  const navigate = useNavigate();
  const { patientId, planId } = useParams<{
    patientId: string;
    planId: string;
  }>();

  // Busca plano para edição, se houver planId
  const { data: planToEdit, isLoading } = useQuery({
    queryKey: ["energyPlan", planId],
    queryFn: () => energyPlanService.getById(planId!),
    enabled: !!planId,
  });

  // Lógica do formulário (copiada do antigo EnergyPlanMain)
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
    setValue,
    formState: { errors },
  } = useForm<DadosPlanoEnergetico>({
    defaultValues: {
      nome: "",
      dataCalculo: new Date().toISOString().split("T")[0],
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
  const [calculationDetails, setCalculationDetails] =
    React.useState<CalculationDetails | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [goalWeight, setGoalWeight] = React.useState(0);
  const [goalDays, setGoalDays] = React.useState(0);
  const [macronutrientDistribution, setMacronutrientDistribution] =
    React.useState({
      proteins: 20,
      carbs: 50,
      fats: 30,
    });

  const handleImportMeasurements = (measurement: unknown) => {
    if (
      typeof measurement === "object" &&
      measurement !== null &&
      "weight" in measurement &&
      "height" in measurement
    ) {
      const m = measurement as {
        weight: number;
        height: number;
        fatFreeMass: number;
      };
      setValue("peso", formatNumberForInput(m.weight), {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("altura", formatNumberForInput(m.height), {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (typeof m.fatFreeMass === "number") {
        setValue("massaMagra", formatNumberForInput(m.fatFreeMass), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      setImportModalOpen(false);
    }
  };

  const validateFormulaInputs = (
    formula: string,
    weight: number | undefined,
    height: number | undefined,
    age: number
  ): { isValid: boolean; validationMessage?: string } => {
    if (weight === undefined || height === undefined) {
      return {
        isValid: false,
        validationMessage: "Peso e altura são necessários para o cálculo.",
      };
    }
    switch (formula) {
      case "harris_benedict_1984":
        if (age < 18) {
          return {
            isValid: false,
            validationMessage:
              "A fórmula Harris-Benedict é recomendada apenas para adultos (18+ anos).",
          };
        }
        break;
      case "fao_who_2004":
        if (age > 60) {
          return {
            isValid: false,
            validationMessage:
              "A fórmula FAO/OMS tem limitações para idosos acima de 60 anos.",
          };
        }
        break;
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
        // Calculate weight goal adjustment if goal is set
        let weightGoalKcalAdjustment = 0;
        if (goalWeight !== 0 && goalDays > 0) {
          weightGoalKcalAdjustment = Number(
            ((goalWeight * 7700) / goalDays).toFixed(1)
          );
        }

        get = calculateGET({
          tmbKcal: tmb,
          activityFactorValue: Number(watchedNivelAtividade),
          injuryFactorValue: Number(watchedFatorClinico),
          weightGoalKcalAdjustment,
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
      validationMessage: validation.validationMessage,
    });
    setIsCalculating(false);
  }, [
    patient,
    watchedPeso,
    watchedAltura,
    watchedEquacao,
    watchedNivelAtividade,
    watchedFatorClinico,
    watchedMassaMagra,
    watch,
    goalWeight,
    goalDays,
  ]);

  React.useEffect(() => {
    if (planToEdit) {
      reset({
        nome: planToEdit.name || "",
        dataCalculo:
          planToEdit.createdAt.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        equacao: planToEdit.formulaKey || "harris_benedict_1984",
        peso: formatNumberForInput(planToEdit.weightAtCalculationKg),
        altura: formatNumberForInput(planToEdit.heightAtCalculationCm),
        massaMagra: formatNumberForInput(planToEdit.fatFreeMassAtCalculationKg),
        nivelAtividade: planToEdit.activityFactorKey || "1.200",
        fatorClinico: planToEdit.injuryFactorKey || "1.000",
      });
      setGoalWeight(planToEdit.goalWeightChangeKg ?? 0);
      setGoalDays(planToEdit.goalDaysToAchieve ?? 0);
      setMacronutrientDistribution(
        planToEdit.macronutrientDistribution ?? {
          proteins: 20,
          carbs: 50,
          fats: 30,
        }
      );
    } else {
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
      setGoalWeight(0);
      setGoalDays(0);
    }
  }, [planToEdit, reset]);

  const onSubmit = async (data: FormData) => {
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

    try {
      // Monta o payload base
      const payload: CreateEnergyPlanDto = {
        name: data.nome.trim() || "Plano Energético Padrão",
        formulaKey: data.equacao,
        weightAtCalculationKg: parseNumericField(data.peso) || 0,
        heightAtCalculationCm: parseNumericField(data.altura) || 0,
        fatFreeMassAtCalculationKg: parseNumericField(data.massaMagra),
        ageAtCalculationYears: patient.birthDate
          ? calculateAge(patient.birthDate, new Date(data.dataCalculo))
          : 0,
        genderAtCalculation:
          patient.gender.toLowerCase() === "f"
            ? "female"
            : patient.gender.toLowerCase() === "m"
            ? "male"
            : "other",
        activityFactorKey: data.nivelAtividade,
        injuryFactorKey: data.fatorClinico,
        calculatedTmbKcal: Number(calculatedTMB),
        calculatedGetKcal: Number(calculatedGET),
        macronutrientDistribution,
        nutritionistId: nutritionistId!,
        patientId: patientId,
      };

      // Só adiciona os campos de meta se o usuário preencheu
      if (goalWeight !== 0 || goalDays !== 0) {
        const payloadWithGoal = {
          ...payload,
          goalWeightChangeKg: goalWeight,
          goalDaysToAchieve: goalDays,
        };
        if (goalWeight !== 0 && goalDays > 0) {
          payloadWithGoal.calculatedGoalKcalAdjustment = Number(
            (goalWeight * 7700) / goalDays
          );
        }
        if (planId) {
          await updatePlan.mutateAsync({
            id: planId,
            data: payloadWithGoal,
            patientId,
          });
        } else {
          await createPlan.mutateAsync({ patientId, data: payloadWithGoal });
        }
      } else {
        if (planId) {
          await updatePlan.mutateAsync({
            id: planId,
            data: payload,
            patientId,
          });
        } else {
          await createPlan.mutateAsync({ patientId, data: payload });
        }
      }
      navigate(`/patient/${patientId}/energy-plans`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSnackbar({
        open: true,
        message: `Erro ao ${planId ? "atualizar" : "criar"} plano energético: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        severity: "error",
      });
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

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isLoadingPatient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoadingPatient && !patient) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Não foi possível carregar os dados do paciente. Verifique o ID ou tente
        novamente.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <IconButton
          onClick={() => navigate(`/patient/${patientId}/energy-plans`)}
          sx={{ color: "text.primary" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {planId ? "Editar Plano Energético" : "Novo Plano Energético"}
        </Typography>
      </Box>

      {/* Formulário */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <EnergyPlanFormSection
          control={control}
          errors={errors}
          watchedPeso={watch("peso")}
          setImportModalOpen={setImportModalOpen}
          importModalOpen={importModalOpen}
          handleImportMeasurements={handleImportMeasurements}
          patientId={patientId || ""}
          calculationDetails={calculationDetails}
        />

        <EnergyPlanGoalSection
          goalWeight={goalWeight}
          setGoalWeight={setGoalWeight}
          goalDays={goalDays}
          setGoalDays={setGoalDays}
        />

        {calculatedGET && watch("peso") && (
          <MacronutrientDistributionSection
            peso={parseNumericField(watch("peso")) || 0}
            get={calculatedGET}
            onDistributionChange={setMacronutrientDistribution}
            macronutrientDistribution={macronutrientDistribution}
          />
        )}

        <EnergyPlanMethodSection
          control={control}
          calculationDetails={calculationDetails}
        />

        <EnergyPlanResultsSection
          isCalculating={isCalculating}
          calculatedTMB={calculatedTMB}
          calculatedGET={calculatedGET}
          calculationDetails={calculationDetails}
          goalWeight={goalWeight}
          goalDays={goalDays}
        />

        <DesignSystemButton
          type="submit"
          variant="contained"
          fullWidth
          startIcon={<SaveIcon />}
          disabled={
            createPlan.isPending ||
            updatePlan.isPending ||
            isCalculating ||
            isLoadingPatient ||
            (calculationDetails !== null &&
              !calculationDetails.isValid &&
              calculationDetails.validationMessage !== undefined)
          }
        >
          {createPlan.isPending || updatePlan.isPending
            ? "Salvando..."
            : planId
            ? "Atualizar Plano"
            : "Salvar Plano"}
        </DesignSystemButton>
      </Box>

      <ImportMeasurementsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSelect={handleImportMeasurements}
        patientId={patientId!}
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
    </Box>
  );
};

export default EnergyPlanMain;
