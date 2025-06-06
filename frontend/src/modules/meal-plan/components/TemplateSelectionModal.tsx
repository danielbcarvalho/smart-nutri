import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import {
  Search,
  Clear,
  Restaurant,
  CalendarToday,
  LocalFireDepartment,
  Public,
  Bookmark,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import {
  mealPlanService,
  MealPlan,
  TemplateFiltersDto,
} from "../services/mealPlanService";
import { useFoodDb } from "@/services/useFoodDb";
import { calculateTotalNutrients } from "../utils/nutrientCalculations";
import type { Alimento } from "./AddFoodToMealModal";

interface TemplateSelectionModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onTemplateSelected: (template: MealPlan) => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  open,
  onClose,
  patientId,
  onTemplateSelected,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<MealPlan | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Load food database for calorie calculations
  const { data: foodDb = [] } = useFoodDb();

  // Fetch templates with search
  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["templates", searchQuery],
    queryFn: () => {
      if (searchQuery.trim()) {
        return mealPlanService.searchTemplates({ search: searchQuery.trim() });
      } else {
        return mealPlanService.getTemplates();
      }
    },
    enabled: open,
  });

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelected(selectedTemplate);
      onClose();
      setSelectedTemplate(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedTemplate(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const calculateTotalCalories = (template: MealPlan) => {
    if (!template.meals || template.meals.length === 0) return 0;

    // Convert meals to the format expected by calculateTotalNutrients
    const mealsWithActiveFlag = template.meals.map((meal) => ({
      ...meal,
      isActiveForCalculation: true, // For templates, consider all meals active
    }));

    // Use the existing utility with proper typing
    const nutrients = calculateTotalNutrients(
      mealsWithActiveFlag,
      foodDb as Alimento[]
    );

    return nutrients.calories;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Bookmark color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Biblioteca de Templates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione um template para criar um novo plano alimentar
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Clear />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box sx={{ p: 3, pb: 2 }}>
          <TextField
            placeholder="Busque por nome, categoria ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "grey.50",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Templates List */}
        <Box sx={{ px: 3, pb: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <Stack alignItems="center" spacing={2}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Carregando templates...
                </Typography>
              </Stack>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Erro ao carregar templates. Tente novamente.
            </Alert>
          ) : templates.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: "grey.50",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "grey.300",
              }}
            >
              <Bookmark sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum template encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery.trim()
                  ? "Nenhum template encontrado para esta busca. Tente outras palavras-chave."
                  : "Você ainda não possui templates salvos."}
              </Typography>
            </Paper>
          ) : (
            <Box>
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {templates.length} template{templates.length !== 1 ? "s" : ""}{" "}
                  encontrado{templates.length !== 1 ? "s" : ""}
                </Typography>
                {selectedTemplate && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight={500}
                  >
                    Template selecionado:{" "}
                    {selectedTemplate.templateName || selectedTemplate.name}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  maxHeight: 420,
                  overflow: "auto",
                  p: 5,
                  "&::-webkit-scrollbar": {
                    width: 8,
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "grey.100",
                    borderRadius: 4,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "grey.400",
                    borderRadius: 4,
                  },
                }}
              >
                <Stack spacing={2}>
                  {templates.map((template) => (
                    <Card
                      elevation={selectedTemplate?.id === template.id ? 3 : 1}
                      sx={{
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          selectedTemplate?.id === template.id
                            ? "primary.main"
                            : "transparent",
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        width: "100%",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 3,
                          borderColor:
                            selectedTemplate?.id === template.id
                              ? "primary.main"
                              : "primary.light",
                        },
                      }}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                        {/* Header Section with clean background */}
                        <Box sx={{
                          backgroundColor: selectedTemplate?.id === template.id 
                            ? "primary.main" 
                            : "#f8fafc",
                          p: 2,
                          borderBottom: "1px solid",
                          borderColor: selectedTemplate?.id === template.id 
                            ? "primary.main" 
                            : "#e2e8f0",
                          position: "relative",
                        }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1, mr: 2 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: selectedTemplate?.id === template.id ? "white" : "text.primary",
                                  fontWeight: 700,
                                  fontSize: "1.1rem",
                                  lineHeight: 1.2,
                                  mb: 0.5,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {template.templateName || template.name}
                              </Typography>
                              
                              {template.templateCategory && (
                                <Chip
                                  label={template.templateCategory}
                                  size="small"
                                  sx={{
                                    backgroundColor: selectedTemplate?.id === template.id 
                                      ? "rgba(255,255,255,0.25)" 
                                      : "primary.main",
                                    color: selectedTemplate?.id === template.id 
                                      ? "white" 
                                      : "white",
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                    height: 24,
                                    border: selectedTemplate?.id === template.id 
                                      ? "1px solid rgba(255,255,255,0.3)" 
                                      : "none",
                                    "& .MuiChip-label": {
                                      px: 1
                                    }
                                  }}
                                />
                              )}
                            </Box>

                            {/* Calories Badge */}
                            {(() => {
                              const totalCalories = calculateTotalCalories(template);
                              const displayCalories = template.targetCalories || totalCalories;
                              if (displayCalories > 0) {
                                return (
                                  <Box sx={{
                                    backgroundColor: selectedTemplate?.id === template.id 
                                      ? "rgba(255,255,255,0.9)" 
                                      : "white",
                                    borderRadius: "12px",
                                    px: 1.5,
                                    py: 0.5,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    border: selectedTemplate?.id === template.id 
                                      ? "none" 
                                      : "1px solid #e2e8f0"
                                  }}>
                                    <LocalFireDepartment sx={{ fontSize: 16, color: "#ff6b35" }} />
                                    <Typography variant="body2" fontWeight={700} sx={{ color: "#333" }}>
                                      {Math.round(displayCalories)}
                                    </Typography>
                                  </Box>
                                );
                              }
                              return null;
                            })()}
                          </Box>
                        </Box>

                        {/* Content Section */}
                        <Box sx={{ p: 2 }}>
                          {/* Description */}
                          {template.templateDescription && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                fontSize: "0.875rem",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {template.templateDescription}
                            </Typography>
                          )}

                          {/* Stats Row */}
                          <Box sx={{
                            display: "flex",
                            gap: 2,
                            mb: 2,
                            p: 1.5,
                            backgroundColor: "#f8fafc",
                            borderRadius: 2,
                            border: "1px solid #e2e8f0"
                          }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Restaurant sx={{ fontSize: 18, color: "#64748b" }} />
                              <Typography variant="body2" fontWeight={600} color="#334155">
                                {template.meals?.length || 0} refeições
                              </Typography>
                            </Box>
                            
                            {template.usageCount && template.usageCount > 0 && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Box sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: "#10b981"
                                }} />
                                <Typography variant="body2" color="#64748b">
                                  {template.usageCount}x usado
                                </Typography>
                              </Box>
                            )}

                            {template.isPublic && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Public sx={{ fontSize: 16, color: "#10b981" }} />
                                <Typography variant="body2" color="#10b981" fontWeight={500}>
                                  Público
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Tags and Footer */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, flex: 1 }}>
                              {template.tags && template.tags.slice(0, 3).map((tag, index) => (
                                <Chip
                                  key={`tag-${index}`}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    backgroundColor: "#fef3cd",
                                    borderColor: "#fbbf24",
                                    color: "#92400e",
                                    fontSize: "0.7rem",
                                    height: 24,
                                    fontWeight: 500,
                                    "&:hover": {
                                      backgroundColor: "#fde68a"
                                    }
                                  }}
                                />
                              ))}
                              
                              {template.tags && template.tags.length > 3 && (
                                <Chip
                                  label={`+${template.tags.length - 3}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#e5e7eb",
                                    color: "#6b7280",
                                    fontSize: "0.7rem",
                                    height: 24,
                                    border: "none",
                                    fontWeight: 600
                                  }}
                                />
                              )}
                            </Box>

                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                ml: 2,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {formatDate(template.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSelectTemplate}
          disabled={!selectedTemplate}
        >
          Selecionar Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};
