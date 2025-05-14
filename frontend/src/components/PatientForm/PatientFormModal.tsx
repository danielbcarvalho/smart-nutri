import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Collapse,
  Chip,
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  PhotoCamera as PhotoCameraIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
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

// Funções de formatação e limpeza de máscaras
const formatPhone = (value: string) => {
  if (!value) return "";

  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, "");

  // Aplica a máscara (XX)XXXXXXXXX
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 7) {
    return `(${cleaned.substring(0, 2)})${cleaned.substring(2)}`;
  } else {
    return `(${cleaned.substring(0, 2)})${cleaned.substring(2, 11)}`;
  }
};

const formatCPF = (value: string) => {
  if (!value) return "";

  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, "");

  // Aplica a máscara XXX.XXX.XXX-XX
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3)}`;
  } else if (cleaned.length <= 9) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(
      3,
      6
    )}.${cleaned.substring(6)}`;
  } else {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(
      3,
      6
    )}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}`;
  }
};

const formatDate = (value: string) => {
  if (!value) return "";

  // Se já estiver no formato yyyy-mm-dd do input date, retorna como está
  if (value.includes("-")) return value;

  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, "");

  // Aplica a máscara DD/MM/YYYY
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
  } else {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(
      2,
      4
    )}/${cleaned.substring(4, 8)}`;
  }
};

// Funções para remover máscaras
const unformatPhone = (value: string) => value.replace(/\D/g, "");
const unformatCPF = (value: string) => value.replace(/\D/g, "");

