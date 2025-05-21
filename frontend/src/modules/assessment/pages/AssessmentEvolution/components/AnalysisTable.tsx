import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  useTheme,
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
  const theme = useTheme();

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Usar todas as medições disponíveis
  const displayedMeasurements = sortedMeasurements;

  const formatNumber = (
    value: number | string | null | undefined,
    precision: number = 1
  ) => {
    if (value == null) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "-" : num.toFixed(precision);
  };

  const formatVariation = (value: number) => {
    if (value === 0 || isNaN(value)) return null;
    const arrow =
      value > 0 ? (
        <ArrowUpwardIcon sx={{ fontSize: "0.5rem" }} />
      ) : (
        <ArrowDownwardIcon sx={{ fontSize: "0.5rem" }} />
      );
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
        }}
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
      return format(localDate, "dd/MM/yy");
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
      getValue: (m) => {
        if (!m.weight || !m.height) return "-";
        const weight = parseFloat(String(m.weight));
        const height = parseFloat(String(m.height)) / 100;
        if (height === 0) return "-";
        const imc = weight / (height * height);
        return isNaN(imc) ? "-" : imc.toFixed(1);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Relação da Cintura/Quadril (RCQ)",
      getValue: (m) => {
        if (!m.measurements?.waist || !m.measurements?.hip) return "-";
        const waist = m.measurements.waist;
        const hip = m.measurements.hip;
        if (hip === 0) return "-";
        const rcq = waist / hip;
        return isNaN(rcq) ? "-" : rcq.toFixed(2);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "% Gordura",
      getValue: (m) => formatNumber(m.bodyFat),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa Gorda (Kg)",
      getValue: (m) => formatNumber(m.fatMass),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa Livre Gordura (Kg)",
      getValue: (m) => formatNumber(m.fatFreeMass),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa Muscular (Kg)",
      getValue: (m) => formatNumber(m.muscleMass),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa Óssea (Kg)",
      getValue: (m) => formatNumber(m.boneMass),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
  ];

  const skinfoldParameters: AnalysisParameter[] = [
    {
      label: "Tricipital",
      getValue: (m) => formatNumber(m.skinfolds?.tricipital),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Bicipital",
      getValue: (m) => formatNumber(m.skinfolds?.bicipital),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Abdominal",
      getValue: (m) => formatNumber(m.skinfolds?.abdominal),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Subescapular",
      getValue: (m) => formatNumber(m.skinfolds?.subscapular),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Axilar Média",
      getValue: (m) => formatNumber(m.skinfolds?.axillaryMedian),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Coxa",
      getValue: (m) => formatNumber(m.skinfolds?.thigh),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Torácica",
      getValue: (m) => formatNumber(m.skinfolds?.thoracic),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Supra-ilíaca",
      getValue: (m) => formatNumber(m.skinfolds?.suprailiac),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Panturrilha",
      getValue: (m) => formatNumber(m.skinfolds?.calf),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Supra-espinhal",
      getValue: (m) => formatNumber(m.skinfolds?.supraspinal),
      getVariation: (c, p) => formatVariation(c - p),
    },
  ];

  const circumferenceParameters: AnalysisParameter[] = [
    {
      label: "Pescoço",
      getValue: (m) => formatNumber(m.measurements?.neck),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Ombros",
      getValue: (m) => formatNumber(m.measurements?.shoulder),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Tórax",
      getValue: (m) => formatNumber(m.measurements?.chest),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Cintura",
      getValue: (m) => formatNumber(m.measurements?.waist),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Quadril",
      getValue: (m) => formatNumber(m.measurements?.hip),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Abdômen",
      getValue: (m) => formatNumber(m.measurements?.abdomen),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Braço Relax. E.",
      getValue: (m) => formatNumber(m.measurements?.relaxedArmLeft),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Braço Relax. D.",
      getValue: (m) => formatNumber(m.measurements?.relaxedArmRight),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Braço Contr. E.",
      getValue: (m) => formatNumber(m.measurements?.contractedArmLeft),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Braço Contr. D.",
      getValue: (m) => formatNumber(m.measurements?.contractedArmRight),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Antebraço E.",
      getValue: (m) => formatNumber(m.measurements?.forearmLeft),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Antebraço D.",
      getValue: (m) => formatNumber(m.measurements?.forearmRight),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Coxa Prox. E.",
      getValue: (m) => formatNumber(m.measurements?.proximalThighLeft),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Coxa Prox. D.",
      getValue: (m) => formatNumber(m.measurements?.proximalThighRight),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Coxa Med. E.",
      getValue: (m) => formatNumber(m.measurements?.medialThighLeft),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Coxa Med. D.",
      getValue: (m) => formatNumber(m.measurements?.medialThighRight),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Coxa Dist. E.",
      getValue: (m) => formatNumber(m.measurements?.distalThighLeft),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Coxa Dist. D.",
      getValue: (m) => formatNumber(m.measurements?.distalThighRight),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Panturrilha E.",
      getValue: (m) => formatNumber(m.measurements?.calfLeft),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Panturrilha D.",
      getValue: (m) => formatNumber(m.measurements?.calfRight),
      getVariation: (c, p) => formatVariation(c - p),
    },
  ];

  const renderTable = (title: string, params: AnalysisParameter[]) => {
    const filteredParameters = params.filter((param) => {
      return displayedMeasurements.some((measurement) => {
        const value = param.getValue(measurement);
        return value !== "-" && value !== null && value !== undefined;
      });
    });

    if (filteredParameters.length === 0) {
      return null;
    }

    return (
      <TableContainer component={Paper} sx={{ mb: 2, overflowX: "auto" }}>
        <Typography
          variant="subtitle1"
          sx={{
            p: 1.5,
            fontWeight: "bold",
          }}
        >
          {title}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: "0.875rem",
                  py: 0.5,
                  width: "200px",
                  minWidth: "200px",
                  maxWidth: "200px",
                  borderBottom: `2px solid ${theme.palette.divider}`,
                }}
              >
                Parâmetro
              </TableCell>
              {displayedMeasurements.map((m, index) => (
                <TableCell
                  key={m.id || `header-${index}`}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: "text.secondary",
                    fontSize: "0.8rem",
                    py: 0.5,
                    borderBottom: `2px solid ${theme.palette.divider}`,
                  }}
                >
                  {formatDate(m.date)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredParameters.map((param, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: theme.palette.grey[50],
                  },
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 500, fontSize: "0.8rem", py: 0.75 }}
                >
                  {param.label}
                </TableCell>
                {displayedMeasurements.map((measurement, mIndex) => {
                  const value = param.getValue(measurement);

                  let prevValue: string | number | null = null;
                  const currentMeasurementOriginalIndex =
                    sortedMeasurements.findIndex(
                      (sm) => sm.id === measurement.id
                    );
                  if (currentMeasurementOriginalIndex > 0) {
                    prevValue = param.getValue(
                      sortedMeasurements[currentMeasurementOriginalIndex - 1]
                    );
                  }

                  const variation =
                    currentMeasurementOriginalIndex > 0 &&
                    param.getVariation &&
                    !isNaN(Number(value)) &&
                    prevValue !== null &&
                    !isNaN(Number(prevValue))
                      ? param.getVariation(Number(value), Number(prevValue))
                      : "";
                  const classification = param.getClassification?.(value) || "";

                  return (
                    <TableCell
                      key={measurement.id || `cell-${mIndex}`}
                      align="center"
                      sx={{ py: 0.75 }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          {value}
                        </Typography>
                        {variation && (
                          <Typography
                            component="span"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.75rem",
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
                          sx={{ mt: 0.25, fontSize: "0.7rem" }}
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
  };

  if (displayedMeasurements.length === 0) {
    return (
      <Typography sx={{ p: 2, textAlign: "center" }}>
        Nenhuma medição disponível para exibir.
      </Typography>
    );
  }

  return (
    <>
      {renderTable("Análises Antropométricas", parameters)}
      {renderTable("Circunferências (cm)", circumferenceParameters)}
      {renderTable("Dobras Cutâneas (mm)", skinfoldParameters)}
    </>
  );
}
