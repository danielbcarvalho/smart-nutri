import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Switch,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";

export function NewAssessment() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [sharePhotos, setSharePhotos] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState<Date | null>(new Date());

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  // Dados básicos
  const [basicData, setBasicData] = useState({
    weight: "",
    height: "170",
    sittingHeight: "",
    kneeHeight: "",
  });

  // Estado para controle dos accordions
  const [expanded, setExpanded] = useState<string | false>("basicData");

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleBasicDataChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setBasicData({
        ...basicData,
        [field]: event.target.value,
      });
    };

  if (!patient) return null;

  const age = patient.birthDate
    ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
    : null;

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
          Avaliação antropométrica
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DatePicker
              label="Data da avaliação"
              value={assessmentDate}
              onChange={(newValue: Date | null) => setAssessmentDate(newValue)}
              slotProps={{
                textField: {
                  sx: { width: 200 },
                },
                openPickerButton: {
                  sx: { color: "success.main" },
                },
              }}
            />
          </LocalizationProvider>
          <Typography color="text.secondary">
            Paciente: {patient.name}
            {age && `, Idade: ${age} anos`}
          </Typography>
        </Box>

        {/* Botões de ação */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<TimelineIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            ver evolução
          </Button>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            ver anamnese
          </Button>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            avaliações anteriores
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {}}
            sx={{ bgcolor: "grey.500" }}
          >
            editar data
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Coluna da esquerda - Formulários */}
        <Box sx={{ flex: "0 0 58.333%" }}>
          {/* Dados antropométricos básicos */}
          <Accordion
            expanded={expanded === "basicData"}
            onChange={handleAccordionChange("basicData")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Dados antropométricos básicos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Paciente acamado?{" "}
                  <Link href="#" color="primary">
                    Clique aqui
                  </Link>{" "}
                  para estimar o peso.
                </Typography>
              </Box>
              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Peso (Kg)"
                    value={basicData.weight}
                    onChange={handleBasicDataChange("weight")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Altura (cm)"
                    value={basicData.height}
                    onChange={handleBasicDataChange("height")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Altura sentado (cm)"
                    value={basicData.sittingHeight}
                    onChange={handleBasicDataChange("sittingHeight")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Altura do joelho (cm)"
                    value={basicData.kneeHeight}
                    onChange={handleBasicDataChange("kneeHeight")}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Dobras cutâneas */}
          <Accordion
            expanded={expanded === "skinfolds"}
            onChange={handleAccordionChange("skinfolds")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Dobras cutâneas (mm)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Adicionar campos de dobras cutâneas */}
            </AccordionDetails>
          </Accordion>

          {/* Circunferências corporais */}
          <Accordion
            expanded={expanded === "circumferences"}
            onChange={handleAccordionChange("circumferences")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Circunferências corporais (cm)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Adicionar campos de circunferências */}
            </AccordionDetails>
          </Accordion>

          {/* Diâmetro ósseo */}
          <Accordion
            expanded={expanded === "boneDiameter"}
            onChange={handleAccordionChange("boneDiameter")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Diâmetro ósseo (cm)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Adicionar campos de diâmetro ósseo */}
            </AccordionDetails>
          </Accordion>

          {/* Balança de bioimpedância */}
          <Accordion
            expanded={expanded === "bioimpedance"}
            onChange={handleAccordionChange("bioimpedance")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Balança de bioimpedância</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Adicionar campos de bioimpedância */}
            </AccordionDetails>
          </Accordion>

          {/* Evolução fotográfica */}
          <Accordion
            expanded={expanded === "photos"}
            onChange={handleAccordionChange("photos")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Evolução fotográfica</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fotos técnicas do seu paciente, para avaliar a evolução
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2, mb: 2 }}
                onClick={() => {}}
              >
                Ver evolução fotográfica
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={sharePhotos}
                  onChange={(e) => setSharePhotos(e.target.checked)}
                />
                <Typography variant="body2">
                  Liberar fotos no app do paciente?
                </Typography>
                <Tooltip title="Necessário informar o PIN SEGURO">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Botão Salvar */}
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              size="large"
              onClick={() => navigate(`/patients/${patientId}`)}
            >
              salvar alterações
            </Button>
          </Box>
        </Box>

        {/* Coluna da direita - Resultados */}
        <Box sx={{ flex: "0 0 41.667%" }}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">
                Resultados analíticos{" "}
                <Tooltip title="Informações sobre os cálculos">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Typography>
              <Button variant="text">Ver gráficos</Button>
            </Box>

            {/* Análises de pesos e medidas */}
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Análises de pesos e medidas
            </Typography>
            {/* @ts-ignore */}
            <Grid container spacing={2}>
              {/* @ts-ignore */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Peso atual
                </Typography>
                <Typography>-</Typography>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Altura atual
                </Typography>
                <Typography>170 cm</Typography>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Índice de Massa Corporal
                </Typography>
                <Typography>-</Typography>
              </Grid>
            </Grid>

            {/* Análises por dobras e diâmetro ósseo */}
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Análises por dobras e diâmetro ósseo
            </Typography>
            {/* @ts-ignore */}
            <Grid container spacing={2}>
              {/* @ts-ignore */}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Percentual de Gordura (Brozek, 1963)
                </Typography>
                <Typography>-</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
