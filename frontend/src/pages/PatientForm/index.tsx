import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  IconButton,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService, Patient } from "../../services/patientService";

// Função para validar o nome (apenas letras e espaços)
const validateName = (name: string) => {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(name);
};

export function PatientForm() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(patientId);

  const [formData, setFormData] = useState<
    Omit<Patient, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    gender: "OTHER",
    instagram: "",
    status: "active",
    monitoringStatus: "in_progress",
    consultationFrequency: "monthly",
    photoUrl: "",
  });

  const [errors, setErrors] = useState({
    name: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        email: patient.email || "",
        phone: patient.phone || "",
        cpf: patient.cpf || "",
        birthDate: patient.birthDate || "",
        gender: patient.gender,
        instagram: patient.instagram || "",
        status: patient.status,
        monitoringStatus: patient.monitoringStatus,
        consultationFrequency: patient.consultationFrequency,
        customConsultationDays: patient.customConsultationDays,
        lastConsultationAt: patient.lastConsultationAt,
        nextConsultationAt: patient.nextConsultationAt,
        photoUrl: patient.photoUrl || "",
      });
      if (patient.photoUrl) {
        setPhotoPreview(patient.photoUrl);
      }
    }
  }, [patient]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<Patient, "id" | "createdAt" | "updatedAt">) =>
      patientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<Patient, "id" | "createdAt" | "updatedAt">;
    }) => patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      navigate(`/patient/${patientId}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData({ ...formData, name: newName });

    if (newName && !validateName(newName)) {
      setErrors({
        ...errors,
        name: "O nome deve conter apenas letras e espaços",
      });
    } else {
      setErrors({ ...errors, name: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar antes de enviar
    if (!validateName(formData.name)) {
      setErrors({
        ...errors,
        name: "O nome deve conter apenas letras e espaços",
      });
      return;
    }

    if (isEditing) {
      updateMutation.mutate({ id: patientId!, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (patientId) {
      deleteMutation.mutate(patientId);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: "custom.main" }}>
          {isEditing ? "Editar paciente" : "Novo paciente"}
        </Typography>

        {/* Photo Upload */}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            sx={{
              position: "relative",
              width: 120,
              height: 120,
              mb: 1,
            }}
          >
            <Avatar
              src={photoPreview}
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "custom.lightest",
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 40, color: "custom.light" }} />
            </Avatar>
            <IconButton
              sx={{
                position: "absolute",
                right: -8,
                bottom: -8,
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "custom.lightest" },
              }}
              component="label"
            >
              <input
                hidden
                accept="image/jpeg,image/png,image/gif"
                type="file"
                onChange={handlePhotoChange}
              />
              <PhotoCameraIcon fontSize="small" sx={{ color: "custom.main" }} />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Allowed *.jpeg, *.jpg, *.png, *.gif
          </Typography>
          <Typography variant="caption" color="text.secondary">
            max size of 3 Mb
          </Typography>
        </Box>

        {/* Form Fields */}
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
          gap={3}
        >
          <Box>
            <TextField
              label="Nome completo *"
              required
              fullWidth
              value={formData.name}
              onChange={handleNameChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              placeholder="Nome completo"
            />
          </Box>
          <Box>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="E-mail"
            />
          </Box>
          <Box>
            <TextField
              label="Telefone"
              fullWidth
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Telefone"
            />
          </Box>
          <Box>
            <TextField
              label="CPF"
              fullWidth
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: e.target.value })
              }
              placeholder="CPF"
            />
          </Box>
          <Box>
            <TextField
              label="Data de nascimento"
              type="date"
              fullWidth
              value={formData.birthDate || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, birthDate: value || undefined });
              }}
              InputLabelProps={{ shrink: true }}
              placeholder="dd/mm/yyyy"
            />
          </Box>
          <Box>
            <TextField
              label="Instagram"
              fullWidth
              value={formData.instagram}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  instagram: e.target.value.replace("@", ""),
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InstagramIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              placeholder="@username"
            />
          </Box>
          <Box gridColumn={{ xs: "1", sm: "1 / -1" }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Gênero
              </FormLabel>
              <RadioGroup
                row
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "M" | "F" | "OTHER",
                  })
                }
              >
                <FormControlLabel
                  value="M"
                  control={<Radio />}
                  label="Masculino"
                />
                <FormControlLabel
                  value="F"
                  control={<Radio />}
                  label="Feminino"
                />
                <FormControlLabel
                  value="OTHER"
                  control={<Radio />}
                  label="Outro"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {isEditing && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteClick}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": {
                  borderColor: "error.dark",
                  bgcolor: "error.lightest",
                },
              }}
            >
              Excluir paciente
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() =>
              navigate(isEditing ? `/patient/${patientId}` : "/patients")
            }
            sx={{
              borderColor: "custom.main",
              color: "custom.main",
              "&:hover": {
                borderColor: "custom.dark",
                bgcolor: "transparent",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{
              bgcolor: "custom.main",
              color: "common.white",
              "&:hover": {
                bgcolor: "custom.dark",
              },
            }}
          >
            {isEditing ? "Salvar alterações" : "Criar paciente"}
          </Button>
        </Stack>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o paciente "{patient?.name}"? Esta
            ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: "text.secondary",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