// Função para converter data no formato DD/MM/YYYY para YYYY-MM-DD
const convertDateToISO = (date: string) => {
  if (!date || date.includes("-")) return date;

  const parts = date.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return date;
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const triggerRef = useRef<HTMLElement | null>(null);

  const [showAdditionalData, setShowAdditionalData] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newHealthCondition, setNewHealthCondition] = useState("");

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
    address: "",
    observations: "",
    allergies: [],
    healthConditions: [],
  });

  // Estado para armazenar valores com máscara apenas para visualização
  const [displayValues, setDisplayValues] = useState({
    phone: "",
    cpf: "",
    birthDate: "",
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
        address: "",
        observations: "",
        allergies: [],
        healthConditions: [],
      });
      setDisplayValues({
        phone: "",
        cpf: "",
        birthDate: "",
      });
      setPhotoPreview("");
      setErrors({ name: "" });
    } else if (patient) {
      const formattedPhone = patient.phone ? formatPhone(patient.phone) : "";
      const formattedCPF = patient.cpf ? formatCPF(patient.cpf) : "";

      // Para a data, precisamos garantir o formato correto
      let formattedDate = "";
      if (patient.birthDate) {
        const dateParts = patient.birthDate.split("-");
        if (dateParts.length === 3) {
          formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
      }

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
        address: patient.address || "",
        observations: patient.observations || "",
        allergies: patient.allergies || [],
        healthConditions: patient.healthConditions || [],
      });

      setDisplayValues({
        phone: formattedPhone,
        cpf: formattedCPF,
        birthDate: formattedDate,
      });

      setPhotoPreview(patient.photoUrl || "");
    }
  }, [open, patient]);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

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
      navigate("/patients");
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    const unformattedValue = unformatPhone(formattedValue);

    setDisplayValues({ ...displayValues, phone: formattedValue });
    setFormData({ ...formData, phone: unformattedValue });
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    const unformattedValue = unformatCPF(formattedValue);

    setDisplayValues({ ...displayValues, cpf: formattedValue });
    setFormData({ ...formData, cpf: unformattedValue });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Se o valor vier do input date (no formato YYYY-MM-DD)
    if (value.includes("-")) {
      const dateParts = value.split("-");
      const formattedValue = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      setDisplayValues({ ...displayValues, birthDate: formattedValue });
      setFormData({ ...formData, birthDate: value });
    } else {
      // Se estiver digitando no formato DD/MM/YYYY
      const formattedValue = formatDate(value);
      const isoDate = convertDateToISO(formattedValue);

      setDisplayValues({ ...displayValues, birthDate: formattedValue });
      setFormData({ ...formData, birthDate: isoDate });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(formData.name)) {
      setErrors({
        ...errors,
        name: "O nome deve conter apenas letras e espaços",
      });
      return;
    }

    try {
      if (patient) {
        // Filtra apenas campos preenchidos para edição
        const filteredData = Object.fromEntries(
          Object.entries(formData).filter(
            ([, value]) => value !== undefined && value !== null && value !== ""
          )
        ) as Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>;

        await updateMutation.mutateAsync(filteredData);
      } else {
        await createMutation.mutateAsync(formData);
      }

      // Only close the modal after the mutation is complete
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      // Handle error if needed
      console.error("Error submitting form:", error);
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

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...(formData.allergies || []), newAllergy.trim()],
      });
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (allergyToRemove: string) => {
    setFormData({
      ...formData,
      allergies: (formData.allergies || []).filter(
        (allergy) => allergy !== allergyToRemove
      ),
    });
  };

  const handleAddHealthCondition = () => {
    if (newHealthCondition.trim()) {
      setFormData({
        ...formData,
        healthConditions: [
          ...(formData.healthConditions || []),
          newHealthCondition.trim(),
        ],
      });
      setNewHealthCondition("");
    }
  };

  const handleRemoveHealthCondition = (conditionToRemove: string) => {
    setFormData({
      ...formData,
      healthConditions: (formData.healthConditions || []).filter(
        (condition) => condition !== conditionToRemove
      ),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        // Return focus to the trigger element before closing
        if (triggerRef.current) {
          triggerRef.current.focus();
        }
        onClose();
      }}
      maxWidth="md"
      fullWidth
      keepMounted={false}
      disablePortal={false}
    >
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
                value={displayValues.phone}
                onChange={handlePhoneChange}
                inputProps={{ maxLength: 13 }}
              />
            </Box>
            <Box>
              <TextField
                label="CPF"
                fullWidth
                value={displayValues.cpf}
                onChange={handleCPFChange}
                inputProps={{ maxLength: 14 }}
              />
            </Box>
            <Box>
              <TextField
                label="Data de nascimento"
                fullWidth
                value={displayValues.birthDate}
                onChange={handleDateChange}
                placeholder="DD/MM/YYYY"
                inputProps={{ maxLength: 10 }}
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

          {/* Additional Data Section */}
          <Box>
            <Button
              onClick={() => setShowAdditionalData(!showAdditionalData)}
              startIcon={
                showAdditionalData ? <ExpandLessIcon /> : <ExpandMoreIcon />
              }
              sx={{
                color: "text.secondary",
                justifyContent: "flex-start",
                pl: 0,
                "&:hover": {
                  bgcolor: "transparent",
                  color: "text.primary",
                },
              }}
            >
              Dados complementares
            </Button>
            <Collapse in={showAdditionalData}>
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}
              >
                <TextField
                  label="Endereço"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Digite o endereço completo do paciente"
                />

                <TextField
                  label="Observações do Paciente"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.observations}
                  onChange={(e) =>
                    setFormData({ ...formData, observations: e.target.value })
                  }
                  placeholder="Digite observações importantes sobre o paciente"
                />

                {/* Alergias */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Alergias
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Adicionar alergia"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAllergy();
                        }
                      }}
                    />
                    <IconButton
                      onClick={handleAddAllergy}
                      disabled={!newAllergy.trim()}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formData.allergies?.map((allergy) => (
                      <Chip
                        key={allergy}
                        label={allergy}
                        onDelete={() => handleRemoveAllergy(allergy)}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Condições de Saúde */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Condições de Saúde
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={newHealthCondition}
                      onChange={(e) => setNewHealthCondition(e.target.value)}
                      placeholder="Adicionar condição de saúde"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddHealthCondition();
                        }
                      }}
                    />
                    <IconButton
                      onClick={handleAddHealthCondition}
                      disabled={!newHealthCondition.trim()}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {formData.healthConditions?.map((condition) => (
                      <Chip
                        key={condition}
                        label={condition}
                        onDelete={() => handleRemoveHealthCondition(condition)}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Collapse>
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
