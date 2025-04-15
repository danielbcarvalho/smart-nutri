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
import { Measurement } from "../../../services/patientService"; // Ajuste o caminho se necessário
import { useTheme, Box, Typography, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles"; // Importar alpha
import { formatDateToLocal } from "../../../utils/dateUtils"; // Ajuste o caminho se necessário

// Supondo que a interface Measurement seja algo como:
// interface Measurement {
//   id: string;
//   date: string | Date;
//   weight: string | number;
//   fatMass?: string | number | null;
//   // outras propriedades...
// }

interface CompositionChartProps {
  measurements: Measurement[];
}

// Interface para o Tooltip personalizado (sem alterações)
interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: {
    name: string;
    value: number;
    color: string;
    // payload original pode ter mais dados, mas estes são os usados
  }[];
  // label é fornecido automaticamente pelo Recharts (geralmente o valor do dataKey do XAxis)
}

// Tooltip personalizado usando MUI Components
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    // Filtra o payload para não mostrar "Peso Total" no tooltip, se desejado
    // Se quiser manter no tooltip, remova ou comente a linha abaixo
    const filteredPayload = payload.filter(
      (entry) => entry.name !== "Peso Total"
    );

    // Se após filtrar não sobrar nada (e o payload original tinha algo),
    // pode ser que só existia o Peso Total, então talvez mostre algo genérico ou nada.
    // Neste caso, vamos mostrar apenas Massa Livre e Massa Gordurosa se existirem.
    if (filteredPayload.length === 0 && payload.length > 0) {
      // Se o payload original só tinha Peso Total, talvez não renderize o tooltip
      // ou mostre apenas o label. Vamos retornar null por enquanto.
      // return null;
      // Alternativamente, se quiser mostrar o tooltip mesmo só com Peso Total (remova o filtro acima)
    }
    // Se não houver payload filtrado útil, retorna null
    if (filteredPayload.length === 0) return null;

    return (
      <Paper
        elevation={3} // Sombra sutil do tema
        sx={{
          p: 1.5, // Espaçamento interno usando a escala do tema
          bgcolor: alpha(theme.palette.background.paper, 0.97), // Fundo do papel com leve transparência
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius, // Raio de borda padrão do tema
        }}
      >
        {/* Label (Data) */}
        <Typography
          variant="subtitle2"
          component="p"
          sx={{ mb: 1, color: theme.palette.text.primary, fontWeight: "bold" }}
        >
          {label}
        </Typography>
        {/* Mapeia os dados de cada linha/barra/area no ponto */}
        {/* Usa o payload filtrado */}
        {filteredPayload.map((entry, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              my: 0.5,
            }}
          >
            <Typography
              variant="caption"
              component="span" // Usar span para ficar inline se necessário, mas flex cuida disso
              sx={{ color: entry.color, mr: 1 }} // Cor vinda do gráfico, margem direita
            >
              {entry.name}:
            </Typography>
            <Typography
              component="span"
              variant="caption"
              sx={{ fontWeight: "bold", color: theme.palette.text.secondary }}
            >
              {/* Formata o valor com 1 casa decimal e adiciona 'kg' */}
              {typeof entry.value === "number"
                ? `${entry.value.toFixed(1)} kg`
                : "N/A"}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null; // Retorna nulo se o tooltip não estiver ativo
};

// Componente principal do Gráfico
export function CompositionChart({ measurements }: CompositionChartProps) {
  const theme = useTheme();

  // Memoização dos dados processados para evitar recálculos desnecessários
  const data = useMemo(() => {
    if (!measurements) return []; // Retorna array vazio se não houver medições

    return (
      measurements
        // Garante que as datas sejam objetos Date para ordenação segura
        .map((m) => ({ ...m, date: new Date(m.date) }))
        // Ordena as medições pela data, da mais antiga para a mais recente
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        // Mapeia para o formato esperado pelo Recharts
        .map((measurement) => {
          const weight = Number(measurement.weight || 0); // Converte peso para número, default 0
          const fatMass = Number(measurement.fatMass || 0); // Converte massa gorda para número, default 0
          const fatFreeMass = weight - fatMass; // Calcula massa livre

          return {
            date: formatDateToLocal(measurement.date), // Formata a data para exibição local (ex: DD/MM/YYYY)
            pesoTotal: weight,
            massaGorda: fatMass,
            massaLivre: fatFreeMass >= 0 ? fatFreeMass : 0, // Garante que massa livre não seja negativa
          };
        })
    );
  }, [measurements]); // Recalcula apenas se 'measurements' mudar

  // Define as cores baseadas no tema para fácil manutenção
  const pesoTotalColor = theme.palette.primary.main;
  const massaGordaColor = theme.palette.warning.main; // Usando .main para cor mais forte
  const massaLivreColor = theme.palette.success.main;

  // Ajusta a largura da barra: mais larga com poucos dados, mais estreita com muitos.
  const calculatedWidth = 500 / (data.length || 1); // Largura base proporcional inversa ao número de pontos
  const barWidth = Math.max(20, Math.min(120, calculatedWidth)); // Aplica limites: Mínimo 20px, Máximo 120px

  // Se não houver dados, pode exibir uma mensagem ou um placeholder
  if (data.length === 0) {
    return (
      <Box
        sx={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette.text.secondary,
        }}
      >
        <Typography>
          Sem dados de avaliação para exibir no período selecionado.
        </Typography>
      </Box>
    );
  }

  return (
    // Box externo para adicionar padding ao redor do gráfico
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {" "}
      {/* Padding responsivo */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{
            top: 20, // Margem superior aumentada para título/espaçamento
            right: 30, // Margem direita para caber rótulos do eixo Y
            bottom: 30, // Margem inferior aumentada para rótulos do eixo X (especialmente se rotacionados)
            left: 20, // Margem esquerda
          }}
        >
          {/* Grade do Gráfico */}
          <CartesianGrid
            strokeDasharray="3 3" // Linhas tracejadas
            stroke={theme.palette.divider} // Cor sutil da divisória do tema
            opacity={0.6} // Opacidade para torná-la mais sutil
            vertical={false} // Remove linhas verticais da grade para um look mais limpo
          />

          {/* Eixo X (Datas) */}
          <XAxis
            dataKey="date" // Chave dos dados para o eixo X
            stroke={theme.palette.text.secondary} // Cor da linha do eixo (quase invisível aqui)
            tick={{
              fill: theme.palette.text.secondary,
              fontSize: theme.typography.caption.fontSize,
            }} // Estilo dos rótulos usando tipografia do tema
            tickLine={false} // Remove pequenas linhas acima dos rótulos
            axisLine={false} // Remove a linha principal do eixo X
            interval={data.length <= 7 ? 0 : "preserveStartEnd"} // Mostra todos os rótulos se poucos dados, senão otimiza
            dy={10} // Deslocamento vertical dos rótulos (útil com 'angle')
          />

          {/* Eixo Y (Valores em Kg) */}
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{
              fill: theme.palette.text.secondary,
              fontSize: theme.typography.caption.fontSize,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} kg`} // Adiciona " kg" aos rótulos do eixo Y
            width={50} // Largura reservada para os rótulos do eixo Y
          />

          {/* Tooltip Personalizado */}
          <Tooltip
            content={<CustomTooltip />} // Usa o componente personalizado criado acima
            cursor={{ fill: alpha(theme.palette.action.hover, 0.08) }} // Efeito visual ao passar o mouse sobre uma área do gráfico
          />

          {/* Legenda (Irá ignorar itens com legendType="none") */}
          <Legend
            wrapperStyle={{
              paddingTop: "25px", // Aumenta espaço entre gráfico e legenda
              fontSize: theme.typography.body2.fontSize, // Tamanho da fonte da legenda
              color: theme.palette.text.secondary, // Cor do texto da legenda
            }}
            iconSize={12} // Tamanho dos ícones da legenda
            align="center" // Alinhamento da legenda
            verticalAlign="bottom" // Posição vertical da legenda
          />

          {/* Área para Peso Total (Fundo) */}
          <Area
            type="monotone" // Tipo de curva suave
            dataKey="pesoTotal"
            fill={alpha(pesoTotalColor, 0.1)} // Preenchimento muito sutil usando a cor primária com alpha
            stroke="none" // Sem linha de contorno para a área
            isAnimationActive={false} // Desativa animação inicial para a área (opcional)
            legendType="none" // <-- ESSA É A MUDANÇA PRINCIPAL: Esconde da legenda
          />

          {/* Linha para Peso Total */}
          <Line
            type="monotone"
            dataKey="pesoTotal"
            name="Peso Total" // Nome ainda útil para tooltip
            stroke={pesoTotalColor} // Cor da linha
            strokeWidth={2.5} // Espessura da linha
            dot={{
              // Estilo dos pontos na linha
              r: 4, // Raio do ponto
              fill: pesoTotalColor,
              strokeWidth: 1,
              stroke: theme.palette.background.paper, // Contorno na cor do fundo para destacar
            }}
            activeDot={{
              // Estilo do ponto quando o mouse está sobre ele
              r: 6, // Raio maior
              strokeWidth: 2,
              stroke: alpha(pesoTotalColor, 0.3), // Contorno suave
            }}
            // isAnimationActive={false} // Desativa animação inicial para a linha (opcional)
          />

          {/* Barra para Massa Gordurosa */}
          <Bar
            dataKey="massaGorda"
            name="Massa Gordurosa" // Será exibido na legenda
            stackId="a" // Identificador do stack (para empilhar com Massa Livre)
            fill={massaGordaColor} // Cor da barra
            barSize={barWidth} // Largura da barra calculada dinamicamente
            // isAnimationActive={false} // Desativa animação inicial para barras (opcional)
          />

          {/* Barra para Massa Livre */}
          <Bar
            dataKey="massaLivre"
            name="Massa Livre" // Será exibido na legenda
            stackId="a" // Mesmo stackId para empilhar sobre Massa Gordurosa
            fill={massaLivreColor}
            radius={[8, 8, 0, 0]} // Cantos superiores arredondados para um visual moderno
            barSize={barWidth} // Largura da barra calculada dinamicamente
            // isAnimationActive={false} // Desativa animação inicial para barras (opcional)
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
