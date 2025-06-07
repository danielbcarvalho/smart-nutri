import React, { useState } from "react";
import {
  Modal,
  Paper,
  Box,
  Typography,
  IconButton,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  Button,
  Fade,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

import { AiConfigurationForm } from "./AiConfigurationForm";
import { PatientDataSummary } from "./PatientDataSummary";
import { AiPlanReview } from "./AiPlanReview";
import { aiMealPlanService, AiMealPlanResponse } from "../services/aiMealPlanService";

export interface AiMealPlanModalProps {
  open: boolean;
  onClose: () => void;
  patientId?: string;
}

const steps = [
  "Dados do Paciente",
  "Configuração da IA",
  "Geração do Plano",
  "Revisão e Aprovação",
];

export const AiMealPlanModal: React.FC<AiMealPlanModalProps> = ({
  open,
  onClose,
  patientId,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AiMealPlanResponse | null>(null);
  const [aiConfiguration, setAiConfiguration] = useState({
    objective: "maintenance",
    restrictions: [] as string[],
    avoidedFoods: [] as any[],
    preferredFoods: [] as any[],
    mealsPerDay: 5,
    complexity: "simple",
    kitchenEquipment: ["fogao", "geladeira"],
    objectiveDetails: "",
    customRestrictions: "",
    budget: "",
    prepTime: "",
    exerciseRoutine: "",
    exerciseFrequency: "",
    exerciseIntensity: "",
    socialContext: "",
  });

  const handleNext = () => {
    if (activeStep === 2) {
      // Start AI generation
      handleGenerateAiPlan();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGenerateAiPlan = async () => {
    if (!patientId) {
      console.error("Patient ID is required for AI generation");
      return;
    }

    setIsGenerating(true);
    try {
      // Use real AI generation service
      const generationResult = await aiMealPlanService.generateMealPlan({
        patientId,
        configuration: aiConfiguration,
      });
      
      setGeneratedPlan(generationResult);
      setIsGenerating(false);
      setActiveStep(3);
    } catch (error) {
      console.error("Error generating AI plan:", error);
      // Show error message to user
      setIsGenerating(false);
      // TODO: Add error state/notification
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsGenerating(false);
    setGeneratedPlan(null);
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PatientDataSummary patientId={patientId} />;
      case 1:
        return (
          <AiConfigurationForm 
            patientId={patientId} 
            configuration={aiConfiguration}
            onConfigurationChange={setAiConfiguration}
          />
        );
      case 2:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              py: 4,
            }}
          >
            <AutoAwesomeIcon
              sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
            />
            <Typography variant="h6" textAlign="center">
              Gerando seu plano alimentar personalizado...
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nossa IA está analisando os dados do paciente e criando
              recomendações nutricionais personalizadas.
            </Typography>
            <LinearProgress
              sx={{ width: "100%", mt: 2 }}
              variant={isGenerating ? "indeterminate" : "determinate"}
              value={100}
            />
          </Box>
        );
      case 3:
        return <AiPlanReview generatedPlan={generatedPlan} />;
      default:
        return <div>Passo desconhecido</div>;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="ai-meal-plan-modal-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Fade in={open}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 900,
            maxHeight: "90vh",
            borderRadius: theme.shape.borderRadius * 2.5,
            boxShadow: theme.shadows[10],
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[50]
                  : theme.palette.grey[900],
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <img
                  src="/images/ai-animated.gif"
                  alt="IA SmartNutri"
                  style={{
                    width: 24,
                    height: 24,
                    objectFit: "contain",
                  }}
                />
              </Box>
              <div>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  id="ai-meal-plan-modal-title"
                >
                  SmartNutri AI - Plano Alimentar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Criação assistida por inteligência artificial
                </Typography>
              </div>
            </Box>
            <IconButton
              aria-label="Fechar modal"
              size="small"
              onClick={handleCloseModal}
              sx={{ color: theme.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Stepper */}
          <Box sx={{ px: 3, pt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflow: "auto",
              minHeight: 400,
            }}
          >
            {getStepContent(activeStep)}
          </Box>

          {/* Footer Actions */}
          <Box
            sx={{
              p: 3,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[50]
                  : theme.palette.grey[900],
            }}
          >
            <Button
              disabled={activeStep === 0 || isGenerating}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>

            <Box sx={{ flex: 1 }} />

            {activeStep === steps.length - 1 ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button onClick={handleReset} variant="outlined">
                  Gerar Novo Plano
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCloseModal}
                  sx={{
                    bgcolor: "success.main",
                    "&:hover": { bgcolor: "success.dark" },
                  }}
                >
                  Aprovar e Salvar
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isGenerating}
                endIcon={<ArrowForwardIcon />}
              >
                {activeStep === 2 ? "Gerar Plano" : "Próximo"}
              </Button>
            )}
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default AiMealPlanModal;