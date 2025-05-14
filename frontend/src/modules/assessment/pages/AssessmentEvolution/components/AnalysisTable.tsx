import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper, // Adicionado para melhor contenção visual
  useTheme, // Para acessar cores do tema para zebra striping
} from "@mui/material";
import { format } from "date-fns";
import { Measurement } from "@/modules/patient/services/patientService";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { bodyDensityFormulas } from "../../../calcs/formulas"; // Mock se não disponível
import {
  calculateBodyDensity,
  calculateResidualWeight,
  calculateFatMass,
  calculateBodyFatPercentage,
} from "../../../calcs/anthropometricCalculations/bodyComposition"; // Mock se não disponível

// --- MOCKS para dependências externas (remover se tiver os arquivos reais) ---
// Mock para bodyDensityFormulas se o arquivo não estiver disponível neste contexto
const mockBodyDensityFormulas = [
  {
    id: "pollock7",
    name: "Pollock 7 Dobras",
    requiredSkinfolds: [
      "tricipital",
      "subscapular",
      "thoracic",
      "axillaryMedian",
      "suprailiac",
      "abdominal",
      "thigh",
    ],
  },
  {
    id: "pollock3",
    name: "Pollock 3 Dobras",
    requiredSkinfolds: ["thoracic", "abdominal", "thigh"],
  }, // Exemplo
  // Adicione outras fórmulas conforme necessário
];
const actualBodyDensityFormulas =
  typeof bodyDensityFormulas !== "undefined"
    ? bodyDensityFormulas
    : mockBodyDensityFormulas;

// Mock para funções de cálculo se os arquivos não estiverem disponíveis
const mockCalculateBodyDensity = (
  skinfolds: Record<string, string>,
  gender: string,
  age: number,
  formulaId: string
) => {
  // Simulação básica
  let sum = 0;
  const formula = actualBodyDensityFormulas.find((f) => f.id === formulaId);
  if (formula) {
    formula.requiredSkinfolds.forEach((key) => {
      sum += parseFloat(skinfolds[key] || "0");
    });
  }
  // Esta é uma simulação MUITO simplificada. A densidade real depende da fórmula.
  const density = 1.1 - sum / 10000;
  return { density: density > 0 ? density : 0, sumOfSkinfolds: sum };
};
const mockCalculateResidualWeight = (weight: number, gender: string) =>
  gender === "F" ? weight * 0.21 : weight * 0.24;
const mockCalculateFatMass = (weight: number, bodyFatPercentage: number) =>
  weight * (bodyFatPercentage / 100);
const mockCalculateBodyFatPercentage = (density: number) =>
  (4.95 / density - 4.5) * 100;

const actualCalculateBodyDensity =
  typeof calculateBodyDensity !== "undefined"
    ? calculateBodyDensity
    : mockCalculateBodyDensity;
const actualCalculateResidualWeight =
  typeof calculateResidualWeight !== "undefined"
    ? calculateResidualWeight
    : mockCalculateResidualWeight;
const actualCalculateFatMass =
  typeof calculateFatMass !== "undefined"
    ? calculateFatMass
    : mockCalculateFatMass;
const actualCalculateBodyFatPercentage =
  typeof calculateBodyFatPercentage !== "undefined"
    ? calculateBodyFatPercentage
    : mockCalculateBodyFatPercentage;
// --- FIM DOS MOCKS ---

interface AnalysisTableProps {
  measurements: Measurement[];
  patient?: {
    gender?: string;
    birthDate?: string;
  };
}

interface AnalysisParameter {
  label: string;
  getValue: (m: Measurement) => string | number;
  getVariation?: (current: number, previous: number) => React.ReactNode;
  unit?: string;
  getClassification?: (value: string | number) => string;
}

const MAX_COLUMNS = 3; // Mostrar as últimas 3 medições

