import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ImportMeasurementsModal } from "./ImportMeasurementsModal";

interface EnergyPlanFormSectionProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  watchedPeso: number | string | undefined;
  setImportModalOpen: (open: boolean) => void;
  importModalOpen: boolean;
  handleImportMeasurements: (measurement: {
    weight: number;
    height: number;
    fatFreeMass?: number;
  }) => void;
  patientId: string;
  calculationDetails: {
    isValid: boolean;
    validationMessage?: string;
  } | null;
}

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
                  label="Massa Livre de Gordura (kg)"
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
  </>
);

export default EnergyPlanFormSection;
