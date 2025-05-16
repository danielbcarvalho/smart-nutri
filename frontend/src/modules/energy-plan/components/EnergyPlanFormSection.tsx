import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  Alert,
  Box,
} from "@mui/material";
import { Controller } from "react-hook-form";
import InfoIcon from "@mui/icons-material/Info";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ImportMeasurementsModal } from "./ImportMeasurementsModal"; // Assume que este componente existe
import {
  FORMULA_DESCRIPTIONS,
  ACTIVITY_FACTOR_DESCRIPTIONS,
  INJURY_FACTOR_DESCRIPTIONS,
} from "../constants/energyPlanConstants"; // Assume que este arquivo de constantes existe

interface EnergyPlanFormSectionProps {
  control: any;
  errors: any;
  watchedPeso: any; // Peso observado para validação da massa magra
  setImportModalOpen: (open: boolean) => void;
  importModalOpen: boolean;
  handleImportMeasurements: (measurement: {
    weight: number;
    height: number;
    muscleMass?: number;
  }) => void;
  patientId: string;
  calculationDetails: any; // Detalhes de cálculo, incluindo mensagens de validação
}

// Dados para os selects
const EQUACOES = [
  { label: "Harris-Benedict (1984)", value: "harris_benedict_1984" },
  { label: "FAO/OMS (2004)", value: "fao_who_2004" },
  { label: "IOM EER (2005)", value: "iom_eer_2005" },
  // Adicione outras equações conforme necessário
];

const NIVEL_ATIVIDADE = [
  { label: "Sedentário (1.200)", value: "1.200" },
  { label: "Pouco ativo (1.375)", value: "1.375" },
  { label: "Ativo (1.550)", value: "1.550" },
  { label: "Muito ativo (1.725)", value: "1.725" },
  { label: "Atlético (1.900)", value: "1.900" },
];

const FATOR_CLINICO = [
  { label: "Saudável (1.000)", value: "1.000" },
  { label: "Pós-operatório simples (1.200)", value: "1.200" },
  { label: "Trauma moderado (1.350)", value: "1.350" },
  { label: "Infecção grave (1.500)", value: "1.500" },
  // Adicione outros fatores clínicos conforme necessário
];

const COR_TEMA = "#1976d2"; // Cor primária ou de destaque do tema

