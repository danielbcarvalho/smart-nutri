import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patientService,
  CreateMeasurementDto,
  Skinfolds as SkinfoldsType, // Renomeado para evitar conflito com estado local
  BodyMeasurements,
  BoneDiameters,
} from "@/modules/patient/services/patientService";
import { AssessmentPhoto } from "@services/photoService";

// Componentes
import { PhotosSection } from "./components/PhotosSection";
import { BasicDataSection } from "./components/BasicDataSection";
import { SkinfoldSection } from "./components/SkinfoldSection";
import { CircumferenceSection } from "./components/CircumferenceSection";
import { BoneDiameterSection } from "./components/BoneDiameterSection";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { AssessmentDate } from "./components/AssessmentDate";
import { ActionButtons } from "./components/ActionButtons";
import { AnalyticalResults } from "./components/AnalyticalResults";
import { calculateAnthropometricResults } from "../../calcs/anthropometricCalculations";
import { bodyDensityFormulas } from "../../calcs/formulas";
import {
  calculateBodyDensity,
  calculateBodyFatPercentage,
  calculateFatMass,
  calculateFatFreeMass,
} from "@/modules/assessment/calcs/anthropometricCalculations/bodyComposition";

// Definindo o tipo para o estado local `skinfolds` explicitamente.
type LocalSkinfoldsState = {
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

export function NewAssessment() {
  const { patientId, measurementId } = useParams<{
    patientId: string;
    measurementId: string;
  }>();
  const navigate = useNavigate();
  const [sharePhotos, setSharePhotos] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState<Date | null>(new Date());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [openGraphsModal, setOpenGraphsModal] = useState(false);
  const queryClient = useQueryClient();
  const isEditMode = !!measurementId;
  const isSaving = useRef(false);
  const [createdMeasurementId, setCreatedMeasurementId] = useState<
    string | null
  >(null);

  // Dados básicos
  const [basicData, setBasicData] = useState({
    weight: "",
    height: "",
    sittingHeight: "",
    kneeHeight: "",
  });

  // Estado para controle dos accordions
  const [expanded, setExpanded] = useState<string | false>("basicData");

  // Estado para dobras cutâneas
  const [skinfoldFormula, setSkinfoldFormula] = useState<string>("pollock3");
  const [skinfolds, setSkinfolds] = useState<LocalSkinfoldsState>({
    // Tipo explícito
    tricipital: "",
    bicipital: "",
    abdominal: "",
    subscapular: "",
    axillaryMedian: "",
    thigh: "",
    thoracic: "",
    suprailiac: "",
    calf: "",
    supraspinal: "",
  });

  // Estado para circunferências
  const [circumferences, setCircumferences] = useState({
    neck: "",
    shoulder: "",
    chest: "",
    waist: "",
    abdomen: "",
    hip: "",
    relaxedArmLeft: "",
    relaxedArmRight: "",
    contractedArmLeft: "",
    contractedArmRight: "",
    forearmLeft: "",
    forearmRight: "",
    proximalThighLeft: "",
    proximalThighRight: "",
    medialThighLeft: "",
    medialThighRight: "",
    distalThighLeft: "",
    distalThighRight: "",
    calfLeft: "",
    calfRight: "",
  });

  // Estado para diâmetro ósseo
  const [boneDiameters, setBoneDiameters] = useState({
    humerus: "",
    wrist: "",
    femur: "",
  });

  // Estado local para fotos (utilizado pelo handlePhotosChange)
  const [, setPhotos] = useState<{
    front: AssessmentPhoto[];
    back: AssessmentPhoto[];
    left: AssessmentPhoto[];
    right: AssessmentPhoto[];
  }>({
    front: [],
    back: [],
    left: [],
    right: [],
  });

  // Criar ref para controlar se já preenchemos dados
  const hasFilledDataRef = useRef(false);

  // Resetar o flag hasFilledDataRef quando o measurementId mudar
  useEffect(() => {
    hasFilledDataRef.current = false;
  }, [measurementId]);

  // Buscar dados do paciente
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  // Buscar avaliações anteriores do paciente
  const { data: previousMeasurements } = useQuery({
    queryKey: ["measurements", patientId],
    queryFn: () => patientService.findMeasurements(patientId!),
    enabled: !!patientId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Buscar a avaliação específica para edição, se estiver no modo de edição
  const { data: measurementToEdit } = useQuery({
    queryKey: ["measurement", patientId, measurementId],
    queryFn: () => {
      if (previousMeasurements) {
        return previousMeasurements.find((m) => m.id === measurementId);
      }
      return undefined;
    },
    enabled: !!patientId && !!measurementId && !!previousMeasurements,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Este useEffect preenche os dados quando estamos editando
  useEffect(() => {
    if (isEditMode && measurementToEdit && !hasFilledDataRef.current) {
      const toString = (value: number | string | null | undefined): string =>
        value !== null && value !== undefined ? String(value) : "";

      if (measurementToEdit.date) {
        const date = new Date(measurementToEdit.date);
        const localDate = new Date(
          date.getTime() + date.getTimezoneOffset() * 60000
        );
        setAssessmentDate(localDate);
      }

      setBasicData({
        weight: toString(measurementToEdit.weight),
        height: toString(measurementToEdit.height),
        sittingHeight: toString(measurementToEdit.sittingHeight),
        kneeHeight: toString(measurementToEdit.kneeHeight),
      });

      if (measurementToEdit.skinfoldFormula) {
        setSkinfoldFormula(measurementToEdit.skinfoldFormula);
      }

      if (measurementToEdit.skinfolds) {
        // Garantir que todas as chaves de LocalSkinfoldsState existam
        const currentSkinfolds = measurementToEdit.skinfolds;
        setSkinfolds({
          tricipital: toString(currentSkinfolds.tricipital),
          bicipital: toString(currentSkinfolds.bicipital),
          abdominal: toString(currentSkinfolds.abdominal),
          subscapular: toString(currentSkinfolds.subscapular),
          axillaryMedian: toString(currentSkinfolds.axillaryMedian),
          thigh: toString(currentSkinfolds.thigh),
          thoracic: toString(currentSkinfolds.thoracic),
          suprailiac: toString(currentSkinfolds.suprailiac),
          calf: toString(currentSkinfolds.calf),
          supraspinal: toString(currentSkinfolds.supraspinal),
        });
      }

      if (measurementToEdit.measurements) {
        const currentMeasurements = measurementToEdit.measurements;
        setCircumferences({
          neck: toString(currentMeasurements.neck),
          shoulder: toString(currentMeasurements.shoulder),
          chest: toString(currentMeasurements.chest),
          waist: toString(currentMeasurements.waist),
          abdomen: toString(currentMeasurements.abdomen),
          hip: toString(currentMeasurements.hip),
          relaxedArmLeft: toString(currentMeasurements.relaxedArmLeft),
          relaxedArmRight: toString(currentMeasurements.relaxedArmRight),
          contractedArmLeft: toString(currentMeasurements.contractedArmLeft),
          contractedArmRight: toString(currentMeasurements.contractedArmRight),
          forearmLeft: toString(currentMeasurements.forearmLeft),
          forearmRight: toString(currentMeasurements.forearmRight),
          proximalThighLeft: toString(currentMeasurements.proximalThighLeft),
          proximalThighRight: toString(currentMeasurements.proximalThighRight),
          medialThighLeft: toString(currentMeasurements.medialThighLeft),
          medialThighRight: toString(currentMeasurements.medialThighRight),
          distalThighLeft: toString(currentMeasurements.distalThighLeft),
          distalThighRight: toString(currentMeasurements.distalThighRight),
          calfLeft: toString(currentMeasurements.calfLeft),
          calfRight: toString(currentMeasurements.calfRight),
        });
      }

      if (measurementToEdit.boneDiameters) {
        const currentBoneDiameters = measurementToEdit.boneDiameters;
        setBoneDiameters({
          humerus: toString(currentBoneDiameters.humerus),
          wrist: toString(currentBoneDiameters.wrist),
          femur: toString(currentBoneDiameters.femur),
        });
      }

      hasFilledDataRef.current = true;
      if ("sharePhotos" in measurementToEdit) {
        setSharePhotos(!!measurementToEdit.sharePhotos);
      }
    }
  }, [isEditMode, measurementToEdit]);

  const anthropometricResults = useMemo(() => {
    const patientGenderUpper = patient?.gender?.toUpperCase();
    const calculationGender: "M" | "F" =
      patientGenderUpper === "F" || patientGenderUpper === "FEMALE" ? "F" : "M";

    const calculationAge = patient?.birthDate
      ? Math.floor(
          (new Date().getTime() - new Date(patient.birthDate).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : 30;

    // Convert string skinfold values to numbers for calculation
    const numericSkinfolds: { [key: string]: number } = {};
    for (const key in skinfolds) {
      const typedKey = key as keyof LocalSkinfoldsState;
      const value = parseFloat(skinfolds[typedKey]);
      numericSkinfolds[typedKey] = isNaN(value) ? 0 : value;
    }

    // Convert string circumference values to numbers
    const numericCircumferences: { [key: string]: number } = {};
    for (const key in circumferences) {
      const typedKey = key as keyof typeof circumferences;
      const value = parseFloat(circumferences[typedKey]);
      numericCircumferences[typedKey] = isNaN(value) ? 0 : value;
    }

    // Convert string bone diameter values to numbers
    const numericBoneDiameters: { [key: string]: number } = {};
    for (const key in boneDiameters) {
      const typedKey = key as keyof typeof boneDiameters;
      const value = parseFloat(boneDiameters[typedKey]);
      numericBoneDiameters[typedKey] = isNaN(value) ? 0 : value;
    }

    const results = calculateAnthropometricResults({
      gender: calculationGender,
      age: calculationAge,
      weight: parseFloat(basicData.weight) || 0,
      height: parseFloat(basicData.height) || 0,
      skinfolds: numericSkinfolds as SkinfoldsType,
      circumferences: numericCircumferences as BodyMeasurements,
      boneDiameters: numericBoneDiameters as BoneDiameters,
      skinfoldFormula,
    });

    // Calcular a densidade corporal
    const skinfoldValues: Record<string, string> = {};
    Object.entries(numericSkinfolds).forEach(([key, value]) => {
      skinfoldValues[key] = String(value);
    });

    const { density } = calculateBodyDensity(
      skinfoldValues,
      calculationGender,
      calculationAge,
      skinfoldFormula
    );

    // Calcular o percentual de gordura
    const bodyFatValue =
      density > 0 ? calculateBodyFatPercentage(density) : null;

    // Calcular massa gorda e massa livre de gordura
    const weight = parseFloat(basicData.weight) || 0;
    const fatMass = bodyFatValue
      ? calculateFatMass(weight, bodyFatValue)
      : null;
    const fatFreeMass = fatMass ? calculateFatFreeMass(weight, fatMass) : null;

    return {
      ...results,
      bodyFatPercentage: bodyFatValue ? `${bodyFatValue.toFixed(1)}%` : "",
      fatMass: fatMass ? `${fatMass.toFixed(1)} kg` : "",
      fatFreeMass: fatFreeMass ? `${fatFreeMass.toFixed(1)} kg` : "",
      bodyDensity: density ? density.toFixed(4) : "",
    };
  }, [
    basicData,
    circumferences,
    skinfolds,
    boneDiameters,
    patient,
    skinfoldFormula,
  ]);

  const createMutation = useMutation({
    mutationFn: async (dto: CreateMeasurementDto) => {
      if (isEditMode && measurementId) {
        return patientService.updateMeasurement(patientId!, measurementId, dto);
      } else if (createdMeasurementId) {
        return patientService.updateMeasurement(
          patientId!,
          createdMeasurementId,
          dto
        );
      } else {
        return patientService.createMeasurement(patientId!, dto);
      }
    },
    onSuccess: async (data) => {
      if (!isEditMode && !createdMeasurementId) {
        setCreatedMeasurementId(data.id);
      }
      await queryClient.refetchQueries({
        queryKey: ["measurements"],
        exact: false,
      });
      if ((isEditMode && measurementId) || createdMeasurementId) {
        await queryClient.refetchQueries({
          queryKey: [
            "measurement",
            patientId,
            createdMeasurementId || measurementId,
          ],
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["all-measurements"] });

      setSnackbar({
        open: true,
        message:
          isEditMode || createdMeasurementId
            ? "Avaliação atualizada com sucesso!"
            : "Avaliação criada com sucesso!",
        severity: "success",
      });
      isSaving.current = false; // Reset saving flag on success
    },
    onError: (error: Error) => {
      console.error("Erro ao salvar avaliação:", error);
      setSnackbar({
        open: true,
        message: `Erro ao salvar: ${
          error.message || "Ocorreu um erro desconhecido."
        }`,
        severity: "error",
      });
      isSaving.current = false;
    },
  });

  const handleAccordionChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      // _ para evento não usado
      setExpanded(isExpanded ? panel : false);
    };

  const handleBasicDataChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setBasicData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSkinfoldChange =
    (
      field: keyof LocalSkinfoldsState // Usar o tipo explícito
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSkinfolds((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleCircumferenceChange =
    (field: keyof typeof circumferences) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCircumferences((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleBoneDiameterChange =
    (field: keyof typeof boneDiameters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBoneDiameters((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSaveAssessment = () => {
    if (!patientId || isSaving.current) return;
    isSaving.current = true;

    const toNumber = (value: string): number | undefined => {
      if (!value || value.trim() === "") return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    // Preparar skinfolds
    const skinfoldData: Partial<SkinfoldsType> = {};
    (Object.keys(skinfolds) as Array<keyof LocalSkinfoldsState>).forEach(
      (key) => {
        const val = toNumber(skinfolds[key]);
        if (val !== undefined) skinfoldData[key] = val;
      }
    );

    // Preparar medidas
    const measurementsData: Partial<BodyMeasurements> = {};
    (Object.keys(circumferences) as Array<keyof typeof circumferences>).forEach(
      (key) => {
        const val = toNumber(circumferences[key]);
        if (val !== undefined) measurementsData[key] = val;
      }
    );

    // Preparar diâmetros ósseos
    const boneDiametersData: Partial<BoneDiameters> = {};
    (Object.keys(boneDiameters) as Array<keyof typeof boneDiameters>).forEach(
      (key) => {
        const val = toNumber(boneDiameters[key]);
        if (val !== undefined) boneDiametersData[key] = val;
      }
    );

    // Extrair o valor numérico do bodyFatPercentage
    const bodyFatValue = anthropometricResults.bodyFatPercentage
      ? parseFloat(
          anthropometricResults.bodyFatPercentage.replace(/[^\d.-]/g, "")
        )
      : undefined;

    const measurementData: CreateMeasurementDto = {
      date: (assessmentDate
        ? new Date(assessmentDate)
        : new Date()
      ).toISOString(),
      weight: toNumber(basicData.weight) || 0,
      skinfoldFormula: skinfoldFormula === "none" ? undefined : skinfoldFormula,
      height: toNumber(basicData.height),
      sittingHeight: toNumber(basicData.sittingHeight),
      kneeHeight: toNumber(basicData.kneeHeight),
      fatMass: anthropometricResults.fatMass
        ? parseFloat(anthropometricResults.fatMass.replace(/[^\d.-]/g, ""))
        : undefined,
      fatFreeMass: anthropometricResults.fatFreeMass
        ? parseFloat(anthropometricResults.fatFreeMass.replace(/[^\d.-]/g, ""))
        : undefined,
      bodyFat: bodyFatValue,
      muscleMass: anthropometricResults.muscleMass
        ? parseFloat(anthropometricResults.muscleMass.replace(/[^\d.-]/g, ""))
        : undefined,
      boneMass: anthropometricResults.boneMass
        ? parseFloat(anthropometricResults.boneMass.replace(/[^\d.-]/g, ""))
        : undefined,
      skinfolds: skinfoldData as SkinfoldsType,
      measurements: measurementsData as BodyMeasurements,
      boneDiameters: boneDiametersData as BoneDiameters,
      sharePhotos,
      patientId: patientId!,
    };

    createMutation.mutate(measurementData);
  };

  const handleCancel = () => {
    navigate(`/patient/${patientId}/assessments`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleNavigateBack = () => {
    navigate(`/patient/${patientId}/assessments`);
  };

  const handleSkinfoldFormulaChange = (value: string) => {
    setSkinfoldFormula(value);
  };

  const handlePhotosChange = (updatedPhotos: {
    front: AssessmentPhoto[];
    back: AssessmentPhoto[];
    left: AssessmentPhoto[];
    right: AssessmentPhoto[];
  }) => {
    setPhotos(updatedPhotos); // Atualiza o estado local de fotos
  };

  const getReferenceTooltip = (calculation: string): string => {
    const references: Record<string, string> = {
      bmi: "Índice de Massa Corporal (IMC) - Medida que relaciona peso e altura para avaliar o estado nutricional. Valores entre 18,5 e 24,9 kg/m² indicam peso adequado.\n\nReferência: Organização Mundial da Saúde (OMS). Estado físico: uso e interpretação da antropometria. Genebra: OMS, 1995.",
      waistHipRatio:
        "Relação Cintura/Quadril (RCQ) - Medida que avalia a distribuição de gordura corporal. Valores elevados indicam maior risco de doenças cardiovasculares.\n\nReferência: Organização Mundial da Saúde (OMS). Circunferência da cintura e relação cintura-quadril: relatório de uma consulta de especialistas da OMS. Genebra: OMS, 2008.",
      bodyDensity: `Densidade Corporal - Medida que avalia a composição corporal através da relação entre massa e volume. Valores mais altos indicam maior proporção de massa magra.\n\nReferência: ${
        bodyDensityFormulas.find((f) => f.id === skinfoldFormula)?.reference ||
        "Consulte a fórmula selecionada."
      }`,
      bodyFatPercentage:
        "Percentual de Gordura Corporal - Medida que avalia a proporção de gordura em relação ao peso total. Valores ideais variam conforme sexo e idade.\n\nReferência: Siri WE. Composição corporal a partir de espaços fluidos e densidade: análise de métodos. In: Brozek J, Henschel A, eds. Técnicas para medir a composição corporal. Washington, DC: National Academy of Sciences, 1961:223-244.",
      bodyFatClassification:
        "Classificação do Percentual de Gordura - Avaliação do estado nutricional baseada no percentual de gordura corporal. Classificações variam de 'Essencial' a 'Obesidade'.\n\nReferência: Diretrizes do American College of Sports Medicine (ACSM) para Teste de Esforço e Prescrição, 10ª Edição",
      boneMass:
        "Massa Óssea - Estimativa do peso dos ossos baseada em medidas antropométricas. Importante para avaliação de osteopenia e osteoporose.\n\nReferência: Martin AD, Spenst LF, Drinkwater DT, Clarys JP. Estimativa antropométrica da massa muscular em homens. Med Sci Sports Exerc. 1990;22(5):729-33.",
      muscleMass:
        "Massa Muscular - Medida que avalia a quantidade total de músculos do corpo. Importante para diagnóstico de sarcopenia e avaliação do estado nutricional.\n\nReferência: Matiegka J. O teste de eficiência física. Am J Phys Anthropol. 1921;4:223-230.",
      residualWeight:
        "Peso Residual - Componente do peso corporal que inclui órgãos, vísceras e outros tecidos não classificados como gordura, músculo ou osso.\n\nReferência: Matiegka J. O teste de eficiência física. Am J Phys Anthropol. 1921;4:223-230.",
    };
    return references[calculation] || "Referência não disponível";
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 2, md: 3 } }}>
      <AssessmentHeader
        patientName={patient?.name || ""}
        onNavigateBack={handleNavigateBack}
        isEditMode={isEditMode}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            flex: isMobile ? "1 1 auto" : "0 0 58.333%",
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          <AssessmentDate
            assessmentDate={assessmentDate}
            onAssessmentDateChange={setAssessmentDate}
          />
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              overflow: "auto",
              p: { xs: 1.5, sm: 2.5 },
              mb: 2,
            }}
          >
            <Stack spacing={2}>
              <BasicDataSection
                expanded={expanded === "basicData"}
                onAccordionChange={handleAccordionChange}
                basicData={basicData}
                onBasicDataChange={handleBasicDataChange}
              />
              <SkinfoldSection
                expanded={expanded === "skinfolds"}
                onAccordionChange={handleAccordionChange}
                skinfolds={skinfolds}
                skinfoldFormula={skinfoldFormula}
                onSkinfoldFormulaChange={handleSkinfoldFormulaChange}
                onSkinfoldChange={handleSkinfoldChange}
                patientGender={patient?.gender}
                patient={patient}
              />
              <CircumferenceSection
                expanded={expanded === "circumferences"}
                onAccordionChange={handleAccordionChange}
                circumferences={circumferences}
                onCircumferenceChange={handleCircumferenceChange}
              />
              <BoneDiameterSection
                expanded={expanded === "boneDiameters"}
                onAccordionChange={handleAccordionChange}
                boneDiameters={boneDiameters}
                onBoneDiameterChange={handleBoneDiameterChange}
              />
              <PhotosSection
                patientId={patientId!}
                measurementId={measurementId}
                sharePhotos={sharePhotos}
                onSharePhotosChange={setSharePhotos}
                onPhotosChange={handlePhotosChange}
                measurement={measurementToEdit}
                expanded={expanded === "photos"}
                onAccordionChange={handleAccordionChange}
              />
            </Stack>
          </Paper>
          <ActionButtons
            onSave={handleSaveAssessment}
            onCancel={handleCancel}
            isSaving={createMutation.isPending}
          />
        </Box>
        <Box sx={{ flex: isMobile ? "1 1 auto" : "0 0 41.667%", minWidth: 0 }}>
          <AnalyticalResults
            anthropometricResults={anthropometricResults}
            openGraphsModal={openGraphsModal}
            setOpenGraphsModal={setOpenGraphsModal}
            getReferenceTooltip={getReferenceTooltip}
          />
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