export function AnalysisTable({ measurements, patient }: AnalysisTableProps) {
  const theme = useTheme(); // Para zebra striping e cores consistentes

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Pegar apenas as últimas MAX_COLUMNS medições
  const displayedMeasurements = sortedMeasurements.slice(-MAX_COLUMNS);

  const patientAge = patient?.birthDate
    ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
    : 30;

  const patientGender =
    patient?.gender === "F" || patient?.gender === "FEMALE" ? "F" : "M";

  const calculateIMC = (
    weight: number | string | null | undefined,
    height: number | string | null | undefined
  ) => {
    if (!weight || !height) return "-";
    const weightNum = typeof weight === "string" ? parseFloat(weight) : weight;
    const heightNum = typeof height === "string" ? parseFloat(height) : height;
    if (heightNum === 0) return "-"; // Evitar divisão por zero
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

  const calculateRCQ = (measurementsData?: {
    waist?: number;
    hip?: number;
  }) => {
    if (!measurementsData) return "-";
    const { waist, hip } = measurementsData;
    if (!waist || !hip || hip === 0) return "-";
    const rcq = waist / hip;
    return isNaN(rcq) ? "-" : rcq.toFixed(2);
  };

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
      return format(localDate, "dd/MM/yy"); // Formato mais curto para a data
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
    },
    {
      label: "Relação da Cintura/Quadril (RCQ)",
      getValue: (m) => calculateRCQ(m.measurements),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "% Gordura",
      getValue: (m) => {
        if (!m.skinfolds || !m.skinfoldFormula) return "-";
        const formula = actualBodyDensityFormulas.find(
          (f) => f.id === m.skinfoldFormula
        );
        if (!formula) return "-";

        const skinfoldValues: Record<string, string> = {};
        Object.entries(m.skinfolds || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            skinfoldValues[key] = String(value);
          }
        });

        const { density } = actualCalculateBodyDensity(
          skinfoldValues,
          patientGender,
          patientAge,
          m.skinfoldFormula
        );

        if (density <= 0) return "-";
        const bodyFatPercentage = actualCalculateBodyFatPercentage(density);
        return bodyFatPercentage.toFixed(1);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa Gorda (Kg)",
      getValue: (m) => {
        const weight = Number(m.weight);
        // Recalcular %Gordura para consistência, ou usar m.bodyFat se disponível e confiável
        let bodyFatPercent: number | undefined;
        if (m.bodyFat !== undefined && m.bodyFat !== null) {
          bodyFatPercent = Number(m.bodyFat);
        } else if (m.skinfolds && m.skinfoldFormula) {
          const formula = actualBodyDensityFormulas.find(
            (f) => f.id === m.skinfoldFormula
          );
          if (formula) {
            const skinfoldValues: Record<string, string> = {};
            Object.entries(m.skinfolds).forEach(([key, value]) => {
              if (value !== undefined && value !== null)
                skinfoldValues[key] = String(value);
            });
            const { density } = actualCalculateBodyDensity(
              skinfoldValues,
              patientGender,
              patientAge,
              m.skinfoldFormula
            );
            if (density > 0)
              bodyFatPercent = actualCalculateBodyFatPercentage(density);
          }
        }

        if (
          isNaN(weight) ||
          bodyFatPercent === undefined ||
          isNaN(bodyFatPercent)
        )
          return "-";
        const fatMass = actualCalculateFatMass(weight, bodyFatPercent);
        return fatMass.toFixed(1);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa Residual (Kg)",
      getValue: (m) => {
        const weight = Number(m.weight);
        if (isNaN(weight)) return "-";
        const residual = actualCalculateResidualWeight(weight, patientGender);
        return residual.toFixed(1);
      },
      // Variação de massa residual pode não ser tão útil, mas mantemos por consistência
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Massa Livre Gordura (Kg)",
      getValue: (m) => formatNumber(m.fatFreeMass),
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Somatório de Dobras (mm)",
      getValue: (m) => {
        if (!m.skinfolds || !m.skinfoldFormula) return "-";
        const formula = actualBodyDensityFormulas.find(
          (f) => f.id === m.skinfoldFormula
        );
        if (!formula) return "-";

        const protocolSkinfolds = formula.requiredSkinfolds
          .map((fold) => m.skinfolds?.[fold as keyof typeof m.skinfolds] || 0)
          .filter((value: number) => !isNaN(value) && value > 0);

        if (protocolSkinfolds.length === 0) return "-";
        const sum = protocolSkinfolds.reduce(
          (acc: number, curr: number) => acc + curr,
          0
        );
        return sum.toFixed(1);
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
    {
      label: "Densidade Corporal (g/mL)",
      getValue: (m) => {
        if (!m.skinfolds || !m.skinfoldFormula) return "-";
        const formula = actualBodyDensityFormulas.find(
          (f) => f.id === m.skinfoldFormula
        );
        if (!formula) return "-";

        const skinfoldValues: Record<string, string> = {};
        Object.entries(m.skinfolds || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            skinfoldValues[key] = String(value);
          }
        });

        const { density } = actualCalculateBodyDensity(
          skinfoldValues,
          patientGender,
          patientAge,
          m.skinfoldFormula
        );
        return density > 0 ? density.toFixed(4) : "-"; // Aumentar precisão para densidade
      },
      getVariation: (current, previous) => formatVariation(current - previous),
    },
  ];

  const skinfoldParameters: AnalysisParameter[] = [
    // Mantendo os mesmos parâmetros, apenas o display será afetado
    // Os nomes podem ser abreviados se necessário para economizar espaço
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
    // Mantendo os mesmos parâmetros, apenas o display será afetado
    // Os nomes podem ser abreviados
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
      label: "Abdômen",
      getValue: (m) => formatNumber(m.measurements?.abdomen),
      getVariation: (c, p) => formatVariation(c - p),
    },
    {
      label: "Quadril",
      getValue: (m) => formatNumber(m.measurements?.hip),
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
          {" "}
          {/* size="small" reduz o padding automaticamente */}
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "text.primary", // Menos chamativo que primary.main
                  fontSize: "0.875rem",
                  py: 0.5, // Padding vertical menor
                  minWidth: 150, // Para garantir que o nome do parâmetro caiba
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
                  "&:last-child td, &:last-child th": { border: 0 }, // Remove border for the last row cells
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

                  // Encontrar a medição anterior correta na lista original (sortedMeasurements)
                  // para calcular a variação corretamente, mesmo com displayedMeasurements fatiado.
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
                    currentMeasurementOriginalIndex > 0 && // Garante que não é a primeira medição da lista original
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

// Exemplo de tipo Measurement (simplificado)
// Remova ou ajuste conforme sua definição real
// interface Measurement {
//   id: string;
//   date: string;
//   weight?: number | null;
//   height?: number | null;
//   bodyFat?: number | null; // Adicionado para teste de Massa Gorda
//   fatFreeMass?: number | null;
//   skinfoldFormula?: string;
//   measurements?: {
//     waist?: number;
//     hip?: number;
//     neck?: number;
//     shoulder?: number;
//     chest?: number;
//     abdomen?: number;
//     relaxedArmLeft?: number;
//     relaxedArmRight?: number;
//     contractedArmLeft?: number;
//     contractedArmRight?: number;
//     forearmLeft?: number;
//     forearmRight?: number;
//     proximalThighLeft?: number;
//     proximalThighRight?: number;
//     medialThighLeft?: number;
//     medialThighRight?: number;
//     distalThighLeft?: number;
//     distalThighRight?: number;
//     calfLeft?: number;
//     calfRight?: number;
//   };
//   skinfolds?: {
//     tricipital?: number;
//     bicipital?: number;
//     abdominal?: number;
//     subscapular?: number;
//     axillaryMedian?: number;
//     thigh?: number;
//     thoracic?: number;
//     suprailiac?: number;
//     calf?: number;
//     supraspinal?: number;
//   };
// }
