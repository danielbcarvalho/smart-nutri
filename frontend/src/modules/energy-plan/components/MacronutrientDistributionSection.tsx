import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Alert,
  useMediaQuery,
  TextField,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useTheme } from "@mui/material/styles";

interface MacronutrientDistributionSectionProps {
  peso: number; // em kg
  get: number; // Gasto Energético Total em kcal
  onDistributionChange: (distribution: {
    proteins: number;
    carbs: number;
    fats: number;
  }) => void;
  macronutrientDistribution?: {
    proteins: number;
    carbs: number;
    fats: number;
  };
}

// Estrutura de dados dos macronutrientes
const MACROS = [
  {
    key: "proteins",
    label: "Proteínas",
    description: "Distribuição das proteínas no planejamento", // Mantido nos dados, mas não exibido
    colorToken: "teal", // Usar tokens de cor ou cores diretas
    refRange: "10 - 35 %",
    refSource: "Food and Nutrition Board / IOM",
    kcalPerGram: 4,
    min: 0, // Alterado para permitir de 0 a 100
    max: 100, // Alterado para permitir de 0 a 100
    order: 1,
  },
  {
    key: "carbs",
    label: "Carboidratos",
    description: "Distribuição dos carboidratos no planejamento",
    colorToken: "orange",
    refRange: "45 - 65 %",
    refSource: "Food and Nutrition Board / IOM",
    kcalPerGram: 4,
    min: 0, // Alterado para permitir de 0 a 100
    max: 100, // Alterado para permitir de 0 a 100
    order: 2,
  },
  {
    key: "fats",
    label: "Lipídios",
    description: "Distribuição dos lipídios no planejamento",
    colorToken: "crimson",
    refRange: "20 - 35 %",
    refSource: "Food and Nutrition Board / IOM",
    kcalPerGram: 9,
    min: 0, // Alterado para permitir de 0 a 100
    max: 100, // Alterado para permitir de 0 a 100
    order: 3,
  },
];

// Função para obter a cor do macronutriente
const getColor = (
  macroKey: string,
  theme: import("@mui/material/styles").Theme
) => {
  // Idealmente, estas cores viriam do tema ou seriam mais configuráveis
  switch (macroKey) {
    case "proteins":
      return theme.palette.success.main; // Ex: Verde para proteínas
    case "carbs":
      return theme.palette.warning.main; // Ex: Laranja para carboidratos
    case "fats":
      return theme.palette.error.main; // Ex: Vermelho para lipídios
    default:
      return theme.palette.grey[500];
  }
};

const MacronutrientDistributionSection: React.FC<
  MacronutrientDistributionSectionProps
