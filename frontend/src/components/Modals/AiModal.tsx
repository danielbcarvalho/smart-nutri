import {
  Modal,
  Paper,
  Box,
  Typography,
  IconButton,
  useTheme,
  Stack, // Importar Stack para listas mais fáceis
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// Ícones para a lista de funcionalidades (exemplo)
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // Ícone principal IA
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl"; // Para planos alimentares
import InsightsIcon from "@mui/icons-material/Insights"; // Para insights
import SummarizeIcon from "@mui/icons-material/Summarize"; // Para relatórios
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // Para economizar tempo

export interface AiModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AiModal({ open, onClose }: AiModalProps) {
  const theme = useTheme();

  // Frase melhorada
  const aiDescription =
    "Nossa Inteligência Artificial utiliza bancos de dados avançados, processando dados reais e objetivos individualizados. Assim, oferecemos insights e recomendações personalizadas, otimizando o acompanhamento para cada paciente e profissional.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="ai-modal-title"
      aria-describedby="ai-modal-description"
      sx={{
        display: "flex",
        alignItems: "center", // Centralizar verticalmente para um visual mais agradável
        justifyContent: "center",
        // Ajustar mt apenas se necessário ou remover para centralização total
        // mt: "88px", Se quiser que fique mais para cima, senão pode remover pra centralizar
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 450, // Um pouco mais de largura para o texto
          borderRadius: theme.shape.borderRadius * 2.5, // Bordas mais suaves (ex: 20px se borderRadius for 8px)
          boxShadow: theme.shadows[10], // Sombra mais suave que 24
          overflow: "hidden", // Garante que o conteúdo interno respeite o borderRadius
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            // borderBottom: "1px solid", // Removida a borda
            // borderColor: "divider",   // Removida a borda
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.grey[50]
                : theme.palette.grey[900], // Um leve fundo no header para destacar
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" fontWeight={600} id="ai-modal-title">
              Inteligência Artificial SmartNutri
            </Typography>
          </Stack>
          <IconButton
            aria-label="Fechar modal"
            size="small"
            onClick={onClose}
            sx={{ color: theme.palette.text.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 }, // Padding responsivo
            display: "flex",
            flexDirection: "column",
            gap: 2.5, // Ajuste no espaçamento
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <img
              src="/images/ai-animated.gif" // Certifique-se que este caminho está correto
              alt="Animação da Inteligência Artificial SmartNutri"
              style={{
                width: 60,
                height: 60,
                borderRadius: theme.shape.borderRadius,
              }}
            />
            <Box>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                Em Breve!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                A IA SmartNutri vai turbinar sua rotina.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
            id="ai-modal-description"
          >
            {aiDescription}
          </Typography>

          <Typography
            variant="subtitle1"
            fontWeight={500}
            color="text.primary"
            sx={{ mt: 1 }}
          >
            Com ela você poderá:
          </Typography>

          <Stack spacing={1.5}>
            {[
              {
                icon: (
                  <ChecklistRtlIcon color="primary" sx={{ fontSize: 22 }} />
                ),
                text: "Gerar planos alimentares personalizados",
              },
              {
                icon: <InsightsIcon color="primary" sx={{ fontSize: 22 }} />,
                text: "Obter insights valiosos sobre seus pacientes",
              },
              {
                icon: <SummarizeIcon color="primary" sx={{ fontSize: 22 }} />,
                text: "Montar relatórios detalhados automaticamente",
              },
              {
                icon: <AccessTimeIcon color="primary" sx={{ fontSize: 22 }} />,
                text: "Economizar tempo e otimizar seu fluxo de trabalho",
              },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                {item.icon}
                <Typography variant="body2" color="text.secondary">
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Modal>
  );
}
