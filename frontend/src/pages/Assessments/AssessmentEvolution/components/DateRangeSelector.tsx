import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
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

// Defina ou importe seu tipo Measurement
export interface Measurement {
  id: string;
  date: string; // "yyyy-MM-dd"
  value: number;
  type: string;
}

interface DateRangeSelectorProps {
  value: {
    startDate?: string; // Espera "yyyy-MM-dd"
    endDate?: string; // Espera "yyyy-MM-dd"
  };
  onChange: (value: { startDate?: string; endDate?: string }) => void;
  measurements: Measurement[]; // Ou apenas a contagem, se preferir: measurementCount: number;
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
}: DateRangeSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(() =>
    getPeriodFromDates(value.startDate, value.endDate)
  );
  const [tempDateRange, setTempDateRange] = useState({
    startDate: value.startDate,
    endDate: value.endDate,
  });

  // Efeito para SINCRONIZAR estado interno com MUDANÇAS no 'value' vindo do pai
  useEffect(() => {
    const effectivePeriod = getPeriodFromDates(value.startDate, value.endDate);
    setSelectedPeriod(effectivePeriod);
    setTempDateRange({
      startDate: value.startDate,
      endDate: value.endDate,
    });
  }, [value]);

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

      {/* Mantém a exibição da contagem */}
      <Typography variant="body2" color="text.secondary">
        {Array.isArray(measurements) ? measurements.length : 0} avaliações
        encontradas no período selecionado
      </Typography>
    </Box>
  );
}
