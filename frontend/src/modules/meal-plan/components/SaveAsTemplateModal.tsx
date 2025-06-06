import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Box,
  Typography,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { mealPlanService, SaveAsTemplateDto } from '../services/mealPlanService';

interface SaveAsTemplateModalProps {
  open: boolean;
  onClose: () => void;
  mealPlanId: string;
  mealPlanName: string;
  onSuccess?: () => void;
}

const TEMPLATE_CATEGORIES = [
  'Emagrecimento',
  'Ganho de massa',
  'Manutenção',
  'Diabético',
  'Hipertensão',
  'Vegetariano',
  'Vegano',
  'Low carb',
  'Cetogênica',
  'Mediterrânea',
  'Outros',
];

const COMMON_TAGS = [
  'lowcarb',
  'ativo',
  'sedentario',
  'diabetico',
  'hipertenso',
  'vegetariano',
  'vegano',
  'cetocegenica',
  'mediterranea',
  'antiinflamatoria',
  'detox',
  'rapido',
  'economico',
];

export const SaveAsTemplateModal: React.FC<SaveAsTemplateModalProps> = ({
  open,
  onClose,
  mealPlanId,
  mealPlanName,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<SaveAsTemplateDto>({
    templateName: `${mealPlanName} - Template`,
    templateDescription: '',
    isPublic: false,
    tags: [],
    templateCategory: '',
    targetCalories: undefined,
  });

  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: () => mealPlanService.saveAsTemplate(mealPlanId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        templateName: `${mealPlanName} - Template`,
        templateDescription: '',
        isPublic: false,
        tags: [],
        templateCategory: '',
        targetCalories: undefined,
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveTemplateMutation.mutate();
  };

  const handleTagsChange = (event: any, newValue: string[]) => {
    setFormData({ ...formData, tags: newValue });
  };

  const handleClose = () => {
    if (!saveTemplateMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Salvar como Template</DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome do Template"
              value={formData.templateName}
              onChange={(e) =>
                setFormData({ ...formData, templateName: e.target.value })
              }
              required
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Descrição"
              value={formData.templateDescription}
              onChange={(e) =>
                setFormData({ ...formData, templateDescription: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="Descreva o propósito e características deste template..."
            />

            <Autocomplete
              options={TEMPLATE_CATEGORIES}
              value={formData.templateCategory}
              onChange={(event, newValue) =>
                setFormData({ ...formData, templateCategory: newValue || '' })
              }
              renderInput={(params) => (
                <TextField {...params} label="Categoria" variant="outlined" />
              )}
              freeSolo
            />

            <TextField
              label="Calorias Alvo (kcal/dia)"
              type="number"
              value={formData.targetCalories || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetCalories: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              fullWidth
              variant="outlined"
              placeholder="Ex: 1800"
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Tags (para facilitar a busca)
              </Typography>
              <Autocomplete
                multiple
                options={COMMON_TAGS}
                value={formData.tags}
                onChange={handleTagsChange}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Adicione tags..."
                  />
                )}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Template Público</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.isPublic
                      ? 'Outros nutricionistas poderão usar este template'
                      : 'Apenas você poderá usar este template'}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={saveTemplateMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saveTemplateMutation.isPending || !formData.templateName.trim()}
            startIcon={
              saveTemplateMutation.isPending ? (
                <CircularProgress size={16} />
              ) : null
            }
          >
            {saveTemplateMutation.isPending ? 'Salvando...' : 'Salvar Template'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};