import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
} from "@mui/material";
import {
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
  Note as NoteIcon,
  LocalHospital as LocalHospitalIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
import { PatientActionsMenu } from "@/modules/patient/components/PatientActionsMenu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DesignSystemButton } from "@/components/DesignSystem/Button/ButtonVariants";

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
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const actionsMenuOpen = Boolean(actionsAnchorEl);

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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: "text.primary",
          }}
        >
          Informações do Paciente
        </Typography>
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <DesignSystemButton
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Editar
            </DesignSystemButton>
            <DesignSystemButton
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Excluir
            </DesignSystemButton>
          </Box>
        )}
      </Box>

      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          borderRadius: "12px",
          borderColor: "divider",
          transition: "all 0.2s",
          borderRight: `4px solid ${theme.palette.custom.accent}`,
          "&:hover": {
            boxShadow: 4,
            borderColor: "primary.main",
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          {/* Topo: Avatar, nome, menu de ações */}
          <Box sx={{ textAlign: "center", position: "relative", mb: 3 }}>
            <Box
              sx={{
                position: "relative",
                width: 100,
                height: 100,
                margin: "0 auto",
                mb: 1.5,
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
                  bgcolor: !photoUrl ? theme.palette.grey[200] : undefined,
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
                  bottom: 0,
                  right: 0,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                  width: 32,
                  height: 32,
                  zIndex: 2,
                  p: 0,
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
                disabled={uploadingPhoto}
              >
                <PhotoCameraIcon fontSize="small" />
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography
                variant="h5"
                fontWeight="medium"
                gutterBottom
                sx={{ mb: 0 }}
              >
                {patient.name}
              </Typography>
              {isMobile && (
                <IconButton
                  onClick={(e) => setActionsAnchorEl(e.currentTarget)}
                  sx={{ ml: 0.5 }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              )}
            </Box>
            <PatientActionsMenu
              anchorEl={actionsAnchorEl}
              open={actionsMenuOpen}
              onClose={() => setActionsAnchorEl(null)}
              patient={patient}
              navigate={navigate}
            />
          </Box>

          {/* Informações principais em destaque */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              mb: 2,
              p: 1.5,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            {/* Nascimento */}
            <Box sx={{ minWidth: "150px" }}>
              <Typography
                variant="caption"
                fontWeight={500}
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                NASCIMENTO
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary.main"
                sx={{ mt: 0.5, fontSize: 22 }}
              >
                {patient.birthDate
                  ? format(new Date(patient.birthDate), "dd/MM/yyyy")
                  : "Não informado"}
              </Typography>
            </Box>

            {/* Gênero */}
            <Box sx={{ minWidth: "150px" }}>
              <Typography
                variant="caption"
                fontWeight={500}
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                GÊNERO
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary.main"
                sx={{ mt: 0.5, fontSize: 22 }}
              >
                {patient.gender === "M"
                  ? "Masculino"
                  : patient.gender === "F"
                  ? "Feminino"
                  : "Outro"}
              </Typography>
            </Box>

            {/* Telefone */}
            <Box sx={{ minWidth: "150px" }}>
              <Typography
                variant="caption"
                fontWeight={500}
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                TELEFONE
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="primary.main"
                  sx={{ mt: 0.5, fontSize: 22 }}
                >
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

            {/* Data de Criação */}
            <Box sx={{ minWidth: "150px" }}>
              <Typography
                variant="caption"
                fontWeight={500}
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                CADASTRADO EM
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color="primary.main"
                sx={{ mt: 0.5, fontSize: 22 }}
              >
                {patient.createdAt
                  ? format(new Date(patient.createdAt), "dd/MM/yyyy")
                  : "Não informado"}
              </Typography>
            </Box>
          </Box>

          {/* Resto das informações */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 2,
              mt: 2,
            }}
          >
            {/* Email */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="primary.main"
              >
                Email
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                {patient.email && patient.email.trim() !== ""
                  ? patient.email
                  : "Não informado"}
              </Typography>
            </Box>

            {/* CPF */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "rgba(42,139,139,0.1)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="primary.main"
              >
                CPF
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                {patient.cpf && patient.cpf.trim() !== ""
                  ? patient.cpf
                  : "Não informado"}
              </Typography>
            </Box>

            {/* Instagram */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="primary.main"
              >
                Instagram
              </Typography>
              {patient.instagram && patient.instagram.trim() !== "" ? (
                <Typography
                  variant="body2"
                  fontWeight={500}
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
                    mt: 0.5,
                  }}
                >
                  {patient.instagram.startsWith("@")
                    ? patient.instagram
                    : `@${patient.instagram}`}
                </Typography>
              ) : (
                <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                  Não informado
                </Typography>
              )}
            </Box>

            {/* Atualizado em */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "rgba(42,139,139,0.1)",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="primary.main"
              >
                Atualizado em
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
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

          {/* Informações Complementares em Accordion */}
          <Box sx={{ mt: 3 }}>
            <Accordion sx={{ boxShadow: "none", borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="medium">
                  Informações Complementares
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}
                >
                  {/* Endereço */}
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <LocationIcon fontSize="small" /> Endereço
                    </Typography>
                    {displayValue(patient.address)}
                  </Box>
                  {/* Observações */}
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <NoteIcon fontSize="small" /> Observações do Paciente
                    </Typography>
                    {displayValue(patient.observations)}
                  </Box>
                  {/* Alergias */}
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <WarningIcon fontSize="small" /> Alergias
                    </Typography>
                    {renderChips(patient.allergies)}
                  </Box>
                  {/* Condições de Saúde */}
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <LocalHospitalIcon fontSize="small" /> Condições de Saúde
                    </Typography>
                    {renderChips(patient.healthConditions)}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Botões de ação principais */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              justifyContent: "center",
              mt: 3,
            }}
          >
            <AssessmentButton
              patientId={patientId}
              variant="contained"
              size="large"
              fullWidth={isMobile}
            />
            <MealPlanButton
              patientId={patientId}
              variant="contained"
              color="secondary"
              size="large"
              fullWidth={isMobile}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Modais e diálogos existentes */}
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
          <DesignSystemButton
            variant="text"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </DesignSystemButton>
          <DesignSystemButton
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </DesignSystemButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
