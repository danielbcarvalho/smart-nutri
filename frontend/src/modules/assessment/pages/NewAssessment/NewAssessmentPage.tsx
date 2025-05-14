import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patientService,
  CreateMeasurementDto,
  Skinfolds,
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
  const [skinfolds, setSkinfolds] = useState({
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
    front: AssessmentPhoto | null;
    back: AssessmentPhoto | null;
    left: AssessmentPhoto | null;
    right: AssessmentPhoto | null;
  }>({
    front: null,
    back: null,
    left: null,
    right: null,
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
    staleTime: 0, // Sempre considerar os dados obsoletos e buscar novamente
    refetchOnMount: true, // Sempre refetching ao montar o componente
    refetchOnWindowFocus: true, // Refetch quando a janela receber foco
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
    staleTime: 0, // Sempre buscar dados atualizados
    gcTime: 0, // Não manter em cache após uso
    refetchOnMount: "always", // Sempre refetching ao montar
    refetchOnWindowFocus: true, // Refetch quando a janela receber foco
  });

  // Este useEffect preenche os dados quando estamos editando
  useEffect(() => {
    if (isEditMode && measurementToEdit && !hasFilledDataRef.current) {
      // Converter para string para os inputs
      const toString = (value: number | string | null | undefined): string =>
        value !== null && value !== undefined ? String(value) : "";

      // Preencher data
      if (measurementToEdit.date) {
        const date = new Date(measurementToEdit.date);
        const localDate = new Date(
          date.getTime() + date.getTimezoneOffset() * 60000
        );
        setAssessmentDate(localDate);
      }

      // Preencher dados básicos
      setBasicData({
        weight: toString(measurementToEdit.weight),
        height: toString(measurementToEdit.height),
        sittingHeight: toString(measurementToEdit.sittingHeight),
        kneeHeight: toString(measurementToEdit.kneeHeight),
      });

      // Preencher fórmula de dobras cutâneas
      if (measurementToEdit.skinfoldFormula) {
        setSkinfoldFormula(measurementToEdit.skinfoldFormula);
      }

      // Preencher dobras cutâneas
      if (measurementToEdit.skinfolds) {
        setSkinfolds({
          tricipital: toString(measurementToEdit.skinfolds.tricipital),
          bicipital: toString(measurementToEdit.skinfolds.bicipital),
          abdominal: toString(measurementToEdit.skinfolds.abdominal),
          subscapular: toString(measurementToEdit.skinfolds.subscapular),
          axillaryMedian: toString(measurementToEdit.skinfolds.axillaryMedian),
          thigh: toString(measurementToEdit.skinfolds.thigh),
          thoracic: toString(measurementToEdit.skinfolds.thoracic),
          suprailiac: toString(measurementToEdit.skinfolds.suprailiac),
          calf: toString(measurementToEdit.skinfolds.calf),
          supraspinal: toString(measurementToEdit.skinfolds.supraspinal),
        });
      }

      // Preencher circunferências
      if (measurementToEdit.measurements) {
        setCircumferences({
          neck: toString(measurementToEdit.measurements.neck),
          shoulder: toString(measurementToEdit.measurements.shoulder),
          chest: toString(measurementToEdit.measurements.chest),
          waist: toString(measurementToEdit.measurements.waist),
          abdomen: toString(measurementToEdit.measurements.abdomen),
          hip: toString(measurementToEdit.measurements.hip),
          relaxedArmLeft: toString(
            measurementToEdit.measurements.relaxedArmLeft
          ),
          relaxedArmRight: toString(
            measurementToEdit.measurements.relaxedArmRight
          ),
          contractedArmLeft: toString(
            measurementToEdit.measurements.contractedArmLeft
          ),
          contractedArmRight: toString(
            measurementToEdit.measurements.contractedArmRight
          ),
          forearmLeft: toString(measurementToEdit.measurements.forearmLeft),
          forearmRight: toString(measurementToEdit.measurements.forearmRight),
          proximalThighLeft: toString(
            measurementToEdit.measurements.proximalThighLeft
          ),
          proximalThighRight: toString(
            measurementToEdit.measurements.proximalThighRight
          ),
          medialThighLeft: toString(
            measurementToEdit.measurements.medialThighLeft
          ),
          medialThighRight: toString(
            measurementToEdit.measurements.medialThighRight
          ),
          distalThighLeft: toString(
            measurementToEdit.measurements.distalThighLeft
          ),
          distalThighRight: toString(
            measurementToEdit.measurements.distalThighRight
          ),
          calfLeft: toString(measurementToEdit.measurements.calfLeft),
          calfRight: toString(measurementToEdit.measurements.calfRight),
        });
      }

      // Preencher diâmetros ósseos
      if (measurementToEdit.boneDiameters) {
        setBoneDiameters({
          humerus: toString(measurementToEdit.boneDiameters.humerus),
          wrist: toString(measurementToEdit.boneDiameters.wrist),
          femur: toString(measurementToEdit.boneDiameters.femur),
        });
      }

      // Marcar como preenchido
      hasFilledDataRef.current = true;

      // Verificar se deve compartilhar fotos
      if ("sharePhotos" in measurementToEdit) {
        setSharePhotos(!!measurementToEdit.sharePhotos);
      }
    }
  }, [isEditMode, measurementToEdit]);

  // Calculate anthropometric results at component level
  const anthropometricResults = useMemo(() => {
    let calculationGender: "M" | "F" = "M";
    if (patient?.gender === "F" || String(patient?.gender) === "FEMALE") {
      calculationGender = "F";
    }
    const calculationAge = patient?.birthDate
      ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
      : 30;

    console.log("Dados para cálculo:", {
      gender: calculationGender,
      age: calculationAge,
      weight: parseFloat(basicData.weight),
      height: parseFloat(basicData.height),
      skinfolds,
      circumferences,
      boneDiameters,
      skinfoldFormula,
    });

    const results = calculateAnthropometricResults({
      gender: calculationGender,
      age: calculationAge,
      weight: parseFloat(basicData.weight),
      height: parseFloat(basicData.height),
      skinfolds: {
        tricipital: parseFloat(skinfolds.tricipital),
        bicipital: parseFloat(skinfolds.bicipital),
        abdominal: parseFloat(skinfolds.abdominal),
        subscapular: parseFloat(skinfolds.subscapular),
        axillaryMedian: parseFloat(skinfolds.axillaryMedian),
        thigh: parseFloat(skinfolds.thigh),
        thoracic: parseFloat(skinfolds.thoracic),
        suprailiac: parseFloat(skinfolds.suprailiac),
        calf: parseFloat(skinfolds.calf),
        supraspinal: parseFloat(skinfolds.supraspinal),
      },
      circumferences: {
        neck: parseFloat(circumferences.neck),
        waist: parseFloat(circumferences.waist),
        abdomen: parseFloat(circumferences.abdomen),
        hip: parseFloat(circumferences.hip),
        relaxedArm: parseFloat(
          circumferences.relaxedArmLeft + circumferences.relaxedArmRight
        ),
        contractedArm: parseFloat(
          circumferences.contractedArmLeft + circumferences.contractedArmRight
        ),
        forearm: parseFloat(
          circumferences.forearmLeft + circumferences.forearmRight
        ),
        proximalThigh: parseFloat(
          circumferences.proximalThighLeft + circumferences.proximalThighRight
        ),
        medialThigh: parseFloat(
          circumferences.medialThighLeft + circumferences.medialThighRight
        ),
        distalThigh: parseFloat(
          circumferences.distalThighLeft + circumferences.distalThighRight
        ),
        calf: parseFloat(circumferences.calfLeft + circumferences.calfRight),
      },
      boneDiameters: {
        humerus: parseFloat(boneDiameters.humerus),
        wrist: parseFloat(boneDiameters.wrist),
        femur: parseFloat(boneDiameters.femur),
      },
      skinfoldFormula,
    });

    console.log("Resultados calculados:", results);
    return results;
  }, [
    basicData,
    circumferences,
    skinfolds,
    boneDiameters,
    patient,
    skinfoldFormula,
  ]);

  // Mutação para criar/editar avaliação
  const createMutation = useMutation({
    mutationFn: async (dto: CreateMeasurementDto) => {
      if (isEditMode && measurementId) {
        return patientService.updateMeasurement(patientId!, measurementId, dto);
      } else {
        return patientService.createMeasurement(patientId!, dto);
      }
    },
    onSuccess: async () => {
      // Forçar recarregamento de todas as queries relacionadas a measurements
      // Usando refetchQueries em vez de invalidateQueries para garantir atualização imediata
      await queryClient.refetchQueries({
        queryKey: ["measurements"],
        exact: false,
      });

      // Também recarregar a query específica do measurement
      if (isEditMode && measurementId) {
        await queryClient.refetchQueries({
          queryKey: ["measurement", patientId, measurementId],
        });
      }

      // Invalidar todas as outras consultas relacionadas
      await queryClient.invalidateQueries({
        queryKey: ["all-measurements"],
      });

      setSnackbar({
        open: true,
        message: isEditMode
          ? "Avaliação atualizada com sucesso!"
          : "Avaliação criada com sucesso!",
        severity: "success",
      });

      // Navegar para a listagem de avaliações após criação/edição
      setTimeout(() => {
        navigate(`/patient/${patientId}/assessments`);
      }, 1500);
    },
    onError: (error) => {
      console.error("Erro ao salvar avaliação:", error);
      setSnackbar({
        open: true,
        message: `Erro ao salvar: ${error}`,
        severity: "error",
      });
      isSaving.current = false;
    },
  });

  // Handlers para mudanças nos diversos campos
  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleBasicDataChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setBasicData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSkinfoldChange =
    (field: keyof typeof skinfolds) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSkinfolds((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleCircumferenceChange =
    (field: keyof typeof circumferences) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCircumferences((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleBoneDiameterChange =
    (field: keyof typeof boneDiameters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBoneDiameters((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSaveAssessment = () => {
    if (!patientId || isSaving.current) return;

    isSaving.current = true;

    // Converter dados de string para número
    const toNumber = (value: string): number | undefined => {
      if (!value || value.trim() === "") return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };

    // Preparar skinfolds
    const skinfoldData: Skinfolds = {};
    if (skinfolds.tricipital)
      skinfoldData.tricipital = toNumber(skinfolds.tricipital);
    if (skinfolds.bicipital)
      skinfoldData.bicipital = toNumber(skinfolds.bicipital);
    if (skinfolds.abdominal)
      skinfoldData.abdominal = toNumber(skinfolds.abdominal);
    if (skinfolds.subscapular)
      skinfoldData.subscapular = toNumber(skinfolds.subscapular);
    if (skinfolds.axillaryMedian)
      skinfoldData.axillaryMedian = toNumber(skinfolds.axillaryMedian);
    if (skinfolds.thigh) skinfoldData.thigh = toNumber(skinfolds.thigh);
    if (skinfolds.thoracic)
      skinfoldData.thoracic = toNumber(skinfolds.thoracic);
    if (skinfolds.suprailiac)
      skinfoldData.suprailiac = toNumber(skinfolds.suprailiac);
    if (skinfolds.calf) skinfoldData.calf = toNumber(skinfolds.calf);
    if (skinfolds.supraspinal)
      skinfoldData.supraspinal = toNumber(skinfolds.supraspinal);

    // Preparar medidas
    const measurementsData: BodyMeasurements = {};
    if (circumferences.neck)
      measurementsData.neck = toNumber(circumferences.neck);
    if (circumferences.shoulder)
      measurementsData.shoulder = toNumber(circumferences.shoulder);
    if (circumferences.chest)
      measurementsData.chest = toNumber(circumferences.chest);
    if (circumferences.waist)
      measurementsData.waist = toNumber(circumferences.waist);
    if (circumferences.abdomen)
      measurementsData.abdomen = toNumber(circumferences.abdomen);
    if (circumferences.hip) measurementsData.hip = toNumber(circumferences.hip);
    if (circumferences.relaxedArmLeft)
      measurementsData.relaxedArmLeft = toNumber(circumferences.relaxedArmLeft);
    if (circumferences.relaxedArmRight)
      measurementsData.relaxedArmRight = toNumber(
        circumferences.relaxedArmRight
      );
    if (circumferences.contractedArmLeft)
      measurementsData.contractedArmLeft = toNumber(
        circumferences.contractedArmLeft
      );
    if (circumferences.contractedArmRight)
      measurementsData.contractedArmRight = toNumber(
        circumferences.contractedArmRight
      );
    if (circumferences.forearmLeft)
      measurementsData.forearmLeft = toNumber(circumferences.forearmLeft);
    if (circumferences.forearmRight)
      measurementsData.forearmRight = toNumber(circumferences.forearmRight);
    if (circumferences.proximalThighLeft)
      measurementsData.proximalThighLeft = toNumber(
        circumferences.proximalThighLeft
      );
    if (circumferences.proximalThighRight)
      measurementsData.proximalThighRight = toNumber(
        circumferences.proximalThighRight
      );
    if (circumferences.medialThighLeft)
      measurementsData.medialThighLeft = toNumber(
        circumferences.medialThighLeft
      );
    if (circumferences.medialThighRight)
      measurementsData.medialThighRight = toNumber(
        circumferences.medialThighRight
      );
    if (circumferences.distalThighLeft)
      measurementsData.distalThighLeft = toNumber(
        circumferences.distalThighLeft
      );
    if (circumferences.distalThighRight)
      measurementsData.distalThighRight = toNumber(
        circumferences.distalThighRight
      );
    if (circumferences.calfLeft)
      measurementsData.calfLeft = toNumber(circumferences.calfLeft);
    if (circumferences.calfRight)
      measurementsData.calfRight = toNumber(circumferences.calfRight);

    // Preparar diâmetros ósseos
    const boneDiametersData: BoneDiameters = {};
    if (boneDiameters.humerus)
      boneDiametersData.humerus = toNumber(boneDiameters.humerus);
    if (boneDiameters.wrist)
      boneDiametersData.wrist = toNumber(boneDiameters.wrist);
    if (boneDiameters.femur)
      boneDiametersData.femur = toNumber(boneDiameters.femur);

    // Montar objeto para envio
    const measurementData: CreateMeasurementDto = {
      date: (assessmentDate
        ? new Date(assessmentDate)
        : new Date()
      ).toISOString(),
      weight: toNumber(basicData.weight) || 0,

      // Campos opcionais
      skinfoldFormula,
      height: toNumber(basicData.height),
      sittingHeight: toNumber(basicData.sittingHeight),
      kneeHeight: toNumber(basicData.kneeHeight),

      // Campos calculados
      fatMass: anthropometricResults.fatMass
        ? parseFloat(anthropometricResults.fatMass.replace(" kg", ""))
        : undefined,
      fatFreeMass: anthropometricResults.fatFreeMass
        ? parseFloat(anthropometricResults.fatFreeMass.replace(" kg", ""))
        : undefined,
      bodyFat: anthropometricResults.bodyFatPercentage
        ? parseFloat(anthropometricResults.bodyFatPercentage.replace("%", ""))
        : undefined,
      muscleMass: anthropometricResults.muscleMass
        ? parseFloat(anthropometricResults.muscleMass.replace(" kg", ""))
        : undefined,
      boneMass: anthropometricResults.boneMass
        ? parseFloat(anthropometricResults.boneMass.replace(" kg", ""))
        : undefined,

      // Objetos complexos
      skinfolds: skinfoldData,
      measurements: measurementsData,
      boneDiameters: boneDiametersData,

      // Adicionar sharePhotos ao objeto
      sharePhotos,
      patientId: patientId!,
    };

    console.log("Dados a serem salvos:", {
      fatMass: measurementData.fatMass,
      fatFreeMass: measurementData.fatFreeMass,
      bodyFat: measurementData.bodyFat,
      muscleMass: measurementData.muscleMass,
      boneMass: measurementData.boneMass,
    });

    // Executar mutação
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
    front: AssessmentPhoto | null;
    back: AssessmentPhoto | null;
    left: AssessmentPhoto | null;
    right: AssessmentPhoto | null;
  }) => {
    setPhotos(updatedPhotos);
  };

  // Função auxiliar para formatar as referências bibliográficas
  const getReferenceTooltip = (calculation: string): string => {
    const references: Record<string, string> = {
      bmi: "Índice de Massa Corporal (IMC) - Medida que relaciona peso e altura para avaliar o estado nutricional. Valores entre 18,5 e 24,9 kg/m² indicam peso adequado.\n\nReferência: Organização Mundial da Saúde (OMS). Estado físico: uso e interpretação da antropometria. Genebra: OMS, 1995.",
      waistHipRatio:
        "Relação Cintura/Quadril (RCQ) - Medida que avalia a distribuição de gordura corporal. Valores elevados indicam maior risco de doenças cardiovasculares.\n\nReferência: Organização Mundial da Saúde (OMS). Circunferência da cintura e relação cintura-quadril: relatório de uma consulta de especialistas da OMS. Genebra: OMS, 2008.",
      bodyDensity:
        "Densidade Corporal - Medida que avalia a composição corporal através da relação entre massa e volume. Valores mais altos indicam maior proporção de massa magra.\n\nReferência: Pollock ML, Schmidt DH, Jackson AS. Medição da aptidão cardiorrespiratória e composição corporal no ambiente clínico. Compr Ther. 1980;6(9):12-27.",
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

  // Este trecho substitui o return atual
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Cabeçalho fora do card */}
      <AssessmentHeader
        patientName={patient?.name || ""}
        onNavigateBack={handleNavigateBack}
        isEditMode={isEditMode}
      />

      {/* Layout flexível que se adapta para mobile */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 3,
        }}
      >
        {/* Coluna da esquerda - Formulários */}
        <Box sx={{ flex: isMobile ? "1 1 auto" : "0 0 58.333%" }}>
          {/* Data da avaliação como um card separado */}

          <AssessmentDate
            assessmentDate={assessmentDate}
            onAssessmentDateChange={setAssessmentDate}
          />
          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Seção de dados básicos */}
            <BasicDataSection
              expanded={expanded === "basicData"}
              onAccordionChange={handleAccordionChange}
              basicData={basicData}
              onBasicDataChange={handleBasicDataChange}
            />

            {/* Seção de dobras cutâneas */}
            <SkinfoldSection
              expanded={expanded === "skinfolds"}
              onAccordionChange={handleAccordionChange}
              skinfolds={skinfolds}
              skinfoldFormula={skinfoldFormula}
              onSkinfoldFormulaChange={handleSkinfoldFormulaChange}
              onSkinfoldChange={handleSkinfoldChange}
              patientGender={patient?.gender}
            />

            {/* Seção de circunferências */}
            <CircumferenceSection
              expanded={expanded === "circumferences"}
              onAccordionChange={handleAccordionChange}
              circumferences={circumferences}
              onCircumferenceChange={handleCircumferenceChange}
            />

            {/* Seção de diâmetros ósseos */}
            <BoneDiameterSection
              expanded={expanded === "boneDiameters"}
              onAccordionChange={handleAccordionChange}
              boneDiameters={boneDiameters}
              onBoneDiameterChange={handleBoneDiameterChange}
            />

            {/* Seção de fotos */}
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
          </Paper>

          <ActionButtons
            onSave={handleSaveAssessment}
            onCancel={handleCancel}
            isSaving={isSaving.current}
          />
        </Box>

        {/* Coluna da direita - Resultados */}
        <Box sx={{ flex: isMobile ? "1 1 auto" : "0 0 41.667%" }}>
          <AnalyticalResults
            anthropometricResults={anthropometricResults}
            openGraphsModal={openGraphsModal}
            setOpenGraphsModal={setOpenGraphsModal}
            getReferenceTooltip={getReferenceTooltip}
          />
        </Box>
      </Box>

      {/* Snackbar de feedback */}
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
