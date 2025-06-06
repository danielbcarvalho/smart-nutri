import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Close,
  CreateOutlined,
  CalendarToday,
  EditNote,
  PersonOutline,
  FlagOutlined,
} from "@mui/icons-material";

interface NewPlanModalProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  onConfirm: (planData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  }) => void;
  isCreating?: boolean;
}

export const NewPlanModal: React.FC<NewPlanModalProps> = ({
  open,
  onClose,
  patientName,
  onConfirm,
  isCreating = false,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onConfirm(formData);
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
      // Reset form when closing
      setFormData({
        name: "",
        goal: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "visible",
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
              Novo Plano Alimentar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure os detalhes do plano para {patientName.split(" ")[0]}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            size="small"
            disabled={isCreating}
            sx={{ 
              color: "text.secondary",
              "&:hover": { 
                backgroundColor: alpha(theme.palette.text.secondary, 0.08) 
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Stack spacing={3}>
          {/* Patient Info Card */}
          <Card 
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                  }}
                >
                  <PersonOutline sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                    Criando plano para {patientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Este plano será criado do zero, permitindo máxima personalização de acordo com as necessidades específicas do paciente.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <EditNote fontSize="small" color="primary" />
                Informações Básicas
              </Typography>
              
              <TextField
                fullWidth
                name="name"
                label="Nome do plano"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Cardápio para ganho de massa"
                variant="outlined"
                disabled={isCreating}
                required
                sx={{ 
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  mb: 2,
                }}
              />
              
              <TextField
                fullWidth
                name="goal"
                label="Objetivo do plano (opcional)"
                value={formData.goal}
                onChange={handleChange}
                placeholder="Ex: Melhorar performance e hipertrofia muscular"
                multiline
                rows={3}
                variant="outlined"
                disabled={isCreating}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, mt: 1, alignSelf: "flex-start" }}>
                      <FlagOutlined fontSize="small" color="action" />
                    </Box>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday fontSize="small" color="primary" />
                Período de Aplicação
              </Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  name="startDate"
                  label="Data de início"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={isCreating}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  name="endDate"
                  label="Data de término"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={isCreating}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Info Note */}
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="success.main" fontWeight={500}>
              ✨ Você começará com um plano em branco e poderá adicionar refeições, alimentos e configurar horários de acordo com as necessidades do paciente.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={isCreating}
          sx={{ 
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.name.trim() || isCreating}
          startIcon={isCreating ? <CircularProgress size={16} /> : <CreateOutlined />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {isCreating ? "Criando Plano..." : "Criar e Avançar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};