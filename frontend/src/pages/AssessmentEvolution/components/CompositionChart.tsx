import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  TooltipProps,
} from "recharts";
import { Measurement } from "../../../services/patientService";
import { useTheme } from "@mui/material";
import { formatDateToLocal } from "../../../utils/dateUtils";

interface CompositionChartProps {
  measurements: Measurement[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: {
    name: string;
    value: number;
    color: string;
  }[];
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: "2px 0", color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)} kg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CompositionChart({ measurements }: CompositionChartProps) {
  const theme = useTheme();

  const data = useMemo(() => {
    return measurements
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((measurement) => ({
        date: formatDateToLocal(measurement.date),
        pesoTotal: Number(measurement.weight),
        massaGorda: Number(measurement.fatMass || 0),
        massaLivre:
          Number(measurement.weight) - Number(measurement.fatMass || 0),
      }));
  }, [measurements]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="date"
          stroke={theme.palette.text.primary}
          tick={{ fill: theme.palette.text.primary }}
        />
        <YAxis
          stroke={theme.palette.text.primary}
          tick={{ fill: theme.palette.text.primary }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />

        {/* Área sombreada sob a linha de peso total */}
        <Area
          type="monotone"
          dataKey="pesoTotal"
          fill={`${theme.palette.primary.main}15`}
          stroke="none"
        />

        {/* Linha para peso total */}
        <Line
          type="monotone"
          dataKey="pesoTotal"
          name="Massa corporal total"
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{
            r: 4,
            fill: theme.palette.primary.main,
            strokeWidth: 2,
          }}
        />

        {/* Barras empilhadas para massa gorda e massa livre */}
        <Bar
          dataKey="massaGorda"
          name="Massa gordurosa"
          stackId="a"
          fill={theme.palette.warning.light}
          radius={[4, 4, 0, 0]}
          barSize={Math.min(100, 400 / data.length)}
        />
        <Bar
          dataKey="massaLivre"
          name="Massa livre de gordura"
          stackId="a"
          fill={theme.palette.success.light}
          radius={[4, 4, 0, 0]}
          barSize={Math.min(100, 400 / data.length)}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
