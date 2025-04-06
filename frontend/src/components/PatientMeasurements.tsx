import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  InputAdornment,
  DialogActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patientService,
  Patient,
  CreateMeasurementDto,
} from "../services/patientService";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AxiosError } from "axios";

interface Props {
  patient: Patient;
  open?: boolean;
  onClose?: () => void;
}

export function PatientMeasurements({ patient, open = false, onClose }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imc, setImc] = useState(0);

  // Adicionar logs para depuração
  console.log("Paciente recebido:", patient);
  console.log("Altura do paciente:", patient?.height);
  console.log("Peso do paciente:", patient?.weight);

  const [newMeasurement, setNewMeasurement] = useState<CreateMeasurementDto>({
    weight: patient?.weight ? Number(patient.weight) : 0,
    height: patient?.height ? Number(patient.height) : 0,
    date: format(new Date(), "yyyy-MM-dd"),
    waist: patient?.waist ? Number(patient.waist) : 0,
    hip: patient?.hip ? Number(patient.hip) : 0,
    measurements: {},
  });

  const queryClient = useQueryClient();

  const { data: measurements } = useQuery({
    queryKey: ["measurements", patient.id],
    queryFn: () => patientService.getMeasurements(patient.id),
  });

  // Log para depuração dos dados brutos
  console.log("Dados brutos das medições:", measurements);
  if (measurements?.[0]) {
    console.log("Primeira medição:", {
      id: measurements[0].id,
      weight: measurements[0].weight,
      height: measurements[0].height,
      raw: measurements[0],
    });
  }

  // Formatar a última medição para garantir que os valores sejam números
  const lastMeasurement = measurements?.[0]
    ? {
        ...measurements[0],
        weight: Number(measurements[0].weight),
        height: Number(patient.height), // Sempre usar a altura do paciente
        bodyFat: measurements[0].bodyFat
          ? Number(measurements[0].bodyFat)
          : undefined,
        muscleMass: measurements[0].muscleMass
          ? Number(measurements[0].muscleMass)
          : undefined,
      }
    : null;
  console.log("🚀 ~ PatientMeasurements ~ lastMeasurement:", lastMeasurement);
  console.log("🚀 ~ PatientMeasurements ~ measurements:", measurements);

  // Atualizar o estado quando o paciente mudar
  useEffect(() => {
    console.log("useEffect - Atualizando medição com dados do paciente");
    console.log("Altura do paciente no useEffect:", patient?.height);
    console.log("Peso do paciente no useEffect:", patient?.weight);

    if (patient?.height && patient?.weight) {
      const height = Number(patient.height);
      const weight = Number(patient.weight);

      setNewMeasurement({
        weight: weight,
        height: height,
        date: format(new Date(), "yyyy-MM-dd"),
        waist: patient?.waist ? Number(patient.waist) : 0,
        hip: patient?.hip ? Number(patient.hip) : 0,
        measurements: {},
      });

      // Calcular IMC inicial
      const initialIMC = calculateIMC(weight, height);
      setImc(initialIMC);
    }
  }, [patient]);

  const createMutation = useMutation({
    mutationFn: (data: CreateMeasurementDto) =>
      patientService.createMeasurement(patient.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", patient.id] });
      setShowAddForm(false);
      setError(null);
      setNewMeasurement({
        weight: Number(patient.weight) || 0,
        height: Number(patient.height) || 0,
        date: format(new Date(), "yyyy-MM-dd"),
        waist: patient?.waist ? Number(patient.waist) : 0,
        hip: patient?.hip ? Number(patient.hip) : 0,
        measurements: {},
      });
    },
    onError: (error: AxiosError<{ message: string | string[] }>) => {
      const message = error.response?.data?.message;
      setError(
        Array.isArray(message) ? message.join(", ") : "Erro ao salvar medição"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (newMeasurement.weight < 0.1 || newMeasurement.weight > 500) {
      setError("O peso deve estar entre 0.1kg e 500kg");
      return;
    }

    if (newMeasurement.height < 20 || newMeasurement.height > 300) {
      setError("A altura deve estar entre 20cm e 300cm");
      return;
    }

    // Garantir que todos os números sejam do tipo number e a data seja uma string ISO
    const formattedData: CreateMeasurementDto = {
      weight: Number(newMeasurement.weight),
      height: Number(newMeasurement.height),
      date: new Date(newMeasurement.date).toISOString(),
      waist: Number(newMeasurement.waist),
      hip: Number(newMeasurement.hip),
      bodyFat: newMeasurement.bodyFat
        ? Number(newMeasurement.bodyFat)
        : undefined,
      muscleMass: newMeasurement.muscleMass
        ? Number(newMeasurement.muscleMass)
        : undefined,
      measurements: {
        chest: newMeasurement.measurements.chest
          ? Number(newMeasurement.measurements.chest)
          : undefined,
        waist: newMeasurement.measurements.waist
          ? Number(newMeasurement.measurements.waist)
          : undefined,
        hip: newMeasurement.measurements.hip
          ? Number(newMeasurement.measurements.hip)
          : undefined,
        arm: newMeasurement.measurements.arm
          ? Number(newMeasurement.measurements.arm)
          : undefined,
        thigh: newMeasurement.measurements.thigh
          ? Number(newMeasurement.measurements.thigh)
          : undefined,
      },
    };

    createMutation.mutate(formattedData);
  };

  // Função para calcular o IMC corretamente
  const calculateIMC = (
    weight: number | string | undefined,
    height: number | string | undefined
  ) => {
    // Se os valores forem undefined, retornar 0
    if (weight === undefined || height === undefined) {
      console.log("Valores undefined para IMC:", { weight, height });
      return 0;
    }

    try {
      // Converter para número se for string
      const weightNum = Number(weight);
      const heightNum = Number(height);

      // Validar se os valores são números e positivos
      if (
        isNaN(weightNum) ||
        isNaN(heightNum) ||
        weightNum <= 0 ||
        heightNum <= 0
      ) {
        console.log("Valores inválidos para IMC:", {
          weight: weightNum,
          height: heightNum,
        });
        return 0;
      }

      const heightInMeters = heightNum / 100;
      const imc = weightNum / (heightInMeters * heightInMeters);

      console.log("Cálculo do IMC:", {
        weight: weightNum,
        height: heightNum,
        heightInMeters,
        imc,
        imcFormatted: Number(imc.toFixed(2)),
      });

      return Number(imc.toFixed(2));
    } catch (error) {
      console.error("Erro ao calcular IMC:", error);
      return 0;
    }
  };

  // Função para formatar o IMC
  const formatIMC = (imc: number) => {
    if (!imc || imc === 0 || isNaN(imc)) {
      console.log("IMC inválido para formatação:", imc);
      return "-";
    }
    return imc.toFixed(2);
  };

  // Calcular IMC para o gráfico
  const chartData = measurements
    ?.map((m) => ({
      date: format(new Date(m.date), "dd/MM/yyyy"),
      weight: Number(m.weight),
      height: Number(patient.height), // Sempre usar a altura do paciente
      imc: calculateIMC(Number(m.weight), Number(patient.height)), // Usar altura do paciente
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      {open ? (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <TimelineIcon />
                <Typography variant="h6">Avaliações do Paciente</Typography>
              </Stack>
              {onClose && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={onClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Stack>
          </DialogTitle>
          <DialogContent>
            <MeasurementsContent />
          </DialogContent>
        </Dialog>
      ) : (
        <MeasurementsContent />
      )}

      {/* Modal separado para o formulário de nova avaliação */}
      <Dialog
        open={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Nova Avaliação</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => {
                setShowAddForm(false);
                setError(null);
              }}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Data"
                value={newMeasurement.date}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    date: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Peso (kg)"
                value={newMeasurement.weight}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    weight: Number(e.target.value) || 0,
                  })
                }
                inputProps={{
                  step: "0.1",
                  min: "0.1",
                  max: "500",
                }}
                helperText="Peso entre 0.1kg e 500kg"
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Altura (cm)"
                value={newMeasurement.height}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    height: Number(e.target.value) || 0,
                  })
                }
                inputProps={{
                  step: "0.1",
                  min: "20",
                  max: "300",
                }}
                helperText="Altura entre 20cm e 300cm"
              />
              <TextField
                fullWidth
                type="number"
                label="Cintura (cm)"
                value={newMeasurement.waist}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    waist: Number(e.target.value) || 0,
                  })
                }
                inputProps={{
                  step: "0.1",
                  min: "20",
                  max: "100",
                }}
                helperText="Cintura entre 20cm e 100cm"
              />
              <TextField
                fullWidth
                type="number"
                label="Quadril (cm)"
                value={newMeasurement.hip}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    hip: Number(e.target.value) || 0,
                  })
                }
                inputProps={{
                  step: "0.1",
                  min: "20",
                  max: "100",
                }}
                helperText="Quadril entre 20cm e 100cm"
              />
              <TextField
                fullWidth
                type="number"
                label="Gordura Corporal (%)"
                value={newMeasurement.bodyFat}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    bodyFat: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                inputProps={{
                  step: "0.1",
                  min: "1",
                  max: "70",
                }}
                helperText="Porcentagem entre 1% e 70%"
              />
              <TextField
                fullWidth
                type="number"
                label="Massa Muscular (%)"
                value={newMeasurement.muscleMass}
                onChange={(e) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    muscleMass: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                inputProps={{
                  step: "0.1",
                  min: "10",
                  max: "80",
                }}
                helperText="Porcentagem entre 10% e 80%"
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 2,
                }}
              >
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );

  function MeasurementsContent() {
    return (
      <Stack spacing={3}>
        {/* Informações do paciente */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Informações do Paciente
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Altura
              </Typography>
              <Typography variant="body1">
                {patient?.height ? `${patient.height} cm` : "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Peso
              </Typography>
              <Typography variant="body1">
                {patient?.weight ? `${patient.weight} kg` : "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                IMC
              </Typography>
              <Typography variant="body1">{formatIMC(imc)}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Última Avaliação */}
        {lastMeasurement && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Última Avaliação -{" "}
              {format(new Date(lastMeasurement.date), "dd/MM/yyyy")}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Peso
                </Typography>
                <Typography variant="body1">
                  {lastMeasurement.weight.toFixed(1)} kg
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Altura
                </Typography>
                <Typography variant="body1">
                  {lastMeasurement.height.toFixed(1)} cm
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  IMC
                </Typography>
                <Typography variant="body1">
                  {formatIMC(
                    calculateIMC(lastMeasurement.weight, lastMeasurement.height)
                  )}
                </Typography>
              </Box>
              {lastMeasurement.bodyFat && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gordura Corporal
                  </Typography>
                  <Typography variant="body1">
                    {lastMeasurement.bodyFat.toFixed(1)}%
                  </Typography>
                </Box>
              )}
              {lastMeasurement.muscleMass && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Massa Muscular
                  </Typography>
                  <Typography variant="body1">
                    {lastMeasurement.muscleMass.toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Gráfico de evolução */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Evolução
          </Typography>
          <Box sx={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  yAxisId="left"
                  domain={["dataMin - 5", "dataMax + 5"]}
                  label={{
                    value: "Peso (kg)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={["dataMin - 2", "dataMax + 2"]}
                  label={{ value: "IMC", angle: 90, position: "insideRight" }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "Peso (kg)") return `${value.toFixed(1)} kg`;
                    if (name === "IMC") return value.toFixed(2);
                    return value;
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#8884d8"
                  name="Peso (kg)"
                  strokeWidth={2}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="imc"
                  stroke="#82ca9d"
                  name="IMC"
                  strokeWidth={2}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Botões de ação */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setShowAddForm(true);
              setShowAllMeasurements(false);
              setError(null);
            }}
          >
            Adicionar nova avaliação
          </Button>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => {
              setShowAllMeasurements(!showAllMeasurements);
              setShowAddForm(false);
            }}
          >
            {showAllMeasurements
              ? "Ocultar histórico"
              : "Ver histórico completo"}
          </Button>
        </Stack>

        {/* Tabela com todas as medições */}
        {showAllMeasurements && measurements && measurements.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Histórico de Avaliações
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Peso (kg)</TableCell>
                    <TableCell align="right">Altura (cm)</TableCell>
                    <TableCell align="right">IMC</TableCell>
                    <TableCell align="right">Gordura (%)</TableCell>
                    <TableCell align="right">Músculo (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {measurements
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((measurement) => {
                      const weight = Number(measurement.weight);
                      const height = Number(patient.height);
                      const bodyFat = measurement.bodyFat
                        ? Number(measurement.bodyFat)
                        : undefined;
                      const muscleMass = measurement.muscleMass
                        ? Number(measurement.muscleMass)
                        : undefined;

                      return (
                        <TableRow key={measurement.id}>
                          <TableCell>
                            {format(new Date(measurement.date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell align="right">
                            {weight.toFixed(1)}
                          </TableCell>
                          <TableCell align="right">
                            {height.toFixed(1)}
                          </TableCell>
                          <TableCell align="right">
                            {formatIMC(calculateIMC(weight, height))}
                          </TableCell>
                          <TableCell align="right">
                            {bodyFat ? bodyFat.toFixed(1) : "-"}
                          </TableCell>
                          <TableCell align="right">
                            {muscleMass ? muscleMass.toFixed(1) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>
    );
  }
}