const EnergyPlanFormSection: React.FC<EnergyPlanFormSectionProps> = ({
  control,
  errors,
  watchedPeso,
  setImportModalOpen,
  importModalOpen,
  handleImportMeasurements,
  patientId,
  calculationDetails,
}) => (
  <>
    {/* Seção de nome do plano e data */}
    <Card variant="outlined">
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {" "}
        {/* Leve aumento no padding */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={7}>
            <Controller
              name="nome"
              control={control}
              rules={{
                maxLength: {
                  value: 100,
                  message: "Nome deve ter no máximo 100 caracteres",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Nome do Plano"
                  size="small"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || " "}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Controller
              name="dataCalculo"
              control={control}
              rules={{ required: "Data é obrigatória" }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Data do Cálculo"
                  type="date"
                  size="small"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || " "}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>

    {/* Seção de dados antropométricos */}
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Medidas Corporais
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="altura"
              control={control}
              rules={{
                required: "Altura é obrigatória",
                min: { value: 50, message: "Altura mínima: 50cm" },
                max: { value: 300, message: "Altura máxima: 300cm" },
                pattern: {
                  value: /^[0-9]+([.,][0-9]+)?$/,
                  message: "Altura inválida (use . ou , para decimais)",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Altura (cm)"
                  type="text"
                  inputMode="decimal"
                  size="small"
                  {...field}
                  value={
                    field.value === undefined
                      ? ""
                      : String(field.value).replace(".", ",")
                  } // Consistencia na exibição
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(",", "."))
                  } // Normaliza para ponto
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || " "}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Controller
              name="peso"
              control={control}
              rules={{
                required: "Peso é obrigatório",
                min: { value: 1, message: "Peso mínimo: 1kg" },
                max: { value: 500, message: "Peso máximo: 500kg" },
                pattern: {
                  value: /^[0-9]+([.,][0-9]+)?$/,
                  message: "Peso inválido (use . ou , para decimais)",
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Peso (kg)"
                  type="text"
                  inputMode="decimal"
                  size="small"
                  {...field}
                  value={
                    field.value === undefined
                      ? ""
                      : String(field.value).replace(".", ",")
                  }
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(",", "."))
                  }
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || " "}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Controller
              name="massaMagra"
              control={control}
              rules={{
                min: { value: 0, message: "Massa magra deve ser >= 0" },
                max: {
                  value: 300,
                  message: "Valor de massa magra parece irreal",
                },
                pattern: {
                  value: /^[0-9]*([.,][0-9]+)?$/,
                  message: "Massa magra inválida (use . ou , para decimais)",
                },
                validate: (value: any) => {
                  if (!value || String(value).trim() === "") return true; // Permite campo vazio
                  const mm = parseFloat(String(value).replace(",", "."));
                  const p = parseFloat(String(watchedPeso).replace(",", "."));
                  if (isNaN(mm)) return "Valor inválido para massa magra"; // Se não for número após tratamento
                  if (!isNaN(p) && p > 0 && mm > p) {
                    // Valida apenas se peso for válido e maior que 0
                    return "Massa magra não pode ser maior que o peso";
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Massa Magra (kg)"
                  type="text"
                  inputMode="decimal"
                  size="small"
                  {...field}
                  value={
                    field.value === undefined
                      ? ""
                      : String(field.value).replace(".", ",")
                  }
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(",", "."))
                  }
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || " "}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
        </Grid>
        <Button
          variant="text"
          startIcon={<FileUploadIcon />}
          size="small"
          onClick={() => setImportModalOpen(true)}
          sx={{
            mt: 2,
            color: COR_TEMA,
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Importar medidas da avaliação
        </Button>
        <ImportMeasurementsModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSelect={handleImportMeasurements}
          patientId={patientId}
        />
      </CardContent>
    </Card>

    {/* Seção de métodos de cálculo */}
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Métodos de Cálculo
          </Typography>
          <Tooltip
            title={
              <Box sx={{ p: 1, maxWidth: 350 }}>
                {" "}
                {/* MaxWidth aumentado */}
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: "common.white" }}
                >
                  Sobre as Fórmulas de Estimativa Energética
                </Typography>
                {Object.entries(FORMULA_DESCRIPTIONS).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{ color: "common.white" }}
                    >
                      {value.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        whiteSpace: "normal",
                        color: "grey.300",
                      }}
                    >
                      {value.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            }
            arrow
          >
            <IconButton size="small" sx={{ color: COR_TEMA }}>
              <InfoIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={2.5}>
          {" "}
          {/* Espaçamento do grid aumentado um pouco */}
          {[
            {
              name: "equacao",
              label: "Equação",
              options: EQUACOES,
              descriptions: FORMULA_DESCRIPTIONS,
            },
            {
              name: "nivelAtividade",
              label: "Nível de Atividade Física",
              options: NIVEL_ATIVIDADE,
              descriptions: ACTIVITY_FACTOR_DESCRIPTIONS,
            },
            {
              name: "fatorClinico",
              label: "Fator Clínico",
              options: FATOR_CLINICO,
              descriptions: INJURY_FACTOR_DESCRIPTIONS,
            },
          ].map((selectField) => (
            <Grid item xs={12} md="auto" flexGrow={1} key={selectField.name}>
              <Controller
                name={selectField.name}
                control={control}
                rules={{ required: `${selectField.label} é obrigatório(a)` }}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    label={selectField.label}
                    size="small"
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || " "}
                    fullWidth
                    sx={{
                      minWidth: { md: 230 }, // Aumentado para acomodar melhor o conteúdo
                      "& .MuiInputBase-root": { alignItems: "flex-start" }, // Para renderValue com múltiplas linhas
                    }}
                    renderValue={(selectedValue) => {
                      const selectedOption = selectField.options.find(
                        (opt) => opt.value === selectedValue
                      );
                      const description =
                        selectField.descriptions[
                          selectedValue as keyof typeof selectField.descriptions
                        ]?.description;
                      return (
                        <Box>
                          <Typography
                            variant="body1"
                            component="span"
                            sx={{ display: "block", lineHeight: 1.45 }}
                          >
                            {selectedOption?.label || selectedValue}
                          </Typography>
                          {description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.3, // Ajuste fino de espaçamento
                              }}
                            >
                              {description}
                            </Typography>
                          )}
                        </Box>
                      );
                    }}
                  >
                    {selectField.options.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{ whiteSpace: "normal" }} // Permite quebra de linha no MenuItem
                      >
                        <Box>
                          <Typography variant="body2">
                            {option.label}
                          </Typography>
                          {selectField.descriptions[
                            option.value as keyof typeof selectField.descriptions
                          ]?.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block", // Para quebra de linha
                                mt: 0.5, // Pequena margem superior para a descrição
                              }}
                            >
                              {
                                selectField.descriptions[
                                  option.value as keyof typeof selectField.descriptions
                                ]?.description
                              }
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          ))}
        </Grid>
        {calculationDetails &&
          !calculationDetails.isValid &&
          calculationDetails.validationMessage && (
            <Alert severity="warning" sx={{ mt: 2.5 }}>
              {calculationDetails.validationMessage}
            </Alert>
          )}
      </CardContent>
    </Card>
  </>
);

export default EnergyPlanFormSection;
