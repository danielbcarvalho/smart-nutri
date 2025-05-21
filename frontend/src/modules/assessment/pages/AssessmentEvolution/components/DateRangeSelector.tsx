import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  isValid,
  parseISO,
} from "date-fns";
import FilterListIcon from "@mui/icons-material/FilterList";

// Defina ou importe seu tipo Measurement
export interface Measurement {
  id: string;
  date: string; // "yyyy-MM-dd"
  value?: number;
  type?: string;
  // Adicione outros campos necessários aqui
}

interface DateRangeSelectorProps {
  value: {
    startDate: string; // Espera "yyyy-MM-dd"
    endDate: string; // Espera "yyyy-MM-dd"
  };
  onChange: (value: { startDate: string; endDate: string }) => void;
  measurements: Measurement[];
  selectedMeasurements?: string[];
  onMeasurementsChange?: (selectedIds: string[]) => void;
}

type PeriodOption = "1m" | "3m" | "6m" | "1y" | "custom";

// Helper para obter o período a partir das datas (igual ao anterior)
const getPeriodFromDates = (
  startDateStr?: string,
  endDateStr?: string
): PeriodOption => {
  if (!startDateStr || !endDateStr) return "3m";

  const startDate = parseISO(startDateStr);
  const endDate = parseISO(endDateStr);

  if (!isValid(startDate) || !isValid(endDate)) return "custom";

  const today = new Date();
  const todayEndOfMonth = endOfMonth(today);

  if (
    format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd") === startDateStr &&
    format(todayEndOfMonth, "yyyy-MM-dd") === endDateStr
  )
    return "1m";
  if (
    format(startOfMonth(subMonths(today, 3)), "yyyy-MM-dd") === startDateStr &&
    format(todayEndOfMonth, "yyyy-MM-dd") === endDateStr
  )
    return "3m";
  if (
    format(startOfMonth(subMonths(today, 6)), "yyyy-MM-dd") === startDateStr &&
    format(todayEndOfMonth, "yyyy-MM-dd") === endDateStr
  )
    return "6m";
  if (
    format(startOfMonth(subMonths(today, 12)), "yyyy-MM-dd") === startDateStr &&
    format(todayEndOfMonth, "yyyy-MM-dd") === endDateStr
  )
    return "1y";

  return "custom";
};

