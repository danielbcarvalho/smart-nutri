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
  ToggleButtonGroup,
  ToggleButton,
  Modal,
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
  const [openGraphsModal, setOpenGraphsModal] = useState(false);

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

  // Estado para dobras cutâneas
  const [skinfoldFormula, setSkinfoldFormula] = useState<string>("pollock3");
  const [skinfolds, setSkinfolds] = useState({
    tricipital: "",
    bicipital: "",
    abdominal: "",
    subscapular: "",
    axillaryMedian: "",
    thigh: "",
    thoracic: "",
    suprailiac: "",
    calf: "",
    supraspinal: "",
  });

  // Estado para circunferências
  const [circumferences, setCircumferences] = useState({
    neck: "",
    shoulder: "",
    chest: "",
    waist: "",
    abdomen: "",
    hip: "",
    relaxedArm: "",
    contractedArm: "",
    forearm: "",
    proximalThigh: "",
    medialThigh: "",
    distalThigh: "",
    calf: "",
  });

  // Estado para diâmetro ósseo
  const [boneDiameters, setBoneDiameters] = useState({
    humerus: "",
    wrist: "",
    femur: "",
  });

  // Estado para bioimpedância
  const [bioimpedance, setBioimpedance] = useState({
    fatPercentage: "",
    fatMass: "",
    muscleMassPercentage: "",
    muscleMass: "",
    fatFreeMass: "",
    boneMass: "",
    visceralFat: "",
    bodyWater: "",
    metabolicAge: "",
  });

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

  const handleSkinfoldChange =
    (field: keyof typeof skinfolds) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setSkinfolds((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const handleCircumferenceChange =
    (field: keyof typeof circumferences) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setCircumferences((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const handleBoneDiameterChange =
    (field: keyof typeof boneDiameters) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setBoneDiameters((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  const handleBioimpedanceChange =
    (field: keyof typeof bioimpedance) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // Permite apenas números e ponto
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setBioimpedance((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
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
              <Box sx={{ bgcolor: "grey.100", p: 2, mb: 3, borderRadius: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Escolha a fórmula para cálculo:
                </Typography>
                <ToggleButtonGroup
                  value={skinfoldFormula}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setSkinfoldFormula(newValue);
                    }
                  }}
                  size="small"
                  sx={{ flexWrap: "wrap", gap: 1 }}
                >
                  <ToggleButton
                    value="pollock3"
                    sx={{
                      "&.Mui-selected": {
                        color: "error.main",
                        borderColor: "error.main",
                        "&:hover": {
                          bgcolor: "error.lighter",
                        },
                      },
                    }}
                  >
                    Pollock 3
                  </ToggleButton>
                  <ToggleButton value="pollock7">Pollock 7</ToggleButton>
                  <ToggleButton value="petroski">Petroski</ToggleButton>
                  <ToggleButton value="guedes">Guedes</ToggleButton>
                  <ToggleButton value="durnin">Durnin</ToggleButton>
                  <ToggleButton value="faulkner">Faulkner</ToggleButton>
                  <ToggleButton value="none">Nenhuma</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Tricipital (mm)"
                    value={skinfolds.tricipital}
                    onChange={handleSkinfoldChange("tricipital")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Bicipital (mm)"
                    value={skinfolds.bicipital}
                    onChange={handleSkinfoldChange("bicipital")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Abdominal (mm)"
                    value={skinfolds.abdominal}
                    onChange={handleSkinfoldChange("abdominal")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Subescapular (mm)"
                    value={skinfolds.subscapular}
                    onChange={handleSkinfoldChange("subscapular")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Axilar Média (mm)"
                    value={skinfolds.axillaryMedian}
                    onChange={handleSkinfoldChange("axillaryMedian")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Coxa (mm)"
                    value={skinfolds.thigh}
                    onChange={handleSkinfoldChange("thigh")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Torácica (mm)"
                    value={skinfolds.thoracic}
                    onChange={handleSkinfoldChange("thoracic")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Suprailíaca (mm)"
                    value={skinfolds.suprailiac}
                    onChange={handleSkinfoldChange("suprailiac")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Panturrilha (mm)"
                    value={skinfolds.calf}
                    onChange={handleSkinfoldChange("calf")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dobra Supraespinhal (mm)"
                    value={skinfolds.supraspinal}
                    onChange={handleSkinfoldChange("supraspinal")}
                    InputProps={{
                      sx: { bgcolor: "background.paper" },
                    }}
                  />
                </Grid>
              </Grid>
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Importantes para calcular RCQ, CMB e entre outros.
              </Typography>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pescoço"
                    value={circumferences.neck}
                    onChange={handleCircumferenceChange("neck")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tórax"
                    value={circumferences.chest}
                    onChange={handleCircumferenceChange("chest")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ombro"
                    value={circumferences.shoulder}
                    onChange={handleCircumferenceChange("shoulder")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cintura"
                    value={circumferences.waist}
                    onChange={handleCircumferenceChange("waist")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quadril"
                    value={circumferences.hip}
                    onChange={handleCircumferenceChange("hip")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Abdômen"
                    value={circumferences.abdomen}
                    onChange={handleCircumferenceChange("abdomen")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Braço relaxado"
                    value={circumferences.relaxedArm}
                    onChange={handleCircumferenceChange("relaxedArm")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Braço contraído"
                    value={circumferences.contractedArm}
                    onChange={handleCircumferenceChange("contractedArm")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Antebraço"
                    value={circumferences.forearm}
                    onChange={handleCircumferenceChange("forearm")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coxa proximal"
                    value={circumferences.proximalThigh}
                    onChange={handleCircumferenceChange("proximalThigh")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coxa medial"
                    value={circumferences.medialThigh}
                    onChange={handleCircumferenceChange("medialThigh")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Coxa distal"
                    value={circumferences.distalThigh}
                    onChange={handleCircumferenceChange("distalThigh")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Panturrilha"
                    value={circumferences.calf}
                    onChange={handleCircumferenceChange("calf")}
                  />
                </Grid>
              </Grid>
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Importantes para calcular peso ósseo e massa muscular.
              </Typography>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diâmetro do úmero"
                    value={boneDiameters.humerus}
                    onChange={handleBoneDiameterChange("humerus")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diâmetro do punho"
                    value={boneDiameters.wrist}
                    onChange={handleBoneDiameterChange("wrist")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diâmetro do fêmur"
                    value={boneDiameters.femur}
                    onChange={handleBoneDiameterChange("femur")}
                  />
                </Grid>
              </Grid>
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Insira os dados da sua balança diretamente aqui.
              </Typography>

              {/* @ts-ignore */}
              <Grid container spacing={2}>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="% de Gordura"
                    value={bioimpedance.fatPercentage}
                    onChange={handleBioimpedanceChange("fatPercentage")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Massa Gorda"
                    value={bioimpedance.fatMass}
                    onChange={handleBioimpedanceChange("fatMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="% de Massa Muscular"
                    value={bioimpedance.muscleMassPercentage}
                    onChange={handleBioimpedanceChange("muscleMassPercentage")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Massa Muscular"
                    value={bioimpedance.muscleMass}
                    onChange={handleBioimpedanceChange("muscleMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Massa Livre de Gordura"
                    value={bioimpedance.fatFreeMass}
                    onChange={handleBioimpedanceChange("fatFreeMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Peso Ósseo"
                    value={bioimpedance.boneMass}
                    onChange={handleBioimpedanceChange("boneMass")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gordura Visceral"
                    value={bioimpedance.visceralFat}
                    onChange={handleBioimpedanceChange("visceralFat")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Água Corporal"
                    value={bioimpedance.bodyWater}
                    onChange={handleBioimpedanceChange("bodyWater")}
                  />
                </Grid>
                {/* @ts-ignore */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Idade Metabólica"
                    value={bioimpedance.metabolicAge}
                    onChange={handleBioimpedanceChange("metabolicAge")}
                  />
                </Grid>
              </Grid>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">Resultados analíticos</Typography>
                <Tooltip title="Informações sobre os cálculos">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
              <Button variant="text" onClick={() => setOpenGraphsModal(true)}>
                Ver gráficos
              </Button>
            </Box>

            {/* Análises de pesos e medidas */}
            <Typography variant="subtitle1" gutterBottom>
              Análises de pesos e medidas
            </Typography>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Peso atual</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Altura atual</Typography>
                <Typography>170 cm</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Índice de Massa Corporal</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Classificação do IMC</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Faixa de peso ideal</Typography>
                <Typography>53.5 a 72.0Kg</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Relação da Cintura/Quadril (RCQ)</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Risco Metabólico por RCQ</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>CMB (cm)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Escolha o lado)
                  </Typography>
                </Box>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Classificação CMB</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            {/* Análises por dobras e diâmetro ósseo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                mt: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">
                  Análises por dobras e diâmetro ósseo
                </Typography>
                <Tooltip title="Informações sobre os cálculos">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Percentual de Gordura</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Brozek, 1963)
                  </Typography>
                </Box>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Percentual Ideal</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Classif. do % GC</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Editar)
                  </Typography>
                </Box>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Peso de gordura</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Peso ósseo</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (por diam. ósseo)
                  </Typography>
                </Box>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Massa Muscular</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Peso residual</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Massa Livre de Gordura</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Somatório de Dobras</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Densidade Corporal</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Referência usada</Typography>
                <Typography>Pollock 3, 1978</Typography>
              </Box>
            </Box>

            {/* Análises por bioimpedância */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                mt: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">Análises por bioimpedância</Typography>
                <Tooltip title="Informações sobre os cálculos">
                  <HelpIcon color="action" fontSize="small" />
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Percentual de Gordura</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Percentual Ideal</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>Classif. do % GC</Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Editar)
                  </Typography>
                </Box>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Percentual de Massa Muscular</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Massa Muscular</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Água Corporal Total</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Peso Ósseo</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Massa de gordura</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Massa Livre de Gordura</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Índice de Gordura Visceral</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "grey.100", borderRadius: 1, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
              >
                <Typography>Idade Metabólica</Typography>
                <Typography>-</Typography>
              </Box>
            </Box>

            {/* Modal de Gráficos */}
            <Modal
              open={openGraphsModal}
              onClose={() => setOpenGraphsModal(false)}
              aria-labelledby="modal-graphs"
              aria-describedby="modal-graphs-description"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 800,
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" component="h2" gutterBottom>
                  Gráficos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Em breve você poderá visualizar os gráficos aqui.
                </Typography>
                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button onClick={() => setOpenGraphsModal(false)}>
                    Fechar
                  </Button>
                </Box>
              </Box>
            </Modal>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
