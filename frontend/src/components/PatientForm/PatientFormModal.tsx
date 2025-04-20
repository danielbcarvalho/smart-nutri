import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patientService,
  Patient,
} from "../../modules/patient/services/patientService";

// Função para validar o nome (apenas letras e espaços)
const validateName = (name: string) => {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(name);
};

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  patient?: Patient | null;
}

export function PatientFormModal({
  open,
  onClose,
  onSuccess,
  patient,
}: PatientFormModalProps) {
  const queryClient = useQueryClient();

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({
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
      setPhotoPreview("");
      setErrors({ name: "" });
    } else if (patient) {
      setFormData({
        name: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        cpf: patient.cpf || "",
        birthDate: patient.birthDate || "",
        gender: patient.gender || "OTHER",
        instagram: patient.instagram || "",
        status: patient.status || "active",
        monitoringStatus: patient.monitoringStatus || "in_progress",
        consultationFrequency: patient.consultationFrequency || "monthly",
        photoUrl: patient.photoUrl || "",
      });
      setPhotoPreview(patient.photoUrl || "");
    }
  }, [open, patient]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<Patient, "id" | "createdAt" | "updatedAt">) =>
      patientService.create(data),
    onSuccess: (createdPatient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (createdPatient?.photoUrl) {
        setPhotoPreview(
          `${createdPatient.photoUrl}?t=${
            createdPatient.updatedAt
              ? new Date(createdPatient.updatedAt).getTime()
              : Date.now()
          }`
        );
      }
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (
      data: Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>
    ) => {
      if (patient) {
        return patientService.update(patient.id, data);
      }
      return Promise.reject(new Error("Paciente não definido para edição"));
    },
    onSuccess: (updatedPatient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (updatedPatient?.photoUrl) {
        setPhotoPreview(
          `${updatedPatient.photoUrl}?t=${
            updatedPatient.updatedAt
              ? new Date(updatedPatient.updatedAt).getTime()
              : Date.now()
          }`
        );
      }
      if (onSuccess) onSuccess();
      onClose();
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
    if (!validateName(formData.name)) {
      setErrors({
        ...errors,
        name: "O nome deve conter apenas letras e espaços",
      });
      return;
    }
    if (patient) {
      // Filtra apenas campos preenchidos para edição
      const filteredData = Object.fromEntries(
        Object.entries(formData).filter(
          ([, value]) => value !== undefined && value !== null && value !== ""
        )
      ) as Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>;
      updateMutation.mutate(filteredData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && patient) {
      setUploadingPhoto(true);
      try {
        const updatedPatient = await patientService.uploadProfilePhoto(
          patient.id,
          file
        );
        setPhotoPreview(updatedPatient.photoUrl || "");
        setFormData((prev) => ({
          ...prev,
          photoUrl: updatedPatient.photoUrl || "",
        }));
      } catch {
        // TODO: exibir erro para o usuário
        // console.error(err);
      } finally {
        setUploadingPhoto(false);
      }
    } else if (file) {
      // Para novo paciente (ainda sem id), só faz preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{patient ? "Editar paciente" : "Novo paciente"}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
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
                    instagram: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="@paciente"
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
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
          onClick={handleSubmit}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          )}
          {patient ? "Salvar" : "Criar paciente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
