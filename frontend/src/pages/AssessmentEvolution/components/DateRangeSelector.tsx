import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Measurement } from "../../../services/patientService";

interface DateRangeSelectorProps {
  value: {
    startDate?: string;
    endDate?: string;
  };
  onChange: (value: { startDate?: string; endDate?: string }) => void;
  measurements: Measurement[];
}

type PeriodOption = "1m" | "3m" | "6m" | "1y" | "custom";

export function DateRangeSelector({
  value,
  onChange,
  measurements,
}: DateRangeSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(() => {
    if (value.startDate && value.endDate) {
      return "custom";
    }
    return "3m";
  });

  const [tempDateRange, setTempDateRange] = useState({
    startDate: value.startDate,
    endDate: value.endDate,
  });

  const handlePeriodChange = (
    _: React.MouseEvent<HTMLElement>,
    newPeriod: PeriodOption
  ) => {
    if (!newPeriod) return;
    setSelectedPeriod(newPeriod);

    if (newPeriod === "custom") {
      // Apenas muda para modo customizado sem alterar as datas
      return;
    }

    const today = new Date();
    let startDate: Date;
    const endDate = today;

    switch (newPeriod) {
      case "1m":
        startDate = subMonths(today, 1);
        break;
      case "3m":
        startDate = subMonths(today, 3);
        break;
      case "6m":
        startDate = subMonths(today, 6);
        break;
      case "1y":
        startDate = subMonths(today, 12);
        break;
      default:
        return;
    }

    const newRange = {
      startDate: format(startOfMonth(startDate), "yyyy-MM-dd"),
      endDate: format(endOfMonth(endDate), "yyyy-MM-dd"),
    };

    setTempDateRange(newRange);
    onChange(newRange);
  };

  const handleCustomDateChange = (type: "start" | "end", date: Date | null) => {
    if (!date) return;

    const newTempRange = {
      ...tempDateRange,
      [type === "start" ? "startDate" : "endDate"]: format(date, "yyyy-MM-dd"),
    };
    setTempDateRange(newTempRange);
  };

  const handleApplyCustomRange = () => {
    if (tempDateRange.startDate && tempDateRange.endDate) {
      setSelectedPeriod("custom");
      onChange(tempDateRange);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecione o Período
      </Typography>
      <Box sx={{ p: 1, mb: 3, borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={selectedPeriod}
            exclusive
            onChange={handlePeriodChange}
            aria-label="período de tempo"
            size="small"
            sx={{
              flexWrap: "wrap",
              gap: 1,
              "& .MuiToggleButton-root": {
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: "8px !important",
                color: "text.secondary",
                textTransform: "none",
                px: 2,
                py: 1,
                "&:hover": {
                  borderColor: "primary.main",
                },
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  borderColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
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

          {selectedPeriod === "custom" && (
            <Stack direction="row" spacing={2} alignItems="center">
              <DatePicker
                label="Data Inicial"
                value={
                  tempDateRange.startDate
                    ? new Date(tempDateRange.startDate)
                    : null
                }
                onChange={(date) => handleCustomDateChange("start", date)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    },
                  },
                }}
              />
              <DatePicker
                label="Data Final"
                value={
                  tempDateRange.endDate ? new Date(tempDateRange.endDate) : null
                }
                onChange={(date) => handleCustomDateChange("end", date)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleApplyCustomRange}
                disabled={!tempDateRange.startDate || !tempDateRange.endDate}
                size="small"
              >
                Aplicar
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary">
        {measurements.length} avaliações selecionadas
      </Typography>
    </Box>
  );
}
