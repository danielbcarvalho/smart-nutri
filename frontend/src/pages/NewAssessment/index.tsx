import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Switch,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  Modal,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";
import { CreateMeasurementDto } from "../../services/patientService";
import { calculateAnthropometricResults } from "./utils/anthropometricCalculations";

export function NewAssessment() {
  const { patientId, measurementId } = useParams<{
    patientId: string;
    measurementId: string;
  }>();
  const navigate = useNavigate();
  const [sharePhotos, setSharePhotos] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState<Date | null>(new Date());
  const [openGraphsModal, setOpenGraphsModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const queryClient = useQueryClient();
  const isEditMode = !!measurementId;

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
    relaxedArm: "",
    contractedArm: "",
    forearm: "",
    proximalThigh: "",
    medialThigh: "",
    distalThigh: "",
    calf: "",
  });

  // Estado para diâmetro ósseo
  const [boneDiameters, setBoneDiameters] = useState({
    humerus: "",
    wrist: "",
    femur: "",
  });

  // Estado para bioimpedância
  const [bioimpedance, setBioimpedance] = useState({
    fatPercentage: "",
    fatMass: "",
    muscleMassPercentage: "",
    muscleMass: "",
    fatFreeMass: "",
    boneMass: "",
    visceralFat: "",
    bodyWater: "",
    metabolicAge: "",
  });

  // Criar ref para controlar se já preenchemos dados
  const hasFilledDataRef = useRef(false);

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
  });

  // Este useEffect preenche os dados quando estamos editando
  useEffect(() => {
    if (isEditMode && measurementToEdit && !hasFilledDataRef.current) {
      // Converter para string para os inputs
      const toString = (value: number | string | null | undefined): string =>
        value !== null && value !== undefined ? String(value) : "";

      // Preencher data
      if (measurementToEdit.date) {
        setAssessmentDate(new Date(measurementToEdit.date));
      }

      // Preencher dados básicos
      setBasicData({
        weight: toString(measurementToEdit.weight),
        height: toString(measurementToEdit.height),
        sittingHeight: toString(measurementToEdit.sittingHeight),
        kneeHeight: toString(measurementToEdit.kneeHeight),
      });

      // Preencher dados de bioimpedância
      setBioimpedance({
        fatPercentage: toString(measurementToEdit.bodyFat),
        fatMass: toString(measurementToEdit.fatMass),
        muscleMassPercentage: toString(measurementToEdit.muscleMassPercentage),
        muscleMass: toString(measurementToEdit.muscleMass),
        fatFreeMass: toString(measurementToEdit.fatFreeMass),
        boneMass: toString(measurementToEdit.boneMass),
        visceralFat: toString(measurementToEdit.visceralFat),
        bodyWater: toString(measurementToEdit.bodyWater),
        metabolicAge: toString(measurementToEdit.metabolicAge),
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
          relaxedArm: toString(measurementToEdit.measurements.relaxedArm),
          contractedArm: toString(measurementToEdit.measurements.contractedArm),
          forearm: toString(measurementToEdit.measurements.forearm),
          proximalThigh: toString(measurementToEdit.measurements.proximalThigh),
          medialThigh: toString(measurementToEdit.measurements.medialThigh),
          distalThigh: toString(measurementToEdit.measurements.distalThigh),
          calf: toString(measurementToEdit.measurements.calf),
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

      hasFilledDataRef.current = true;
    }
  }, [isEditMode, measurementToEdit]);

  // Este useEffect preenche a altura inicial da última avaliação (apenas em novo modo)
  useEffect(() => {
    // Este efeito só deve rodar uma vez quando o componente montar
    // e os dados do paciente e medições estiverem disponíveis
    // e não estamos no modo de edição
    if (
      !isEditMode &&
      !hasFilledDataRef.current &&
      previousMeasurements &&
      previousMeasurements.length > 0
    ) {
      try {
        console.log("Todas as medições:", previousMeasurements);

        // Função para converter seguramente qualquer formato de data para timestamp
        const getTimestamp = (
          dateValue: Date | string | null | undefined
        ): number => {
          if (!dateValue) return 0;

          try {
            // Tentar converter para data se for string ou outro formato
            const date = new Date(dateValue);
            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
              console.warn(`Data inválida: ${dateValue}`);
              return 0;
            }
            return date.getTime();
          } catch (e) {
            console.warn(`Erro ao converter data: ${dateValue}`, e);
            return 0;
          }
        };

        // Encontrar a medição mais recente manualmente
        let mostRecentMeasurement = previousMeasurements[0];
        let mostRecentTimestamp = getTimestamp(mostRecentMeasurement.date);

        // Log detalhado para cada medição
        previousMeasurements.forEach((measurement, index) => {
          const timestamp = getTimestamp(measurement.date);

          console.log(`Medição ${index}:`, {
            id: measurement.id,
            date: measurement.date,
            dateOriginal: String(measurement.date),
            timestamp,
            formattedDate: new Date(timestamp).toISOString(),
            height: measurement.height,
          });

          // Verificar se esta medição é mais recente
          if (timestamp > mostRecentTimestamp) {
            console.log(
              `Nova medição mais recente encontrada: ${
                measurement.id
              } com data ${String(measurement.date)}`
            );
            mostRecentMeasurement = measurement;
            mostRecentTimestamp = timestamp;
          }
        });

        console.log("Medição mais recente identificada:", {
          id: mostRecentMeasurement.id,
          date: mostRecentMeasurement.date,
          formattedDate: new Date(mostRecentTimestamp).toISOString(),
          height: mostRecentMeasurement.height,
        });

        // Verificar se a medição mais recente tem altura
        if (mostRecentMeasurement && mostRecentMeasurement.height) {
          // Atualiza apenas a altura
          const heightValue = mostRecentMeasurement.height
            ? Math.floor(Number(mostRecentMeasurement.height)).toString()
            : "";

          console.log(
            "Preenchendo altura com:",
            heightValue,
            "da medição:",
            mostRecentMeasurement.id
          );

          setBasicData((prev) => ({
            ...prev,
            height: heightValue,
          }));

          // Marca a ref para indicar que já preenchemos os dados
          hasFilledDataRef.current = true;
        }
      } catch (error) {
        console.error("Erro ao preencher altura do paciente:", error);
      }
    }
  }, [previousMeasurements, isEditMode]);

  // Mutation para criar ou atualizar avaliação
  const createMeasurementMutation = useMutation({
    mutationFn: (data: CreateMeasurementDto) => {
      if (isEditMode) {
        return patientService.updateMeasurement(
          patientId!,
          measurementId!,
          data
        );
      } else {
        return patientService.createMeasurement(patientId!, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["measurements", patientId] });
      setSnackbar({
        open: true,
        message: isEditMode
          ? "Avaliação antropométrica atualizada com sucesso!"
          : "Avaliação antropométrica salva com sucesso!",
        severity: "success",
      });
      navigate(`/patient/${patientId}/assessments`);
    },
    onError: (error) => {
      console.error("Erro ao salvar avaliação", error);
      setSnackbar({
        open: true,
        message: isEditMode
          ? "Erro ao atualizar avaliação antropométrica"
          : "Erro ao salvar avaliação antropométrica",
        severity: "error",
      });
    },
  });

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleBasicDataChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setBasicData({
        ...basicData,
        [field]: event.target.value,
      });
    };

  const handleSkinfoldChange =
    (field: keyof typeof skinfolds) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setSkinfolds((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const handleCircumferenceChange =
    (field: keyof typeof circumferences) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setCircumferences((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const handleBoneDiameterChange =
    (field: keyof typeof boneDiameters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setBoneDiameters((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const handleBioimpedanceChange =
    (field: keyof typeof bioimpedance) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setBioimpedance((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const handleSaveAssessment = () => {
    if (!patientId || !assessmentDate) {
      setSnackbar({
        open: true,
        message: "Data da avaliação e ID do paciente são obrigatórios",
        severity: "error",
      });
      return;
    }

    if (!basicData.weight) {
      setSnackbar({
        open: true,
        message: "O peso é obrigatório",
        severity: "error",
      });
      return;
    }

    const parseNumericValue = (value: string) => {
      return value ? parseFloat(value) : undefined;
    };

    // Preparar os dados para enviar ao servidor
    const measurementData = {
      date: format(assessmentDate, "yyyy-MM-dd"),
      weight: parseFloat(basicData.weight),
      height: parseNumericValue(basicData.height),
      sittingHeight: parseNumericValue(basicData.sittingHeight),
      kneeHeight: parseNumericValue(basicData.kneeHeight),
      bodyFat: parseNumericValue(bioimpedance.fatPercentage),
      fatMass: parseNumericValue(bioimpedance.fatMass),
      muscleMassPercentage: parseNumericValue(
        bioimpedance.muscleMassPercentage
      ),
      muscleMass: parseNumericValue(bioimpedance.muscleMass),
      fatFreeMass: parseNumericValue(bioimpedance.fatFreeMass),
      boneMass: parseNumericValue(bioimpedance.boneMass),
      bodyWater: parseNumericValue(bioimpedance.bodyWater),
      visceralFat: parseNumericValue(bioimpedance.visceralFat),
      metabolicAge: bioimpedance.metabolicAge
        ? parseInt(bioimpedance.metabolicAge)
        : undefined,
      skinfoldFormula: skinfoldFormula !== "none" ? skinfoldFormula : undefined,
      measurements:
        Object.keys(circumferences).length > 0
          ? {
              ...(circumferences.chest
                ? { chest: parseFloat(circumferences.chest) }
                : {}),
              ...(circumferences.waist
                ? { waist: parseFloat(circumferences.waist) }
                : {}),
              ...(circumferences.hip
                ? { hip: parseFloat(circumferences.hip) }
                : {}),
              ...(circumferences.relaxedArm
                ? { relaxedArm: parseFloat(circumferences.relaxedArm) }
                : {}),
              ...(circumferences.contractedArm
                ? { contractedArm: parseFloat(circumferences.contractedArm) }
                : {}),
              ...(circumferences.forearm
                ? { forearm: parseFloat(circumferences.forearm) }
                : {}),
              ...(circumferences.neck
                ? { neck: parseFloat(circumferences.neck) }
                : {}),
              ...(circumferences.shoulder
                ? { shoulder: parseFloat(circumferences.shoulder) }
                : {}),
              ...(circumferences.abdomen
                ? { abdomen: parseFloat(circumferences.abdomen) }
                : {}),
              ...(circumferences.proximalThigh
                ? { proximalThigh: parseFloat(circumferences.proximalThigh) }
                : {}),
              ...(circumferences.medialThigh
                ? { medialThigh: parseFloat(circumferences.medialThigh) }
                : {}),
              ...(circumferences.distalThigh
                ? { distalThigh: parseFloat(circumferences.distalThigh) }
                : {}),
              ...(circumferences.calf
                ? { calf: parseFloat(circumferences.calf) }
                : {}),
            }
          : Object.entries(circumferences).reduce((acc, [key, value]) => {
              if (value) {
                acc[key] = parseFloat(value);
              }
              return acc;
            }, {} as Record<string, number>),
      skinfolds:
        Object.keys(skinfolds).length > 0
          ? {
              ...(skinfolds.tricipital
                ? { tricipital: parseFloat(skinfolds.tricipital) }
                : {}),
              ...(skinfolds.bicipital
                ? { bicipital: parseFloat(skinfolds.bicipital) }
                : {}),
              ...(skinfolds.abdominal
                ? { abdominal: parseFloat(skinfolds.abdominal) }
                : {}),
              ...(skinfolds.subscapular
                ? { subscapular: parseFloat(skinfolds.subscapular) }
                : {}),
              ...(skinfolds.axillaryMedian
                ? { axillaryMedian: parseFloat(skinfolds.axillaryMedian) }
                : {}),
              ...(skinfolds.thigh
                ? { thigh: parseFloat(skinfolds.thigh) }
                : {}),
              ...(skinfolds.thoracic
                ? { thoracic: parseFloat(skinfolds.thoracic) }
                : {}),
              ...(skinfolds.suprailiac
                ? { suprailiac: parseFloat(skinfolds.suprailiac) }
                : {}),
              ...(skinfolds.calf ? { calf: parseFloat(skinfolds.calf) } : {}),
              ...(skinfolds.supraspinal
                ? { supraspinal: parseFloat(skinfolds.supraspinal) }
                : {}),
            }
          : undefined,
      boneDiameters:
        Object.keys(boneDiameters).length > 0
          ? {
              ...(boneDiameters.humerus
                ? { humerus: parseFloat(boneDiameters.humerus) }
                : {}),
              ...(boneDiameters.wrist
                ? { wrist: parseFloat(boneDiameters.wrist) }
                : {}),
              ...(boneDiameters.femur
                ? { femur: parseFloat(boneDiameters.femur) }
                : {}),
            }
          : undefined,
      patientId,
    };

    console.log("Enviando dados para o servidor:", measurementData);
    createMeasurementMutation.mutate(measurementData);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calcular resultados antropométricos
  const anthropometricResults = useMemo(() => {
    // Determinar o gênero para os cálculos (M ou F)
    let calculationGender: "M" | "F" = "M";
    if (patient?.gender === "F" || String(patient?.gender) === "FEMALE") {
      calculationGender = "F";
    }

    // Determinar a idade do paciente
    const calculationAge = patient?.birthDate
      ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
      : 30;

    // Calcular e atualizar os resultados
    return calculateAnthropometricResults(
      basicData,
      circumferences,
      skinfolds,
      boneDiameters,
      bioimpedance,
      calculationGender,
      calculationAge,
      skinfoldFormula
    );
  }, [
    basicData,
    circumferences,
    skinfolds,
    boneDiameters,
    bioimpedance,
    patient,
    skinfoldFormula,
  ]);

  if (!patient) return null;

  // Cálculo da idade do paciente para exibição
  const age = patient.birthDate
    ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
    : null;

  // Função auxiliar para formatar as referências bibliográficas
  const getReferenceTooltip = (calculation: string): string => {
    const references: Record<string, string> = {
      bmi: "Índice de Massa Corporal (IMC) - Medida que relaciona peso e altura para avaliar o estado nutricional. Valores entre 18,5 e 24,9 kg/m² indicam peso adequado.\n\nReferência: Organização Mundial da Saúde (OMS). Estado físico: uso e interpretação da antropometria. Genebra: OMS, 1995.",
      waistHipRatio:
        "Relação Cintura/Quadril (RCQ) - Medida que avalia a distribuição de gordura corporal. Valores elevados indicam maior risco de doenças cardiovasculares.\n\nReferência: Organização Mundial da Saúde (OMS). Circunferência da cintura e relação cintura-quadril: relatório de uma consulta de especialistas da OMS. Genebra: OMS, 2008.",
      cmb: "Circunferência Muscular do Braço (CMB) - Medida que avalia a massa muscular do braço, importante para diagnóstico de desnutrição e sarcopenia.\n\nReferência: Frisancho AR. Novas normas de áreas de gordura e músculo dos membros superiores para avaliação do estado nutricional. Am J Clin Nutr. 1981;34(11):2540-5.",
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

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
          {isEditMode
            ? "Editar Avaliação Antropométrica"
            : "Nova Avaliação Antropométrica"}
        </Typography>

        {patient && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Paciente: {patient.name}
            {age && `, Idade: ${age} anos`}
          </Typography>
        )}

        {/* Campo de Data */}
        <Box sx={{ mb: 3 }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DatePicker
              label="Data da Avaliação"
              value={assessmentDate}
              onChange={(newValue) => setAssessmentDate(newValue)}
              format="dd/MM/yyyy"
              sx={{ width: "100%" }}
            />
          </LocalizationProvider>
        </Box>

        {/* Botões de ação 
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<TimelineIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            ver evolução
          </Button>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            ver anamnese
          </Button>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            avaliações anteriores
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            editar data
          </Button>
        </Box>*/}
      </Paper>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Coluna da esquerda - Formulários */}
        <Box sx={{ flex: "0 0 58.333%" }}>
          {/* Dados antropométricos básicos */}
          <Accordion
            expanded={expanded === "basicData"}
            onChange={handleAccordionChange("basicData")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Dados antropométricos básicos
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Peso (Kg)"
                    value={basicData.weight}
                    onChange={handleBasicDataChange("weight")}
                    required
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Altura (cm)"
                    value={basicData.height}
                    onChange={handleBasicDataChange("height")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Altura sentado (cm)"
                    value={basicData.sittingHeight}
                    onChange={handleBasicDataChange("sittingHeight")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Altura do joelho (cm)"
                    value={basicData.kneeHeight}
                    onChange={handleBasicDataChange("kneeHeight")}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Dobras cutâneas */}
          <Accordion
            expanded={expanded === "skinfolds"}
            onChange={handleAccordionChange("skinfolds")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Dobras cutâneas (mm)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ bgcolor: "grey.100", p: 2, mb: 3, borderRadius: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Escolha a fórmula para cálculo:
                </Typography>
                <ToggleButtonGroup
                  value={skinfoldFormula}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setSkinfoldFormula(newValue);
                    }
                  }}
                  size="small"
                  sx={{ flexWrap: "wrap", gap: 1 }}
                >
                  <ToggleButton
                    value="pollock3"
                    sx={{
                      "&.Mui-selected": {
                        color: "error.main",
                        borderColor: "error.main",
                        "&:hover": {
                          bgcolor: "error.lighter",
                        },
                      },
                    }}
                  >
                    Pollock 3
                  </ToggleButton>
                  <ToggleButton value="pollock7">Pollock 7</ToggleButton>
                  <ToggleButton value="petroski">Petroski</ToggleButton>
                  <ToggleButton value="guedes">Guedes</ToggleButton>
                  <ToggleButton value="durnin">Durnin</ToggleButton>
                  <ToggleButton value="faulkner">Faulkner</ToggleButton>
                  <ToggleButton value="none">Nenhuma</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Tricipital (mm)"
                    value={skinfolds.tricipital}
                    onChange={handleSkinfoldChange("tricipital")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Bicipital (mm)"
                    value={skinfolds.bicipital}
                    onChange={handleSkinfoldChange("bicipital")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Abdominal (mm)"
                    value={skinfolds.abdominal}
                    onChange={handleSkinfoldChange("abdominal")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Subescapular (mm)"
                    value={skinfolds.subscapular}
                    onChange={handleSkinfoldChange("subscapular")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Axilar Média (mm)"
                    value={skinfolds.axillaryMedian}
                    onChange={handleSkinfoldChange("axillaryMedian")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Coxa (mm)"
                    value={skinfolds.thigh}
                    onChange={handleSkinfoldChange("thigh")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Torácica (mm)"
                    value={skinfolds.thoracic}
                    onChange={handleSkinfoldChange("thoracic")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Suprailíaca (mm)"
                    value={skinfolds.suprailiac}
                    onChange={handleSkinfoldChange("suprailiac")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Panturrilha (mm)"
                    value={skinfolds.calf}
                    onChange={handleSkinfoldChange("calf")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Supraespinhal (mm)"
                    value={skinfolds.supraspinal}
                    onChange={handleSkinfoldChange("supraspinal")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Circunferências corporais */}
          <Accordion
            expanded={expanded === "circumferences"}
            onChange={handleAccordionChange("circumferences")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Circunferências corporais (cm)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Importantes para calcular RCQ, CMB e entre outros.
              </Typography>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pescoço"
                    value={circumferences.neck}
                    onChange={handleCircumferenceChange("neck")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tórax"
                    value={circumferences.chest}
                    onChange={handleCircumferenceChange("chest")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ombro"
                    value={circumferences.shoulder}
                    onChange={handleCircumferenceChange("shoulder")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cintura"
                    value={circumferences.waist}
                    onChange={handleCircumferenceChange("waist")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quadril"
                    value={circumferences.hip}
                    onChange={handleCircumferenceChange("hip")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Abdômen"
                    value={circumferences.abdomen}
                    onChange={handleCircumferenceChange("abdomen")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Braço relaxado"
                    value={circumferences.relaxedArm}
                    onChange={handleCircumferenceChange("relaxedArm")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Braço contraído"
                    value={circumferences.contractedArm}
                    onChange={handleCircumferenceChange("contractedArm")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Antebraço"
                    value={circumferences.forearm}
                    onChange={handleCircumferenceChange("forearm")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coxa proximal"
                    value={circumferences.proximalThigh}
                    onChange={handleCircumferenceChange("proximalThigh")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coxa medial"
                    value={circumferences.medialThigh}
                    onChange={handleCircumferenceChange("medialThigh")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coxa distal"
                    value={circumferences.distalThigh}
                    onChange={handleCircumferenceChange("distalThigh")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Panturrilha"
                    value={circumferences.calf}
                    onChange={handleCircumferenceChange("calf")}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Diâmetro ósseo */}
          <Accordion
            expanded={expanded === "boneDiameter"}
            onChange={handleAccordionChange("boneDiameter")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Diâmetro ósseo (cm)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Importantes para calcular peso ósseo e massa muscular.
              </Typography>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diâmetro do úmero"
                    value={boneDiameters.humerus}
                    onChange={handleBoneDiameterChange("humerus")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diâmetro do punho"
                    value={boneDiameters.wrist}
                    onChange={handleBoneDiameterChange("wrist")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diâmetro do fêmur"
                    value={boneDiameters.femur}
                    onChange={handleBoneDiameterChange("femur")}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Balança de bioimpedância */}
          <Accordion
            expanded={expanded === "bioimpedance"}
            onChange={handleAccordionChange("bioimpedance")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Balança de bioimpedância</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Insira os dados da sua balança diretamente aqui.
              </Typography>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="% de Gordura"
                    value={bioimpedance.fatPercentage}
                    onChange={handleBioimpedanceChange("fatPercentage")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Massa Gorda"
                    value={bioimpedance.fatMass}
                    onChange={handleBioimpedanceChange("fatMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="% de Massa Muscular"
                    value={bioimpedance.muscleMassPercentage}
                    onChange={handleBioimpedanceChange("muscleMassPercentage")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Massa Muscular"
                    value={bioimpedance.muscleMass}
                    onChange={handleBioimpedanceChange("muscleMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Massa Livre de Gordura"
                    value={bioimpedance.fatFreeMass}
                    onChange={handleBioimpedanceChange("fatFreeMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Peso Ósseo"
                    value={bioimpedance.boneMass}
                    onChange={handleBioimpedanceChange("boneMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gordura Visceral"
                    value={bioimpedance.visceralFat}
                    onChange={handleBioimpedanceChange("visceralFat")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Água Corporal"
                    value={bioimpedance.bodyWater}
                    onChange={handleBioimpedanceChange("bodyWater")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Idade Metabólica"
                    value={bioimpedance.metabolicAge}
                    onChange={handleBioimpedanceChange("metabolicAge")}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Evolução fotográfica */}
          <Accordion
            expanded={expanded === "photos"}
            onChange={handleAccordionChange("photos")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Evolução fotográfica</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fotos técnicas do seu paciente, para avaliar a evolução
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2, mb: 2 }}
                onClick={() => {}}
              >
                Ver evolução fotográfica
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={sharePhotos}
                  onChange={(e) => setSharePhotos(e.target.checked)}
                />
                <Typography variant="body2">
                  Liberar fotos no app do paciente?
                </Typography>
                <Tooltip title="Necessário informar o PIN SEGURO">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Botão Salvar */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              size="large"
              onClick={handleSaveAssessment}
              disabled={createMeasurementMutation.isPending}
            >
              {createMeasurementMutation.isPending
                ? "Salvando..."
                : isEditMode
                ? "Atualizar Avaliação"
                : "Salvar Avaliação"}
            </Button>
          </Box>
        </Box>

        {/* Coluna da direita - Resultados */}
        <Box sx={{ flex: "0 0 41.667%" }}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h5">Resultados analíticos</Typography>
                <Tooltip title="Informações sobre os cálculos">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
              <Button variant="text" onClick={() => setOpenGraphsModal(true)}>
                Ver gráficos
              </Button>
            </Box>

            {/* Análises de pesos e medidas */}
            <Typography variant="h6" gutterBottom>
              Análises de pesos e medidas
            </Typography>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Peso atual</Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.currentWeight}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Altura atual
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.currentHeight}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Índice de Massa Corporal
                  </Typography>
                  <Tooltip title={getReferenceTooltip("bmi")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.bmi}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Classificação do IMC
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bmiClassification}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Faixa de peso ideal
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.idealWeightRange}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Relação da Cintura/Quadril (RCQ)
                  </Typography>
                  <Tooltip title={getReferenceTooltip("waistHipRatio")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.waistHipRatio}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Risco Metabólico por RCQ
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.waistHipRiskClassification}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>CMB (cm)</Typography>
                  <Tooltip title={getReferenceTooltip("cmb")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.cmb}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Classificação CMB
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.cmbClassification}
                </Typography>
              </Box>
            </Box>

            {/* Análises por dobras e diâmetro ósseo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                mt: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">
                  Análises por dobras e diâmetro ósseo
                </Typography>
                <Tooltip title="Informações sobre os cálculos">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Percentual de Gordura
                  </Typography>
                  <Tooltip title={getReferenceTooltip("bodyFatPercentage")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.bodyFatPercentage}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Percentual Ideal
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.idealFatPercentage}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Classif. do % GC
                  </Typography>
                  <Tooltip title={getReferenceTooltip("bodyFatClassification")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.bodyFatClassification}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Peso de gordura
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.fatMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Peso ósseo
                  </Typography>
                  <Tooltip title={getReferenceTooltip("boneMass")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.boneMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Massa Muscular
                  </Typography>
                  <Tooltip title={getReferenceTooltip("muscleMass")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.muscleMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Peso residual
                  </Typography>
                  <Tooltip title={getReferenceTooltip("residualWeight")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.residualWeight}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Massa Livre de Gordura
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.fatFreeMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Somatório de Dobras
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.skinfoldsSum}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Densidade Corporal
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bodyDensity}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Referência usada
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.referenceUsed}
                </Typography>
              </Box>
            </Box>

            {/* Análises por bioimpedância */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                mt: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">Análises por bioimpedância</Typography>
                <Tooltip title="Informações sobre os cálculos">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Percentual de Gordura
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceBodyFatPercentage}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Percentual Ideal
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceIdealFatPercentage}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Classif. do % GC
                  </Typography>
                  <Tooltip title={getReferenceTooltip("bodyFatClassification")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceBodyFatClassification}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Percentual de Massa Muscular
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceMuscleMassPercentage}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Massa Muscular
                  </Typography>
                  <Tooltip title={getReferenceTooltip("muscleMass")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceMuscleMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Água Corporal Total
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceBodyWater}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Peso Ósseo
                  </Typography>
                  <Tooltip title={getReferenceTooltip("boneMass")}>
                    <HelpIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceBoneMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Massa de gordura
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceFatMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Massa Livre de Gordura
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceFatFreeMass}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Índice de Gordura Visceral
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceVisceralFat}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Idade Metabólica
                </Typography>
                <Typography color="text.secondary">
                  {anthropometricResults.bioimpedanceMetabolicAge}
                </Typography>
              </Box>
            </Box>

            {/* Modal de Gráficos */}
            <Modal
              open={openGraphsModal}
              onClose={() => setOpenGraphsModal(false)}
              aria-labelledby="modal-graphs"
              aria-describedby="modal-graphs-description"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 800,
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Gráficos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Em breve você poderá visualizar os gráficos aqui.
                </Typography>
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button onClick={() => setOpenGraphsModal(false)}>
                    Fechar
                  </Button>
                </Box>
              </Box>
            </Modal>
          </Paper>
        </Box>
      </Box>

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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
