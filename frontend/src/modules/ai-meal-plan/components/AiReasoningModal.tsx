import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Tabs,
  Tab,
  Paper,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import {
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  Timer as TimerIcon,
  Token as TokenIcon,
  Memory as MemoryIcon,
} from "@mui/icons-material";

interface AiReasoningModalProps {
  open: boolean;
  onClose: () => void;
  reasoning?: {
    prompt: string;
    rawResponse: string;
    tokensUsed?: number;
    model: string;
    provider: string;
    generationTime: number;
    metadata?: any;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reasoning-tabpanel-${index}`}
      aria-labelledby={`reasoning-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

export const AiReasoningModal: React.FC<AiReasoningModalProps> = ({
  open,
  onClose,
  reasoning,
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!reasoning) {
    return null;
  }

  const formatTime = (milliseconds: number) => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    return `${(milliseconds / 1000).toFixed(1)}s`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: "90vh", maxHeight: "800px" },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <PsychologyIcon color="primary" />
          <Typography variant="h6">
            Raciocínio da SmartNutri AI
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stats Overview */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Detalhes Técnicos da Geração
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <TokenIcon fontSize="small" />
                  <Typography variant="h6">
                    {reasoning.tokensUsed?.toLocaleString() || "N/A"}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tokens Utilizados
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <TimerIcon fontSize="small" />
                  <Typography variant="h6">
                    {formatTime(reasoning.generationTime)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tempo de Geração
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <MemoryIcon fontSize="small" />
                  <Typography variant="h6">
                    {reasoning.model}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Modelo AI
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <Chip
                  label={reasoning.provider.toUpperCase()}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Provider
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Alert>

        {/* Tabs for different views */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Prompt Enviado" />
            <Tab label="Resposta da AI" />
            <Tab label="Metadados" />
          </Tabs>
        </Box>

        {/* Prompt Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle1" gutterBottom>
            Prompt Completo Enviado para a AI
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Este é o prompt exato que foi enviado para a AI, contendo todos os dados do paciente e configurações.
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: 400,
              overflow: "auto",
              backgroundColor: "grey.50",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {reasoning.prompt}
          </Paper>
        </TabPanel>

        {/* AI Response Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle1" gutterBottom>
            Resposta Bruta da AI
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Esta é a resposta completa e não processada retornada pela AI.
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: 400,
              overflow: "auto",
              backgroundColor: "grey.50",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {reasoning.rawResponse}
          </Paper>
        </TabPanel>

        {/* Metadata Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle1" gutterBottom>
            Metadados da API
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Informações técnicas detalhadas sobre a chamada da API.
          </Typography>
          
          <Grid container spacing={2}>
            {reasoning.metadata?.promptTokens && (
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Tokens do Prompt</Typography>
                  <Typography variant="h4" color="primary.main">
                    {reasoning.metadata.promptTokens.toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            {reasoning.metadata?.completionTokens && (
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Tokens da Resposta</Typography>
                  <Typography variant="h4" color="secondary.main">
                    {reasoning.metadata.completionTokens.toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            {reasoning.metadata?.finishReason && (
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">Motivo de Finalização</Typography>
                  <Chip 
                    label={reasoning.metadata.finishReason} 
                    size="small" 
                    color={reasoning.metadata.finishReason === 'stop' ? 'success' : 'warning'}
                  />
                </Paper>
              </Grid>
            )}
            
            {reasoning.metadata?.responseId && (
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">ID da Resposta</Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: "monospace", 
                      fontSize: "0.75rem",
                      wordBreak: "break-all"
                    }}
                  >
                    {reasoning.metadata.responseId}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Metadados Completos (JSON)
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: 300,
              overflow: "auto",
              backgroundColor: "grey.50",
              fontFamily: "monospace",
              fontSize: "0.75rem",
            }}
          >
            <pre>{JSON.stringify(reasoning.metadata, null, 2)}</pre>
          </Paper>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};