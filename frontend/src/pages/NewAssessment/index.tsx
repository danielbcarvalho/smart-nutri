import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Snackbar, Alert } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";
import {
  CreateMeasurementDto,
  Skinfolds,
  BodyMeasurements,
  BoneDiameters,
} from "../../services/patientService";

import { AssessmentPhoto } from "../../services/photoService";

// Componentes
import { PhotosSection } from "./components/PhotosSection";
import { BasicDataSection } from "./components/BasicDataSection";
import { SkinfoldSection } from "./components/SkinfoldSection";
import { CircumferenceSection } from "./components/CircumferenceSection";
import { BoneDiameterSection } from "./components/BoneDiameterSection";
import { BioimpedanceSection } from "./components/BioimpedanceSection";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { ActionButtons } from "./components/ActionButtons";

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

      // Marcar como preenchido
      hasFilledDataRef.current = true;

      // Verificar se deve compartilhar fotos
      if ("sharePhotos" in measurementToEdit) {
        setSharePhotos(!!measurementToEdit.sharePhotos);
      }
    }
  }, [isEditMode, measurementToEdit]);

  // Mutação para criar/editar avaliação
  const createMutation = useMutation({
    mutationFn: async (dto: CreateMeasurementDto) => {
      if (isEditMode && measurementId) {
        return patientService.updateMeasurement(patientId!, measurementId, dto);
      } else {
        return patientService.createMeasurement(patientId!, dto);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["measurements", patientId] });
      setSnackbar({
        open: true,
        message: isEditMode
          ? "Avaliação atualizada com sucesso!"
          : "Avaliação criada com sucesso!",
        severity: "success",
      });

      // Navegar para visualização após criação
      setTimeout(() => {
        navigate(`/patients/${patientId}/measurements/${data.id}`);
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

  const handleBioimpedanceChange =
    (field: keyof typeof bioimpedance) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBioimpedance((prev) => ({
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
    if (circumferences.relaxedArm)
      measurementsData.relaxedArm = toNumber(circumferences.relaxedArm);
    if (circumferences.contractedArm)
      measurementsData.contractedArm = toNumber(circumferences.contractedArm);
    if (circumferences.forearm)
      measurementsData.forearm = toNumber(circumferences.forearm);
    if (circumferences.proximalThigh)
      measurementsData.proximalThigh = toNumber(circumferences.proximalThigh);
    if (circumferences.medialThigh)
      measurementsData.medialThigh = toNumber(circumferences.medialThigh);
    if (circumferences.distalThigh)
      measurementsData.distalThigh = toNumber(circumferences.distalThigh);
    if (circumferences.calf)
      measurementsData.calf = toNumber(circumferences.calf);

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
      bodyFat: toNumber(bioimpedance.fatPercentage),
      fatMass: toNumber(bioimpedance.fatMass),
      muscleMassPercentage: toNumber(bioimpedance.muscleMassPercentage),
      muscleMass: toNumber(bioimpedance.muscleMass),
      fatFreeMass: toNumber(bioimpedance.fatFreeMass),
      boneMass: toNumber(bioimpedance.boneMass),
      visceralFat: toNumber(bioimpedance.visceralFat),
      bodyWater: toNumber(bioimpedance.bodyWater),
      metabolicAge: toNumber(bioimpedance.metabolicAge),

      // Objetos complexos
      skinfolds: skinfoldData,
      measurements: measurementsData,
      boneDiameters: boneDiametersData,

      // Adicionar sharePhotos ao objeto
      sharePhotos,
      patientId: patientId!,
    };

    // Executar mutação
    createMutation.mutate(measurementData);
  };

  const handleCancel = () => {
    navigate(`/patients/${patientId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleNavigateBack = () => {
    navigate(`/patients/${patientId}`);
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

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Cabeçalho */}
      <AssessmentHeader
        patientName={patient?.name || ""}
        assessmentDate={assessmentDate}
        onAssessmentDateChange={setAssessmentDate}
        onNavigateBack={handleNavigateBack}
        isEditMode={isEditMode}
      />

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

      {/* Seção de bioimpedância */}
      <BioimpedanceSection
        expanded={expanded === "bioimpedance"}
        onAccordionChange={handleAccordionChange}
        bioimpedance={bioimpedance}
        onBioimpedanceChange={handleBioimpedanceChange}
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

      {/* Botões de ação */}
      <ActionButtons
        onSave={handleSaveAssessment}
        onCancel={handleCancel}
        isSaving={isSaving.current}
      />

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
