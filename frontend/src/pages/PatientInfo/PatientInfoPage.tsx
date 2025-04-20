import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AssessmentButton } from "../../components/AssessmentButton";
import { MealPlanButton } from "../../components/MealPlanButton";
import { PatientFormModal } from "../../components/PatientForm/PatientFormModal";
import { notify } from "../../utils/notificationBus";
import CircularProgress from "@mui/material/CircularProgress";

export function PatientInfo() {
  const { patientId } = useParams<{ patientId: string }>();

  const { data: patient, refetch } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Função utilitária para campos vazios
  const displayValue = (value?: string | null) =>
    value && value.trim() !== "" ? value : "Não informado";

  if (!patient) {
    return null;
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          boxShadow: 3,
          borderTop: `6px solid ${theme.palette.primary.main}`,
        }}
      >
        <CardContent>
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
                  bgcolor: !photoUrl ? "custom.lightest" : undefined,
                }}
              >
                {!photoUrl && <PersonIcon fontSize="large" />}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: "absolute",
                  bottom: -8,
                  right: -8,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  width: 40,
                  height: 40,
                  zIndex: 2,
                }}
                disabled={uploadingPhoto}
              >
                <PhotoCameraIcon fontSize="medium" />
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
                    bgcolor: "rgba(255,255,255,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    zIndex: 3,
                  }}
                >
                  <CircularProgress size={80} />
                </Box>
              )}
            </Box>
            <Typography variant="h5">{patient.name}</Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)}
              sx={{ position: "absolute", top: 10, right: 10 }}
            >
              Editar
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: isMobile ? "flex-start" : "space-between",
              gap: isMobile ? 2 : 3,
              rowGap: 3,
              columnGap: 3,
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 250, mb: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <CalendarIcon fontSize="small" /> Nascimento
              </Typography>
              <Typography variant="body1">
                {patient.birthDate
                  ? format(new Date(patient.birthDate), "dd/MM/yyyy")
                  : "Não informado"}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 250, mb: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <PhoneIcon fontSize="small" /> Telefone
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Typography variant="body1">
                  {displayValue(patient.phone)}
                </Typography>
                {patient.phone && (
                  <Tooltip title="WhatsApp">
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(`https://wa.me/55${patient.phone}`)
                      }
                      color="success"
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 250, mb: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <EmailIcon fontSize="small" /> Email
              </Typography>
              <Typography variant="body1">
                {displayValue(patient.email)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 250, mb: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <AssignmentIndIcon
                  fontSize="small"
                  sx={{ verticalAlign: "middle", mr: 0.5 }}
                />{" "}
                CPF
              </Typography>
              <Typography variant="body1">
                {displayValue(patient.cpf)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 250, mb: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <InstagramIcon
                  fontSize="small"
                  sx={{ verticalAlign: "middle", mr: 0.5 }}
                />{" "}
                Instagram
              </Typography>
              {patient.instagram && patient.instagram.trim() !== "" ? (
                <Typography
                  variant="body1"
                  component="a"
                  href={`https://instagram.com/${patient.instagram.replace(
                    /^@/,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "primary.main",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  {patient.instagram.startsWith("@")
                    ? patient.instagram
                    : `@${patient.instagram}`}
                </Typography>
              ) : (
                <Typography variant="body1">Não informado</Typography>
              )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 250, mb: isMobile ? 2 : 0 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <UpdateIcon fontSize="small" /> Atualizado em
              </Typography>
              <Typography variant="body1">
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

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <AssessmentButton patientId={patientId} variant="contained" />
            <MealPlanButton
              patientId={patientId}
              variant="contained"
              color="secondary"
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
    </Box>
  );
}
