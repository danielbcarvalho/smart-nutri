import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Psychology as PsychologyIcon,
} from "@mui/icons-material";
import { AiReasoningModal } from "./AiReasoningModal";

interface AiPlanReviewProps {
  generatedPlan: any;
}

export const AiPlanReview: React.FC<AiPlanReviewProps> = ({
  generatedPlan,
}) => {
  const [reasoningModalOpen, setReasoningModalOpen] = React.useState(false);
  // Mock data for demonstration - will be replaced with real AI-generated data
  const mockPlan = {
    title: "Plano Alimentar IA - João Silva",
    description: "Plano personalizado para perda de peso moderada",
    totalCalories: 1800,
    macros: {
      protein: 135, // g
      carbs: 202,   // g
      fat: 60,      // g
    },
    meals: [
      {
        name: "Café da Manhã",
        time: "08:00",
        calories: 400,
        foods: [
          {
            name: "Aveia em flocos",
            quantity: 40,
            unit: "g",
            calories: 152,
            isAiSuggested: true,
          },
          {
            name: "Banana nanica",
            quantity: 100,
            unit: "g",
            calories: 87,
            isAiSuggested: true,
          },
          {
            name: "Leite desnatado",
            quantity: 200,
            unit: "ml",
            calories: 70,
            isAiSuggested: true,
          },
          {
            name: "Amendoim torrado",
            quantity: 15,
            unit: "g",
            calories: 91,
            isAiSuggested: true,
          },
        ],
      },
      {
        name: "Lanche da Manhã",
        time: "10:30",
        calories: 150,
        foods: [
          {
            name: "Iogurte natural desnatado",
            quantity: 150,
            unit: "g",
            calories: 75,
            isAiSuggested: true,
          },
          {
            name: "Granola",
            quantity: 20,
            unit: "g",
            calories: 75,
            isAiSuggested: true,
          },
        ],
      },
      {
        name: "Almoço",
        time: "12:30",
        calories: 650,
        foods: [
          {
            name: "Arroz integral",
            quantity: 80,
            unit: "g",
            calories: 280,
            isAiSuggested: true,
          },
          {
            name: "Feijão carioca",
            quantity: 60,
            unit: "g",
            calories: 65,
            isAiSuggested: true,
          },
          {
            name: "Peito de frango grelhado",
            quantity: 120,
            unit: "g",
            calories: 200,
            isAiSuggested: true,
          },
          {
            name: "Salada mista",
            quantity: 100,
            unit: "g",
            calories: 25,
            isAiSuggested: true,
          },
          {
            name: "Azeite extra virgem",
            quantity: 10,
            unit: "ml",
            calories: 80,
            isAiSuggested: true,
          },
        ],
      },
      {
        name: "Jantar",
        time: "19:00",
        calories: 500,
        foods: [
          {
            name: "Salmão grelhado",
            quantity: 100,
            unit: "g",
            calories: 180,
            isAiSuggested: true,
          },
          {
            name: "Batata doce cozida",
            quantity: 150,
            unit: "g",
            calories: 130,
            isAiSuggested: true,
          },
          {
            name: "Brócolis refogado",
            quantity: 100,
            unit: "g",
            calories: 35,
            isAiSuggested: true,
          },
          {
            name: "Azeite extra virgem",
            quantity: 10,
            unit: "ml",
            calories: 80,
            isAiSuggested: true,
          },
        ],
      },
    ],
    aiInsights: [
      "Plano balanceado com 30% proteínas, 45% carboidratos e 25% gorduras",
      "Priorizados alimentos anti-inflamatórios para objetivo de perda de peso",
      "Horários das refeições ajustados para rotina de exercícios matinal",
      "Incluídos alimentos ricos em fibras para maior saciedade",
    ],
    alternatives: [
      {
        meal: "Café da Manhã",
        original: "Aveia em flocos",
        alternatives: ["Granola sem açúcar", "Quinoa em flocos", "Amaranto"],
      },
      {
        meal: "Almoço",
        original: "Peito de frango grelhado",
        alternatives: ["Peixe grelhado", "Tofu grelhado", "Ovos mexidos"],
      },
    ],
  };

  const plan = generatedPlan || mockPlan;

  const calculateMacroPercentages = () => {
    // Handle both mock data structure and real AI response structure
    const macros = plan.macros || plan.nutritionalSummary || {};
    const protein = macros.protein || 0;
    const carbs = macros.carbs || macros.carbohydrates || 0;
    const fat = macros.fat || 0;
    
    const totalMacroCalories = 
      protein * 4 + 
      carbs * 4 + 
      fat * 9;
    
    if (totalMacroCalories === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }
    
    return {
      protein: Math.round((protein * 4 / totalMacroCalories) * 100),
      carbs: Math.round((carbs * 4 / totalMacroCalories) * 100),
      fat: Math.round((fat * 9 / totalMacroCalories) * 100),
    };
  };

  const macroPercentages = calculateMacroPercentages();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
          <Typography variant="h5" gutterBottom>
            Plano Gerado com Sucesso!
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Revise o plano alimentar gerado pela IA e faça ajustes se necessário
        </Typography>
        
        {/* AI Reasoning Button */}
        {plan.reasoning && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PsychologyIcon />}
              onClick={() => setReasoningModalOpen(true)}
              size="small"
            >
              Ver Raciocínio da SmartNutri AI
            </Button>
          </Box>
        )}
      </Box>

      {/* AI Insights */}
      <Alert 
        severity="info" 
        icon={<AutoAwesomeIcon />}
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Insights da SmartNutri AI
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
          {(plan.aiInsights || []).map((insight, index) => (
            <li key={index}>
              <Typography variant="body2">{insight}</Typography>
            </li>
          ))}
        </Box>
      </Alert>

      {/* Nutritional Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumo Nutricional
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary.main">
                  {plan.totalCalories || plan.nutritionalSummary?.totalCalories || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calorias Totais
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {(plan.macros?.protein || plan.nutritionalSummary?.protein || 0)}g
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proteínas ({macroPercentages.protein}%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="warning.main">
                  {(plan.macros?.carbs || plan.nutritionalSummary?.carbohydrates || 0)}g
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Carboidratos ({macroPercentages.carbs}%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="error.main">
                  {(plan.macros?.fat || plan.nutritionalSummary?.fat || 0)}g
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gorduras ({macroPercentages.fat}%)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Meal Plan */}
      <Typography variant="h6" gutterBottom>
        Plano Alimentar Detalhado
      </Typography>

      {(plan.meals || plan.mealPlan?.meals || []).map((meal, mealIndex) => (
        <Card key={mealIndex}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6">
                  {meal.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {meal.time} • {meal.calories || meal.foods?.reduce((total, food) => total + (food.calories || 0), 0) || 0} kcal
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="Editar refeição">
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gerar alternativas">
                  <IconButton size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Paper variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Qtde</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Alimento</TableCell>
                    <TableCell align="right">Calorias</TableCell>
                    <TableCell align="center">Origem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(meal.foods || []).map((food, foodIndex) => (
                    <TableRow key={foodIndex}>
                      <TableCell>{food.quantity}</TableCell>
                      <TableCell>{food.unit}</TableCell>
                      <TableCell>{food.name}</TableCell>
                      <TableCell align="right">{food.calories}</TableCell>
                      <TableCell align="center">
                        {(food.isAiSuggested !== false) && (
                          <Chip
                            icon={<AutoAwesomeIcon />}
                            label="IA"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>
      ))}

      {/* Alternatives Section */}
      {plan.alternatives && plan.alternatives.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Alternativas Sugeridas pela IA
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              A IA identificou algumas alternativas para variar o cardápio
            </Typography>
            
            {plan.alternatives.map((alt, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {alt.meal} - {alt.original}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {alt.alternatives.map((alternative, altIndex) => (
                    <Chip
                      key={altIndex}
                      label={alternative}
                      size="small"
                      variant="outlined"
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Final Notes */}
      <Alert severity="success">
        <Typography variant="subtitle2" gutterBottom>
          Plano Pronto para Aprovação
        </Typography>
        <Typography variant="body2">
          O plano foi gerado com base nos dados do paciente e suas configurações.
          Você pode editá-lo antes de aprovar ou gerar uma nova versão com parâmetros diferentes.
        </Typography>
      </Alert>

      {/* AI Reasoning Modal */}
      <AiReasoningModal
        open={reasoningModalOpen}
        onClose={() => setReasoningModalOpen(false)}
        reasoning={plan.reasoning}
      />
    </Box>
  );
};