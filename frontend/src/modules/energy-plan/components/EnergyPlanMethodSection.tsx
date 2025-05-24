import React from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";
import { Controller, Control, FieldValues } from "react-hook-form";
import InfoIcon from "@mui/icons-material/Info";
import {
  FORMULA_DESCRIPTIONS,
  ACTIVITY_FACTOR_DESCRIPTIONS,
  INJURY_FACTOR_DESCRIPTIONS,
} from "../constants/energyPlanConstants"; // Certifique-se que este caminho está correto

interface EnergyPlanMethodSectionProps {
  control: Control<FieldValues>;
  calculationDetails: {
    isValid: boolean;
    validationMessage?: string;
  } | null;
}

interface SelectField {
  name: string;
  label: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  descriptions: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

const EQUACOES = [
  { label: "Harris-Benedict (1984)", value: "harris_benedict_1984" },
  { label: "FAO/OMS (2004)", value: "fao_who_2004" },
  { label: "IOM EER (2005)", value: "iom_eer_2005" },
  { label: "Mifflin-St Jeor (1990)", value: "mifflin_st_jeor_1990" },
  {
    label: "Mifflin-St Jeor Modificada (1980)",
    value: "mifflin_st_jeor_modified_1980",
  },
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
];

const COR_TEMA = "#1976d2"; // Cor de destaque, idealmente vinda do tema MUI

const EnergyPlanMethodSection: React.FC<EnergyPlanMethodSectionProps> = ({
  control,
  calculationDetails,
}) => (
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
        <Typography variant="h6" fontWeight={600}>
          Métodos de Cálculo
        </Typography>
        <Tooltip
          title={
            <Box sx={{ p: 1, maxWidth: 350 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ color: "common.white" }} // Para boa legibilidade no fundo escuro do tooltip
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
                      color: "grey.300", // Cor mais suave para descrição
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
      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: {
            xs: "minmax(280px, 1fr)",
            sm: "repeat(auto-fit, minmax(280px, 1fr))",
          },
          width: "100%",
          justifyContent: "center",
        }}
      >
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
        ].map((selectField: SelectField) => (
          <Box
            key={selectField.name}
            sx={{ width: "100%", minWidth: 280, maxWidth: 400 }}
          >
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
                    width: "100%",
                    "& .MuiInputBase-root": { alignItems: "flex-start" },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontSize: "1rem",
                    },
                  }}
                  SelectProps={{
                    renderValue: (selectedValue: unknown) => {
                      const valueStr = selectedValue as string;
                      const selectedOption = selectField.options.find(
                        (opt) => opt.value === valueStr
                      );
                      const description =
                        selectField.descriptions[valueStr]?.description;
                      return (
                        <Box>
                          <Typography
                            variant="body2" // Menor e mais discreto
                            component="span"
                            sx={{ display: "block", lineHeight: 1.45 }}
                          >
                            {selectedOption?.label || valueStr}
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
                                lineHeight: 1.3,
                              }}
                            >
                              {description}
                            </Typography>
                          )}
                        </Box>
                      );
                    },
                  }}
                >
                  {selectField.options.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{ whiteSpace: "normal" }}
                    >
                      <Box>
                        <Typography variant="body2">{option.label}</Typography>
                        {selectField.descriptions[option.value]
                          ?.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {
                              selectField.descriptions[option.value]
                                ?.description
                            }
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
        ))}
      </Box>
      {calculationDetails &&
        !calculationDetails.isValid &&
        calculationDetails.validationMessage && (
          <Alert severity="warning" sx={{ mt: 2.5 }}>
            {calculationDetails.validationMessage}
          </Alert>
        )}
    </CardContent>
  </Card>
);

export default EnergyPlanMethodSection;
