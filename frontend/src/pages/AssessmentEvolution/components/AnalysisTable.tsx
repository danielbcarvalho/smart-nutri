import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import { format } from "date-fns";
import { Measurement } from "../../../services/patientService";

interface AnalysisTableProps {
  measurements: Measurement[];
}

interface AnalysisParameter {
  label: string;
  getValue: (m: Measurement) => string | number;
  getVariation?: (current: number, previous: number) => string;
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
    if (value === 0) return "(0)";
    return value > 0 ? `(+${value.toFixed(1)})` : `(${value.toFixed(1)})`;
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
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Parâmetro</TableCell>
              {sortedMeasurements.map((m) => (
                <TableCell key={m.id} align="center">
                  {formatDate(m.date)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {parameters.map((param, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {param.label}
                </TableCell>
                {sortedMeasurements.map((measurement, mIndex) => {
                  const value = param.getValue(measurement);
                  const previousMeasurement = sortedMeasurements[mIndex - 1];
                  let variation = "";
                  if (
                    previousMeasurement &&
                    param.getVariation &&
                    typeof value === "number"
                  ) {
                    const previousValue = param.getValue(previousMeasurement);
                    if (typeof previousValue === "number") {
                      variation = param.getVariation(value, previousValue);
                    }
                  }

                  return (
                    <TableCell key={measurement.id} align="center">
                      {value}{" "}
                      {variation && (
                        <span style={{ color: "gray" }}>{variation}</span>
                      )}
                      {param.getClassification && (
                        <div style={{ color: "gray", fontSize: "0.8em" }}>
                          {param.getClassification(value)}
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <Paper sx={{ p: 2 }}>
      {renderTable("Análises básicas", parameters)}
      {renderTable("Medidas antropométricas", anthropometricParameters)}
    </Paper>
  );
}