> = ({ peso, get, onDistributionChange, macronutrientDistribution }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [percents, setPercents] = React.useState<number[]>([
    macronutrientDistribution?.proteins ?? 20,
    macronutrientDistribution?.carbs ?? 50,
    macronutrientDistribution?.fats ?? 30,
  ]);

  React.useEffect(() => {
    if (macronutrientDistribution) {
      setPercents([
        macronutrientDistribution.proteins,
        macronutrientDistribution.carbs,
        macronutrientDistribution.fats,
      ]);
    }
  }, [macronutrientDistribution]);

  // Soma dos percentuais, tratando valores inválidos como zero
  const totalPercentSum = percents.reduce(
    (sum, current) => sum + (Number.isFinite(current) ? current : 0),
    0
  );

  // --- LAYOUT DESKTOP ---
  const DesktopView = (
    <Box>
      {/* Cabeçalhos das Colunas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1.5fr 0.8fr 0.8fr 1fr",
          gap: theme.spacing(2),
          alignItems: "center",
          py: 1,
          px: 1.5, // Padding horizontal para alinhar com conteúdo das linhas
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight="fontWeightMedium"
          sx={{ textAlign: "left" }}
        >
          Macronutriente
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight="fontWeightMedium"
          sx={{ textAlign: "center" }}
        >
          % Calorias
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight="fontWeightMedium"
          sx={{ textAlign: "center" }}
        >
          Gramas (g)
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight="fontWeightMedium"
          sx={{ textAlign: "center" }}
        >
          g/kg
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight="fontWeightMedium"
          sx={{ textAlign: "center" }}
        >
          Referência
        </Typography>
      </Box>

      {/* Linhas de Macronutrientes */}
      {MACROS.sort((a, b) => a.order - b.order).map((macro, idx) => {
        const percent = percents[idx];
        const grams =
          get > 0 && macro.kcalPerGram > 0
            ? (get * (percent / 100)) / macro.kcalPerGram
            : 0;
        const gramsPerKg = peso > 0 ? grams / peso : 0;
        const macroColor = getColor(macro.key, theme);

        return (
          <Box
            key={macro.key}
            sx={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1.5fr 0.8fr 0.8fr 1fr",
              gap: theme.spacing(2),
              alignItems: "center",
              py: 1,
              px: 1.5,
              mb: 1,
              background:
                idx % 2 === 0 ? theme.palette.action.hover : "transparent", // Alternar background para melhor leitura
              borderRadius: theme.shape.borderRadius,
              transition: "background-color 0.3s",
              "&:hover": {
                background: theme.palette.action.selected,
              },
            }}
          >
            {/* Coluna 1: Nome do Macronutriente */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="span"
                sx={{
                  width: 10,
                  height: 10,
                  bgcolor: macroColor,
                  borderRadius: "50%",
                  mr: 1.5,
                }}
              />
              <Typography variant="body1" fontWeight="fontWeightMedium">
                {macro.label}
              </Typography>
            </Box>

            {/* Coluna 2: Slider e Porcentagem + Input */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: 1,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <TextField
                  value={percents[idx]}
                  onChange={(e) => {
                    let val =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    if (isNaN(val)) val = 0;
                    if (val < macro.min) val = macro.min;
                    if (val > macro.max) val = macro.max;
                    const newPercents = [...percents];
                    newPercents[idx] = val;
                    setPercents(newPercents);
                    onDistributionChange({
                      proteins: newPercents[0],
                      carbs: newPercents[1],
                      fats: newPercents[2],
                    });
                  }}
                  type="number"
                  size="small"
                  inputProps={{
                    min: macro.min,
                    max: macro.max,
                    style: {
                      textAlign: "center",
                      MozAppearance: "textfield",
                      fontSize: 13,
                    },
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  sx={{
                    ml: 1,
                    "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
                      {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                    "& input": {
                      fontSize: 13,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight="fontWeightMedium"
                  sx={{ ml: 1 }}
                >
                  %
                </Typography>
              </Box>
            </Box>

            {/* Coluna 3: Gramas */}
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              {Math.round(grams)}g
            </Typography>

            {/* Coluna 4: g/kg */}
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              {gramsPerKg.toFixed(2)}
            </Typography>

            {/* Coluna 5: Referência */}
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              {macro.refRange}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  // --- LAYOUT MOBILE ---
  const MobileView = (
    <Box>
      {MACROS.sort((a, b) => a.order - b.order).map((macro, idx) => {
        const percent = percents[idx];
        const grams =
          get > 0 && macro.kcalPerGram > 0
            ? (get * (percent / 100)) / macro.kcalPerGram
            : 0;
        const gramsPerKg = peso > 0 ? grams / peso : 0;
        const macroColor = getColor(macro.key, theme);

        return (
          <Box
            key={macro.key}
            sx={{
              background: theme.palette.background.paper, // Usar paper para contraste em modo escuro
              borderRadius: theme.shape.borderRadius * 2,
              mb: 2,
              p: 2,
              boxShadow: theme.shadows[2], // Usar theme shadows
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="span"
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: macroColor,
                  borderRadius: "50%",
                  mr: 1,
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontSize: "1.1rem", fontWeight: "fontWeightMedium" }}
              >
                {macro.label}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="subtitle1" fontWeight="fontWeightMedium">
                {percent}%
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", // Grid responsivo para os valores
                gap: 2,
                textAlign: "center", // Centralizar texto nos items do grid
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Gramas
                </Typography>
                <Typography variant="body1" fontWeight="fontWeightMedium">
                  {Math.round(grams)}g
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  g/kg
                </Typography>
                <Typography variant="body1" fontWeight="fontWeightMedium">
                  {gramsPerKg.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Ref.
                </Typography>
                <Typography variant="body2">{macro.refRange}</Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 3,
        overflow: "visible" /* Para valueLabel do Slider não cortar */,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="fontWeightBold" gutterBottom>
          Distribuição dos Macronutrientes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Defina a distribuição dos macronutrientes.
        </Typography>
        {/* Divider removido daqui, o cabeçalho do DesktopView tem sua própria borda */}

        {isMobile ? MobileView : DesktopView}

        {totalPercentSum !== 100 && (
          <Alert severity="warning" sx={{ mt: 2, mb: 0 }}>
            A soma das porcentagens ({totalPercentSum}%) deve ser 100%.
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            mt: 2,
            pt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tooltip
            title={MACROS[0].refSource} /* Exibe a fonte ao passar o mouse */
          >
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            Fonte: {MACROS[0].refSource}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MacronutrientDistributionSection;