export function DateRangeSelector({
  value,
  onChange,
  measurements,
  selectedMeasurements = [],
  onMeasurementsChange,
}: DateRangeSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(() =>
    getPeriodFromDates(value.startDate, value.endDate)
  );
  const [tempDateRange, setTempDateRange] = useState({
    startDate: value.startDate,
    endDate: value.endDate,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [localSelectedMeasurements, setLocalSelectedMeasurements] =
    useState<string[]>(selectedMeasurements);

  // Efeito para SINCRONIZAR estado interno com MUDANÇAS no 'value' vindo do pai
  useEffect(() => {
    const effectivePeriod = getPeriodFromDates(value.startDate, value.endDate);
    setSelectedPeriod(effectivePeriod);
    setTempDateRange({
      startDate: value.startDate,
      endDate: value.endDate,
    });
  }, [value]);

  // Efeito para selecionar as 5 últimas avaliações quando o componente é montado
  useEffect(() => {
    if (measurements.length > 0 && localSelectedMeasurements.length === 0) {
      // Ordena as avaliações por data (mais recentes primeiro) e pega as 5 primeiras
      const sortedMeasurements = [...measurements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastFiveIds = sortedMeasurements.slice(0, 5).map((m) => m.id);
      setLocalSelectedMeasurements(lastFiveIds);
      onMeasurementsChange?.(lastFiveIds);
    }
  }, [measurements]);

  const handlePeriodChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newPeriod: PeriodOption | null) => {
      if (!newPeriod) return;

      setSelectedPeriod(newPeriod);

      if (newPeriod === "custom") {
        setTempDateRange({
          startDate: value.startDate,
          endDate: value.endDate,
        });
        return;
      }

      const endDate = new Date();
      let startDate: Date;
      switch (newPeriod) {
        case "1m":
          startDate = subMonths(endDate, 1);
          break;
        case "3m":
          startDate = subMonths(endDate, 3);
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          break;
        case "1y":
          startDate = subMonths(endDate, 12);
          break;
        default:
          return;
      }
      const newRange = {
        startDate: format(startOfMonth(startDate), "yyyy-MM-dd"),
        endDate: format(endOfMonth(endDate), "yyyy-MM-dd"),
      };
      onChange(newRange);
    },
    [onChange, value]
  );

  const handleCustomDateChange = useCallback(
    (type: "start" | "end", date: Date | null) => {
      if (date && isValid(date)) {
        setTempDateRange((prev) => ({
          ...prev,
          [type === "start" ? "startDate" : "endDate"]: format(
            date,
            "yyyy-MM-dd"
          ),
        }));
      } else {
        setTempDateRange((prev) => ({
          ...prev,
          [type === "start" ? "startDate" : "endDate"]: undefined,
        }));
      }
      // Não precisa mais forçar o selectedPeriod para 'custom' aqui,
      // pois ele já deve estar 'custom' para os DatePickers serem visíveis.
      // Mas se clicar em uma data após selecionar um período pré-definido,
      // aí sim precisa mudar:
      if (selectedPeriod !== "custom") {
        setSelectedPeriod("custom");
      }
    },
    [selectedPeriod] // Adiciona selectedPeriod como dependência
  );

  const handleApplyCustomRange = useCallback(() => {
    if (tempDateRange.startDate && tempDateRange.endDate) {
      const start = parseISO(tempDateRange.startDate);
      const end = parseISO(tempDateRange.endDate);
      if (isValid(start) && isValid(end) && start <= end) {
        // Certifique-se que o período está como custom antes de chamar onChange
        // Isso já deve ser verdade, mas é uma garantia extra.
        if (selectedPeriod !== "custom") {
          setSelectedPeriod("custom");
        }
        onChange({
          startDate: tempDateRange.startDate,
          endDate: tempDateRange.endDate,
        });
      } else {
        console.error("Datas inválidas ou data inicial após data final.");
      }
    }
  }, [tempDateRange, onChange, selectedPeriod]); // Adiciona selectedPeriod como dependência

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleMeasurementToggle = (measurementId: string) => {
    const newSelected = localSelectedMeasurements.includes(measurementId)
      ? localSelectedMeasurements.filter((id) => id !== measurementId)
      : [...localSelectedMeasurements, measurementId];

    setLocalSelectedMeasurements(newSelected);
    onMeasurementsChange?.(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = measurements.map((m) => m.id);
    setLocalSelectedMeasurements(allIds);
    onMeasurementsChange?.(allIds);
  };

  const handleDeselectAll = () => {
    setLocalSelectedMeasurements([]);
    onMeasurementsChange?.([]);
  };

  const startDateValue = tempDateRange.startDate
    ? parseISO(tempDateRange.startDate)
    : null;
  const endDateValue = tempDateRange.endDate
    ? parseISO(tempDateRange.endDate)
    : null;
  const isStartDateValid = isValid(startDateValue);
  const isEndDateValid = isValid(endDateValue);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecione o Período
      </Typography>

      {/* Container Apenas para os Botões de Período */}
      <Box sx={{ mb: 2 }}>
        {" "}
        {/* Adiciona margem inferior para separar dos DatePickers */}
        <ToggleButtonGroup
          value={selectedPeriod}
          exclusive
          onChange={handlePeriodChange}
          aria-label="período de tempo"
          size="small"
          sx={{
            display: "flex",
            flexWrap: "wrap", // Mantém o wrap para telas menores
            gap: 1,
            // mb: selectedPeriod === "custom" ? { xs: 2, sm: 0 } : 0, // REMOVIDO
            "& .MuiToggleButton-root": {
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: "8px !important",
              color: "text.secondary",
              textTransform: "none",
              px: 2,
              py: 1,
              flexShrink: 0,
              "&:hover": { borderColor: "primary.main" },
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                borderColor: "primary.main",
                "&:hover": { backgroundColor: "primary.dark" },
              },
            },
          }}
        >
          <ToggleButton value="1m" aria-label="último mês">
            1 mês
          </ToggleButton>
          <ToggleButton value="3m" aria-label="últimos 3 meses">
            3 meses
          </ToggleButton>
          <ToggleButton value="6m" aria-label="últimos 6 meses">
            6 meses
          </ToggleButton>
          <ToggleButton value="1y" aria-label="último ano">
            1 ano
          </ToggleButton>
          <ToggleButton value="custom" aria-label="personalizado">
            Personalizado
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Container Condicional para os Seletores de Data Personalizados */}
      {selectedPeriod === "custom" && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={{ width: "100%", flexGrow: 1, mb: 3 }} // Adiciona margem inferior geral aqui
        >
          <DatePicker
            label="Data Inicial"
            value={isStartDateValid ? startDateValue : null}
            onChange={(date) => handleCustomDateChange("start", date)}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                },
              },
            }}
          />
          <DatePicker
            label="Data Final"
            value={isEndDateValid ? endDateValue : null}
            onChange={(date) => handleCustomDateChange("end", date)}
            format="dd/MM/yyyy"
            minDate={isStartDateValid ? startDateValue : undefined}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiOutlinedInput-root": { borderRadius: "8px" },
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleApplyCustomRange}
            disabled={
              !tempDateRange.startDate ||
              !tempDateRange.endDate ||
              !isStartDateValid ||
              !isEndDateValid ||
              (isStartDateValid &&
                isEndDateValid &&
                startDateValue! > endDateValue!)
            }
            size="small"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Aplicar
          </Button>
        </Stack>
      )}

      {/* Container para contagem e filtro de avaliações */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {Array.isArray(measurements) ? measurements.length : 0} avaliações
          encontradas no período
          {localSelectedMeasurements.length > 0 && (
            <Typography
              component="span"
              variant="body2"
              color="primary"
              sx={{ ml: 0.5 }}
            >
              ,{" "}
              {localSelectedMeasurements.length === measurements.length
                ? "todas selecionadas"
                : `${localSelectedMeasurements.length} selecionadas`}
            </Typography>
          )}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Filtrar avaliações">
            <Button
              onClick={handleFilterClick}
              size="small"
              color={
                localSelectedMeasurements.length > 0 ? "primary" : "inherit"
              }
              startIcon={<FilterListIcon />}
              sx={{
                textTransform: "none",
                minWidth: "auto",
                px: 1.5,
              }}
            >
              Filtrar Avaliações
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Menu de seleção de avaliações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            maxHeight: 500,
            width: 400,
            "& .MuiMenuItem-root": {
              py: 1.5,
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Selecionar Avaliações
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={handleSelectAll}
              variant="outlined"
              fullWidth
            >
              Selecionar Todas
            </Button>
            <Button
              size="small"
              onClick={handleDeselectAll}
              variant="outlined"
              fullWidth
            >
              Desmarcar Todas
            </Button>
          </Stack>
        </Box>
        <Box
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.2)",
              borderRadius: "4px",
            },
          }}
        >
          {measurements.map((measurement) => (
            <MenuItem
              key={measurement.id}
              onClick={() => handleMeasurementToggle(measurement.id)}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <Checkbox
                edge="start"
                checked={localSelectedMeasurements.includes(measurement.id)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {format(parseISO(measurement.date), "dd/MM/yyyy")}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {measurement.value && (
                      <Typography variant="body2" color="text.secondary">
                        Valor: {measurement.value}
                      </Typography>
                    )}
                    {measurement.type && (
                      <Typography variant="body2" color="text.secondary">
                        Tipo: {measurement.type}
                      </Typography>
                    )}
                  </Stack>
                }
              />
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Box>
  );
}
