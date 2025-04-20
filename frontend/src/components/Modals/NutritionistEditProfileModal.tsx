import { useState } from "react";
import {
  Modal,
  Paper,
  Typography,
  Alert,
  Box,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { api } from "../../services/api";
import { Nutritionist } from "../../services/authService";
import { AxiosError } from "axios";

export interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: Nutritionist;
  onSave: (data: Nutritionist) => void;
}

export function EditProfileModal({
  open,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    crn: user?.crn || "",
    clinicName: user?.clinicName || "",
    instagram: user?.instagram || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.patch(`/nutritionists/${user.id}`, formData);
      onSave(response.data);
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === "object" && (err as AxiosError).isAxiosError) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setError(
          axiosErr.response?.data?.message || "Erro ao atualizar perfil"
        );
      } else {
        setError("Erro ao atualizar perfil");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          width: "100%",
          maxWidth: 400,
          mx: "auto",
          mt: 10,
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Editar Perfil
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Nome completo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            type="email"
          />
          <TextField
            label="CRN"
            name="crn"
            value={formData.crn}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Nome da clínica"
            name="clinicName"
            value={formData.clinicName}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              color="secondary"
              fullWidth
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading && (
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              )}
              Salvar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
}

export default EditProfileModal;
