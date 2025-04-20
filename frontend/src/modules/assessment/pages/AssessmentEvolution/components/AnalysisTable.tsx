import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { Measurement } from "@/modules/patient/services/patientService";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface AnalysisTableProps {
  measurements: Measurement[];
}

interface AnalysisParameter {
  label: string;
  getValue: (m: Measurement) => string | number;
  getVariation?: (current: number, previous: number) => React.ReactNode;
  unit?: string;
  getClassification?: (value: string | number) => string;
}

export function AnalysisTable({ measurements }: AnalysisTableProps) {
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const calculateIMC = (
    weight: number | string | null | undefined,
    height: number | string | null | undefined
  ) => {
    if (!weight || !height) return "-";
    const weightNum = typeof weight === "string" ? parseFloat(weight) : weight;
    const heightNum = typeof height === "string" ? parseFloat(height) : height;
    const heightInMeters = heightNum / 100;
    const imc = weightNum / (heightInMeters * heightInMeters);
    return isNaN(imc) ? "-" : imc.toFixed(1);
  };

  const getIMCClassification = (imcStr: string | number) => {
    const imc = typeof imcStr === "string" ? parseFloat(imcStr) : imcStr;
    if (isNaN(imc)) return "-";
    if (imc < 18.5) return "Baixo peso";
    if (imc < 25) return "Adequado";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
  };

  const calculateRCQ = (measurements: { waist?: number; hip?: number }) => {
    const { waist, hip } = measurements;
    if (!waist || !hip) return "-";
    const rcq = waist / hip;
    return isNaN(rcq) ? "-" : rcq.toFixed(2);
  };

  const formatNumber = (value: number | string | null | undefined) => {
    if (value == null) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "-" : num.toFixed(1);
  };

  const formatVariation = (value: number) => {
    if (value === 0) return null;
    const arrow =
      value > 0 ? (
        <ArrowUpwardIcon sx={{ fontSize: "0.5rem" }} />
      ) : (
        <ArrowDownwardIcon sx={{ fontSize: "0.5rem" }} />
      );
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}
      >
        {arrow} {Math.abs(value).toFixed(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const localDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
      return format(localDate, "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const parameters: AnalysisParameter[] = [
    {
      label: "Peso atual (Kg)",
      getValue: (m) => formatNumber(m.weight),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Altura atual (cm)",
      getValue: (m) => formatNumber(m.height),
    },
    {
      label: "Índice de Massa Corporal (Kg/m²)",
      getValue: (m) => calculateIMC(m.weight, m.height),
      getVariation: (current, previous) => formatVariation(current - previous),
      getClassification: getIMCClassification,
    },
    {
      label: "Relação da Cintura/Quadril (RCQ)",
      getValue: (m) => calculateRCQ(m.measurements),
      getVariation: (current, previous) => formatVariation(current - previous),
      getClassification: (rcq) => (Number(rcq) > 0.85 ? "Moderado" : "Baixo"),
    },
    {
      label: "Circ. Musc. do Braço (CMB) (cm)",
      getValue: (m) => formatNumber(m.measurements?.arm),
      getClassification: () => "Adequado",
    },
    {
      label: "Percentual de Gordura (%)",
      getValue: (m) => formatNumber(m.bodyFat),
      getVariation: (current, previous) => formatVariation(current - previous),
      getClassification: () => "Adequada",
    },
    {
      label: "Massa de gordura (Kg)",
      getValue: (m) => formatNumber(m.fatMass),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa residual (Kg)",
      getValue: (m) => {
        const weight = Number(m.weight);
        const fatMass = Number(m.fatMass || 0);
        const residual = weight - fatMass;
        return isNaN(residual) ? "-" : residual.toFixed(1);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa livre de gordura (Kg)",
      getValue: (m) => formatNumber(m.fatFreeMass),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Somatório de Dobras (mm)",
      getValue: (m) => {
        if (!m.skinfolds) return "-";
        const sum = Object.values(m.skinfolds).reduce(
          (acc, val) => acc + (val || 0),
          0
        );
        return sum.toFixed(0);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Densidade Corporal (g/mL)",
      getValue: () => {
        const bodyDensity = 1.06; // Exemplo fixo, ajuste conforme necessário
        return bodyDensity.toFixed(3);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
  ];

  const anthropometricParameters: AnalysisParameter[] = [
    {
      label: "Dobra Tricipital (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.tricipital),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra Bicipital (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.bicipital),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra Abdominal (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.abdominal),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra Subescapular (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.subscapular),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra Axilar Média (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.axillaryMedian),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra da Coxa (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.thigh),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra Torácica (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.thoracic),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra Supra-ilíaca (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.suprailiac),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra da Panturrilha (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.calf),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Dobra Supra-espinhal (mm)",
      getValue: (m) => formatNumber(m.skinfolds?.supraspinal),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
  ];

  const renderTable = (title: string, parameters: AnalysisParameter[]) => (
    <TableContainer sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
        {title}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "1rem",
              }}
            >
              Parâmetro
            </TableCell>
            {sortedMeasurements.map((m) => (
              <TableCell
                key={m.id}
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  fontSize: "0.9rem",
                }}
              >
                {formatDate(m.date)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {parameters.map((param, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                {param.label}
              </TableCell>
              {sortedMeasurements.map((measurement, mIndex) => {
                const value = param.getValue(measurement);
                const prevValue =
                  mIndex > 0
                    ? param.getValue(sortedMeasurements[mIndex - 1])
                    : null;
                const variation =
                  mIndex > 0 &&
                  param.getVariation &&
                  !isNaN(Number(value)) &&
                  !isNaN(Number(prevValue))
                    ? param.getVariation(Number(value), Number(prevValue))
                    : "";
                const classification = param.getClassification?.(value) || "";

                return (
                  <TableCell key={measurement.id} align="center">
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Typography component="span" sx={{ fontWeight: 500 }}>
                        {value}
                      </Typography>
                      {variation && (
                        <Typography
                          component="span"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.7em",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          {variation}
                        </Typography>
                      )}
                    </span>
                    {classification && (
                      <Typography
                        component="div"
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {classification}
                      </Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      {renderTable("Análises básicas", parameters)}
      {renderTable("Medidas antropométricas", anthropometricParameters)}
    </>
  );
}
