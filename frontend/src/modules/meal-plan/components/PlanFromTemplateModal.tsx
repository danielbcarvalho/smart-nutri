import React, { useState, useEffect } from "react";
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
  Divider,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Close,
  ContentCopy,
  CalendarToday,
  EditNote,
  LocalFireDepartment,
  Restaurant,
} from "@mui/icons-material";
import { MealPlan } from "../services/mealPlanService";

interface PlanFromTemplateModalProps {
  open: boolean;
  onClose: () => void;
  template: MealPlan | null;
  patientName: string;
  onConfirm: (planData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  }) => void;
  isCreating?: boolean;
}

export const PlanFromTemplateModal: React.FC<PlanFromTemplateModalProps> = ({
  open,
  onClose,
  template,
  patientName,
  onConfirm,
  isCreating = false,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: `${template.templateName || template.name} - ${patientName.split(" ")[0]}`,
        description: template.templateDescription || "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
    }
  }, [template, patientName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onConfirm(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (!template) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
              Personalizar Plano do Template
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajuste os detalhes do plano antes de criar para {patientName.split(" ")[0]}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
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
          {/* Template Info Card */}
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
                  <ContentCopy sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                    {template.templateName || template.name}
                  </Typography>
                  {template.templateDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.templateDescription}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    {template.templateCategory && (
                      <Chip
                        label={template.templateCategory}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Restaurant fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {template.meals?.length || 0} refeições
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Criado em {formatDate(template.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Divider />

          {/* Form Fields */}
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <EditNote fontSize="small" color="primary" />
                Detalhes do Novo Plano
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
                sx={{ 
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  mb: 2,
                }}
              />
              
              <TextField
                fullWidth
                name="description"
                label="Objetivo/Descrição (opcional)"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ex: Melhorar performance e hipertrofia muscular"
                multiline
                rows={3}
                variant="outlined"
                disabled={isCreating}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="info.main" fontWeight={500}>
              💡 O plano será criado com todas as refeições e alimentos do template. Você poderá ajustar as quantidades e adicionar/remover itens após a criação.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
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
          startIcon={isCreating ? <CircularProgress size={16} /> : <ContentCopy />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {isCreating ? "Criando Plano..." : "Criar Plano do Template"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};