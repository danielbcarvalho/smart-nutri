import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  Instagram as InstagramIcon,
  AssignmentInd as AssignmentIndIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Note as NoteIcon,
  LocalHospital as LocalHospitalIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import CircularProgress from "@mui/material/CircularProgress";
import { patientService } from "@/modules/patient/services/patientService";
import { notify } from "@utils/notificationBus";
import { PatientFormModal } from "@components/PatientForm/PatientFormModal";
import { MealPlanButton } from "@/modules/meal-plan/components/MealPlanButton";
import { AssessmentButton } from "@components/AssessmentButton";

export function PatientInfo() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: patient, refetch } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    patient?.photoUrl
  );

  React.useEffect(() => {
    setPhotoUrl(patient?.photoUrl);
  }, [patient?.photoUrl]);

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !patient?.id) return;
    setUploadingPhoto(true);
    try {
      const updatedPatient = await patientService.uploadProfilePhoto(
        patient.id,
        file
      );
      setPhotoUrl(updatedPatient.photoUrl);
      notify("Foto atualizada com sucesso!", "success");
      refetch();
    } catch {
      notify("Erro ao atualizar foto.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async () => {
    if (!patient?.id) return;
    setIsDeleting(true);
    try {
      await patientService.delete(patient.id);
      notify("Paciente excluído com sucesso!", "success");
      navigate("/patients");
    } catch {
      notify("Erro ao excluir paciente.", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Updated displayValue to return a Typography component
  const displayValue = (value?: string | null) => {
    if (value && value.trim() !== "") {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ wordBreak: "break-word", flexGrow: 1 }}
        >
          {value}
        </Typography>
      );
    }
    return (
      <Typography variant="body2" color="text.disabled" sx={{ flexGrow: 1 }}>
        Não informado
      </Typography>
    );
  };

  // Updated renderChips
  const renderChips = (items?: string[]) => {
    if (!items || items.length === 0) {
      return (
        <Typography variant="body2" color="text.disabled" sx={{ flexGrow: 1 }}>
          Não informado
        </Typography>
      );
    }
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, flexGrow: 1 }}>
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            size="small"
            // Using default chip appearance or a specific light color for contrast
            // sx={{ bgcolor: theme.palette.action.hover }}
          />
        ))}
      </Box>
    );
  };

  if (!patient) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        {" "}
        {/* Adjust height based on your header */}
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {" "}
      {/* Reduced outer padding slightly */}
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // Softer shadow
          borderTop: `4px solid ${theme.palette.primary.main}`, // Slightly thinner border
          borderRadius: theme.shape.borderRadius * 2, // More rounded corners for the card
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ textAlign: "center", position: "relative", mb: 3 }}>
            <Box
              sx={{
                position: "relative",
                width: 100,
                height: 100,
                margin: "0 auto",
                mb: 2,
              }}
            >
              <Avatar
                src={
                  photoUrl
                    ? `${photoUrl}?t=${
                        patient.updatedAt
                          ? new Date(patient.updatedAt).getTime()
                          : Date.now()
                      }`
                    : undefined
                }
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: !photoUrl ? theme.palette.grey[200] : undefined, // Lighter default avatar bg
                }}
              >
                {!photoUrl && (
                  <PersonIcon
                    sx={{ fontSize: 60, color: theme.palette.grey[500] }}
                  />
                )}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: "absolute",
                  bottom: -8,
                  right: -8,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  width: 36, // Slightly smaller
                  height: 36,
                  zIndex: 2,
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
                disabled={uploadingPhoto}
              >
                <PhotoCameraIcon fontSize="small" /> {/* Adjusted icon size */}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                />
              </IconButton>
              {uploadingPhoto && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    zIndex: 3,
                  }}
                >
                  <CircularProgress size={70} />
                </Box>
              )}
            </Box>
            <Typography variant="h5" fontWeight="medium" gutterBottom>
              {patient.name}
            </Typography>
            <Box
              sx={{
                position: "absolute",
                top: isMobile ? -5 : 0,
                right: isMobile ? 0 : 0,
                display: "flex",
                gap: 1,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-end" : "center",
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Excluir
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: theme.spacing(2.5),
              alignItems: "flex-start",
              mb: 3, // Added margin bottom before next section
            }}
          >
            {/* Nascimento */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                <CalendarIcon sx={{ fontSize: "1rem" }} /> Nascimento
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {patient.birthDate
                  ? format(new Date(patient.birthDate), "dd/MM/yyyy")
                  : "Não informado"}
              </Typography>
            </Box>

            {/* Telefone */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                <PhoneIcon sx={{ fontSize: "1rem" }} /> Telefone
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Typography variant="body1" fontWeight="medium">
                  {patient.phone && patient.phone.trim() !== ""
                    ? patient.phone
                    : "Não informado"}
                </Typography>
                {patient.phone && patient.phone.trim() !== "" && (
                  <Tooltip title="WhatsApp">
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(
                          `https://wa.me/55${patient.phone?.replace(/\D/g, "")}`
                        )
                      }
                      color="success"
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {/* Email */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                <EmailIcon sx={{ fontSize: "1rem" }} /> Email
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {patient.email && patient.email.trim() !== ""
                  ? patient.email
                  : "Não informado"}
              </Typography>
            </Box>

            {/* CPF */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                <AssignmentIndIcon sx={{ fontSize: "1rem" }} /> CPF
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {patient.cpf && patient.cpf.trim() !== ""
                  ? patient.cpf
                  : "Não informado"}
              </Typography>
            </Box>

            {/* Instagram */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                <InstagramIcon sx={{ fontSize: "1rem" }} /> Instagram
              </Typography>
              {patient.instagram && patient.instagram.trim() !== "" ? (
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  component="a"
                  href={`https://instagram.com/${patient.instagram.replace(
                    /^@/,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                    cursor: "pointer",
                    wordBreak: "break-all",
                  }}
                >
                  {patient.instagram.startsWith("@")
                    ? patient.instagram
                    : `@${patient.instagram}`}
                </Typography>
              ) : (
                <Typography variant="body1" fontWeight="medium">
                  Não informado
                </Typography>
              )}
            </Box>

            {/* Atualizado em */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                <UpdateIcon sx={{ fontSize: "1rem" }} /> Atualizado em
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {patient.updatedAt
                  ? format(
                      new Date(patient.updatedAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )
                  : "Não informado"}
              </Typography>
            </Box>
          </Box>

          {/* Informações Complementares Section - REFINED */}
          <Box>
            <Typography
              variant="h6"
              fontWeight="medium"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Informações Complementares
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              {[
                {
                  icon: <LocationIcon fontSize="small" />,
                  title: "Endereço",
                  value: patient.address,
                  type: "text",
                },
                {
                  icon: <NoteIcon fontSize="small" />,
                  title: "Observações do Paciente",
                  value: patient.observations,
                  type: "text",
                },
                {
                  icon: <WarningIcon fontSize="small" />,
                  title: "Alergias",
                  value: patient.allergies,
                  type: "chips",
                },
                {
                  icon: <LocalHospitalIcon fontSize="small" />,
                  title: "Condições de Saúde",
                  value: patient.healthConditions,
                  type: "chips",
                },
              ].map((item, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: theme.shape.borderRadius, // Consistent border radius
                    display: "flex",
                    flexDirection: "column",
                    height: "100%", // Ensure papers stretch to fill grid cell height
                  }}
                >
                  <Typography
                    variant="body1" // Using body1 for title inside paper
                    fontWeight="medium" // Making it bold
                    color="text.primary" // Darker color for title
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    {item.icon}
                    {item.title}
                  </Typography>
                  {item.type === "text"
                    ? displayValue(item.value as string | undefined)
                    : renderChips(item.value as string[] | undefined)}
                </Paper>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <AssessmentButton
              patientId={patientId}
              variant="contained"
              size="large"
            />
            <MealPlanButton
              patientId={patientId}
              variant="contained"
              color="secondary" // Or primary if you want it teal like the other
              size="large"
            />
          </Box>
        </CardContent>
      </Card>
      <PatientFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetch();
          notify("Dados do paciente atualizados com sucesso!", "success");
        }}
        patient={patient}
      />
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o paciente {patient.name}? Esta ação
            não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
