import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Restaurant as RestaurantIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Science as ScienceIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Scale as ScaleIcon,
  Calculate as CalculateIcon,
  Description as DescriptionIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Lightbulb as LightbulbIcon,
  Attachment as AttachmentIcon,
  MedicalInformation as MedicalInformationIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Patient } from "../services/patientService";
import { PatientMeasurements } from "./PatientMeasurements";
import { MealPlan } from "./MealPlan";

interface PatientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
}

type MenuSection =
  | "profile"
  | "measurements"
  | "mealPlan"
  | "anamnesis"
  | "exams"
  | "photos"
  | "anthropometry"
  | "energetic"
  | "supplements"
  | "prescriptions"
  | "nutritional"
  | "attachments"
  | "medical"
  | "receipts";

const menuItems = [
  { id: "profile", text: "Perfil do Paciente", icon: <EditIcon /> },
  { id: "measurements", text: "Avaliações", icon: <AssessmentIcon /> },
  { id: "mealPlan", text: "Plano Alimentar", icon: <RestaurantIcon /> },
  { id: "anamnesis", text: "Anamnese", icon: <QuestionAnswerIcon /> },
  { id: "exams", text: "Exames", icon: <ScienceIcon /> },
  { id: "photos", text: "Fotos", icon: <PhotoLibraryIcon /> },
  { id: "anthropometry", text: "Antropometria", icon: <ScaleIcon /> },
  { id: "energetic", text: "Cálculo Energético", icon: <CalculateIcon /> },
  { id: "supplements", text: "Suplementos", icon: <LocalPharmacyIcon /> },
  { id: "prescriptions", text: "Prescrições", icon: <DescriptionIcon /> },
  { id: "nutritional", text: "Orientações", icon: <LightbulbIcon /> },
  { id: "attachments", text: "Anexos", icon: <AttachmentIcon /> },
  { id: "medical", text: "Prontuário", icon: <MedicalInformationIcon /> },
  { id: "receipts", text: "Recibos", icon: <ReceiptIcon /> },
];

const scrollbarStyle = {
  "&::-webkit-scrollbar": {
    width: "4px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(0,0,0,0.1)",
    borderRadius: "2px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "rgba(0,0,0,0.2)",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0,0,0,0.1) transparent",
};

export function PatientDetailsModal({
  open,
  onClose,
  patient,
}: PatientDetailsModalProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>("profile");

  const renderContent = () => {
    switch (activeSection) {
      case "measurements":
        return <PatientMeasurements patient={patient} />;
      case "mealPlan":
        return <MealPlan />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Em desenvolvimento
            </Typography>
            <Typography color="text.secondary">
              Esta seção estará disponível em breve.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: "flex", overflow: "hidden" }}>
        {/* Menu Lateral */}
        <Box
          sx={{
            width: 280,
            borderRight: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "auto",
            ...scrollbarStyle,
          }}
        >
          {/* Cabeçalho do Paciente */}
          <Box
            sx={{
              p: 3,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "primary.dark",
                  fontSize: "2rem",
                }}
              >
                {patient.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{patient.name}</Typography>
                <Typography variant="body2">
                  {format(new Date(patient.birthDate), "dd/MM/yyyy")} (
                  {new Date().getFullYear() -
                    new Date(patient.birthDate).getFullYear()}{" "}
                  anos)
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Menu de Seções */}
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeSection === item.id}
                onClick={() => setActiveSection(item.id as MenuSection)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    "&:hover": {
                      bgcolor: "primary.light",
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Conteúdo Principal */}
        <Box sx={{ flex: 1, overflow: "auto", ...scrollbarStyle }}>
          {/* Barra Superior */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "background.paper",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <Typography variant="h6">
              {menuItems.find((item) => item.id === activeSection)?.text}
            </Typography>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conteúdo da Seção */}
          {renderContent()}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
