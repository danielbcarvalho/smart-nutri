import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Chip,
  Autocomplete,
  Paper,
  Divider,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  LocalDining as LocalDiningIcon,
} from "@mui/icons-material";

interface AiConfigurationFormProps {
  patientId?: string;
  configuration?: any;
  onConfigurationChange?: (config: any) => void;
}

interface AiConfiguration {
  objective: string;
  objectiveDetails: string;
  restrictions: string[];
  customRestrictions: string;
  avoidedFoods: any[];
  preferredFoods: any[];
  mealsPerDay: number;
  budget: string;
  complexity: string;
  prepTime: string;
  exerciseRoutine: string;
  exerciseFrequency: string;
  exerciseIntensity: string;
  kitchenEquipment: string[];
  socialContext: string;
}

const initialConfig: AiConfiguration = {
  objective: "",
  objectiveDetails: "",
  restrictions: [],
  customRestrictions: "",
  avoidedFoods: [],
  preferredFoods: [],
  mealsPerDay: 4,
  budget: "",
  complexity: "moderate",
  prepTime: "",
  exerciseRoutine: "",
  exerciseFrequency: "",
  exerciseIntensity: "",
  kitchenEquipment: [],
  socialContext: "",
};

export const AiConfigurationForm: React.FC<AiConfigurationFormProps> = ({
  patientId,
  configuration,
  onConfigurationChange,
}) => {
  const [config, setConfig] = useState<AiConfiguration>(configuration || initialConfig);

  const objectives = [
    { value: "weight_loss", label: "Perda de Peso" },
    { value: "muscle_gain", label: "Ganho de Massa Muscular" },
    { value: "maintenance", label: "Manutenção" },
    { value: "sports_performance", label: "Performance Esportiva" },
    { value: "general_health", label: "Saúde Geral" },
  ];

  const dietaryRestrictions = [
    "Vegetariano",
    "Vegano",
    "Low Carb",
    "Cetogênica",
    "Sem Glúten",
    "Sem Lactose",
    "Diabetes",
    "Hipertensão",
    "Colesterol Alto",
  ];

  const complexityLevels = [
    { value: "simple", label: "Simples (preparos básicos)" },
    { value: "moderate", label: "Moderado (alguns preparos)" },
    { value: "elaborate", label: "Elaborado (receitas complexas)" },
  ];

  const kitchenEquipmentOptions = [
    "Fogão",
    "Forno",
    "Micro-ondas",
    "Air Fryer",
    "Liquidificador",
    "Processador",
    "Grill/Sanduicheira",
    "Panela de Pressão",
  ];

  const handleConfigChange = (field: keyof AiConfiguration, value: any) => {
    const newConfig = {
      ...config,
      [field]: value,
    };
    setConfig(newConfig);
    onConfigurationChange?.(newConfig);
  };

  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    const newRestrictions = checked
      ? [...config.restrictions, restriction]
      : config.restrictions.filter((r) => r !== restriction);
    
    handleConfigChange("restrictions", newRestrictions);
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    const newEquipment = checked
      ? [...config.kitchenEquipment, equipment]
      : config.kitchenEquipment.filter((e) => e !== equipment);
    
    handleConfigChange("kitchenEquipment", newEquipment);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Configuração da IA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure os parâmetros para que a IA gere o plano alimentar mais adequado
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <TimelineIcon color="primary" />
                <Typography variant="h6">Objetivo do Plano</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ minWidth: 220 }}>
                    <InputLabel>Objetivo Principal</InputLabel>
                    <Select
                      value={config.objective}
                      onChange={(e) => handleConfigChange("objective", e.target.value)}
                      label="Objetivo Principal"
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: 250 }
                        }
                      }}
                    >
                      {objectives.map((obj) => (
                        <MenuItem key={obj.value} value={obj.value}>
                          {obj.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Detalhes Adicionais"
                    placeholder="Ex: Perder 5kg em 3 meses"
                    value={config.objectiveDetails}
                    onChange={(e) => handleConfigChange("objectiveDetails", e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <RestaurantIcon color="primary" />
                <Typography variant="h6">Restrições e Preferências Alimentares</Typography>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Restrições Dietéticas
              </Typography>
              <FormGroup sx={{ mb: 3 }}>
                <Grid container>
                  {dietaryRestrictions.map((restriction) => (
                    <Grid item xs={12} sm={6} md={4} key={restriction}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.restrictions.includes(restriction)}
                            onChange={(e) => handleRestrictionChange(restriction, e.target.checked)}
                          />
                        }
                        label={restriction}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>

              <TextField
                fullWidth
                label="Outras Restrições"
                placeholder="Descreva outras restrições específicas"
                value={config.customRestrictions}
                onChange={(e) => handleConfigChange("customRestrictions", e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <LocalDiningIcon color="primary" />
                <Typography variant="h6">Parâmetros do Plano</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Número de Refeições por Dia: {config.mealsPerDay}
                  </Typography>
                  <Slider
                    value={config.mealsPerDay}
                    onChange={(_, value) => handleConfigChange("mealsPerDay", value)}
                    min={3}
                    max={6}
                    marks
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Orçamento Médio (R$)"
                    placeholder="Ex: 30-50 por dia"
                    value={config.budget}
                    onChange={(e) => handleConfigChange("budget", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ minWidth: 250 }}>
                    <InputLabel>Complexidade das Receitas</InputLabel>
                    <Select
                      value={config.complexity}
                      onChange={(e) => handleConfigChange("complexity", e.target.value)}
                      label="Complexidade das Receitas"
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: 280 }
                        }
                      }}
                    >
                      {complexityLevels.map((level) => (
                        <MenuItem key={level.value} value={level.value}>
                          {level.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tempo Disponível para Preparo"
                    placeholder="Ex: 30 min no café, 60 min no almoço"
                    value={config.prepTime}
                    onChange={(e) => handleConfigChange("prepTime", e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6">Considerações Especiais</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Rotina de Exercícios"
                    placeholder="Ex: Musculação, corrida, pilates"
                    value={config.exerciseRoutine}
                    onChange={(e) => handleConfigChange("exerciseRoutine", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Frequência Semanal"
                    placeholder="Ex: 3x por semana"
                    value={config.exerciseFrequency}
                    onChange={(e) => handleConfigChange("exerciseFrequency", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth sx={{ minWidth: 180 }}>
                    <InputLabel>Intensidade</InputLabel>
                    <Select
                      value={config.exerciseIntensity}
                      onChange={(e) => handleConfigChange("exerciseIntensity", e.target.value)}
                      label="Intensidade"
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: 200 }
                        }
                      }}
                    >
                      <MenuItem value="low">Baixa</MenuItem>
                      <MenuItem value="moderate">Moderada</MenuItem>
                      <MenuItem value="high">Alta</MenuItem>
                      <MenuItem value="very_high">Muito Alta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Equipamentos de Cozinha Disponíveis
                  </Typography>
                  <FormGroup>
                    <Grid container>
                      {kitchenEquipmentOptions.map((equipment) => (
                        <Grid item xs={12} sm={6} md={3} key={equipment}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={config.kitchenEquipment.includes(equipment)}
                                onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                              />
                            }
                            label={equipment}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </FormGroup>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contexto Social e Preferências"
                    placeholder="Ex: Come fora frequentemente, família com crianças, trabalha em casa"
                    value={config.socialContext}
                    onChange={(e) => handleConfigChange("socialContext", e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ p: 3, bgcolor: "primary.light", color: "primary.contrastText" }}>
        <Typography variant="h6" gutterBottom>
          Resumo da Configuração
        </Typography>
        <Typography variant="body2">
          A IA utilizará estas configurações junto com os dados do paciente para gerar
          um plano alimentar personalizado. Você poderá revisar e editar o plano antes
          de aprová-lo.
        </Typography>
      </Paper>
    </Box>
  );
};