import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Timeline as TimelineIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingBackdrop } from "../../components/LoadingBackdrop";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { styled } from "@mui/material/styles";
import { Theme, SxProps } from "@mui/material/styles";

export function ViewAssessment() {
  const { patientId, measurementId } = useParams<{
    patientId: string;
    measurementId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState<boolean>(false);

  // Buscar dados do paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  // Buscar dados da avaliação específica
  const { data: measurements } = useQuery({
    queryKey: ["measurements", patientId],
    queryFn: () => patientService.findMeasurements(patientId!),
    enabled: !!patientId,
  });

  // Encontrar a avaliação específica com base no ID
  const measurement = measurements?.find((m) => m.id === measurementId);

  // Encontrar a avaliação anterior para comparação
  const previousMeasurements = measurements
    ?.filter((m) => {
      const currentDate = new Date(measurement?.date || "");
      const measurementDate = new Date(m.date);
      return measurementDate < currentDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const previousMeasurement = previousMeasurements?.[0];

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    if (!measurements) return [];

    return measurements
      .slice() // Criar uma cópia antes de ordenar
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m) => {
        const height = Number(m.height || patient?.height);
        const weight = Number(m.weight);
        const heightInMeters = height / 100;
        const imc = weight / (heightInMeters * heightInMeters);

        // Parse the date string and create a date object
        const date = new Date(m.date);
        // Use UTC methods to avoid timezone issues
        const utcDate = new Date(
          Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
        );

        return {
          date: format(utcDate, "dd/MM/yyyy"),
          weight: weight,
          imc: Number(imc.toFixed(1)),
          bodyFat: m.bodyFat ? Number(m.bodyFat) : null,
          id: m.id,
          isSelected: m.id === measurementId,
        };
      });
  }, [measurements, measurementId, patient?.height]);

  // Preparar dados para o gráfico de composição corporal da avaliação atual
  const bodyCompositionData = useMemo(() => {
    if (!measurement) return [];

    const data = [];

    // Adicionar dados de composição corporal disponíveis
    if (measurement.bodyFat) {
      data.push({
        name: "Gordura Corporal",
        value: Number(measurement.bodyFat),
      });
    }

    if (measurement.muscleMass) {
      data.push({
        name: "Massa Muscular",
        value: Number(measurement.muscleMass),
      });
    }

    if (measurement.fatFreeMass) {
      data.push({
        name: "Massa Livre de Gordura",
        value: Number(measurement.fatFreeMass),
      });
    }

    if (measurement.boneMass) {
      data.push({
        name: "Massa Óssea",
        value: Number(measurement.boneMass),
      });
    }

    if (measurement.bodyWater) {
      data.push({
        name: "Água Corporal",
        value: Number(measurement.bodyWater),
      });
    }

    return data;
  }, [measurement]);

  // Mutation para atualizar as observações
  const updateNotesMutation = useMutation({
    mutationFn: async ({
      measurementId,
      notes,
    }: {
      measurementId: string;
      notes: string;
    }) => {
      return patientService.updateMeasurement(patientId!, measurementId, {
        notes,
      });
    },
    onSuccess: () => {
      setEditingNotes(false);
      // Recarregar os dados
      queryClient.invalidateQueries({ queryKey: ["measurements", patientId] });
    },
  });

  // Inicializar as notas quando a medição for carregada
  useEffect(() => {
    if (measurement?.notes) {
      setNotes(measurement.notes as string);
    }
  }, [measurement]);

  // Calcular o IMC
  const calculateBMI = (weight: number, height: number): number => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  // Classificar o IMC
  const getBMIClassification = (bmi: number): string => {
    if (bmi < 18.5) return "Abaixo do peso";
    if (bmi < 25) return "Peso normal";
    if (bmi < 30) return "Sobrepeso";
    if (bmi < 35) return "Obesidade Grau I";
    if (bmi < 40) return "Obesidade Grau II";
    return "Obesidade Grau III";
  };

  const handleSaveNotes = () => {
    if (measurementId) {
      updateNotesMutation.mutate({ measurementId, notes });
    }
  };

  if (isLoadingPatient) {
    return <LoadingBackdrop open={isLoadingPatient} />;
  }

  if (!patient || !measurement) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Dados não encontrados
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/patient/${patientId}/assessments`)}
          sx={{ mt: 2 }}
        >
          Voltar para lista de avaliações
        </Button>
      </Box>
    );
  }

  // Valores convertidos para números
  const weight = Number(measurement.weight);
  const height = Number(measurement.height || patient.height);
  const bmi = calculateBMI(weight, height);
  const bmiClassification = getBMIClassification(bmi);

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              aria-label="voltar"
              onClick={() => navigate(`/patient/${patientId}/assessments`)}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">Avaliação Antropométrica</Typography>
            <Chip
              label={format(
                new Date(
                  new Date(measurement.date).getTime() +
                    new Date(measurement.date).getTimezoneOffset() * 60000
                ),
                "dd/MM/yyyy",
                { locale: ptBR }
              )}
              color="primary"
              variant="outlined"
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Editar avaliação">
              <IconButton
                aria-label="editar"
                color="primary"
                onClick={() =>
                  navigate(
                    `/patient/${patientId}/assessments/edit/${measurementId}`
                  )
                }
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Imprimir">
              <IconButton aria-label="imprimir" color="primary">
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Compartilhar">
              <IconButton aria-label="compartilhar" color="primary">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Evolução">
              <IconButton aria-label="evolução" color="primary">
                <TimelineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1">
          <strong>Paciente:</strong> {patient.name}
          {patient.birthDate && (
            <>
              ,{" "}
              {new Date().getFullYear() -
                new Date(patient.birthDate).getFullYear()}{" "}
              anos
            </>
          )}
        </Typography>
      </Paper>

      {/* Dados principais */}
      <Grid container spacing={3}>
        {/* Coluna da esquerda - Dados da avaliação atual */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Dados Antropométricos
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Peso
                </Typography>
                <Typography variant="body1">{weight.toFixed(1)} kg</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Altura
                </Typography>
                <Typography variant="body1">{height.toFixed(1)} cm</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  IMC
                </Typography>
                <Typography variant="body1">{bmi.toFixed(1)} kg/m²</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Classificação
                </Typography>
                <Typography variant="body1">{bmiClassification}</Typography>
              </Grid>

              {measurement.bodyFat && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    % Gordura Corporal
                  </Typography>
                  <Typography variant="body1">
                    {Number(measurement.bodyFat).toFixed(1)}%
                  </Typography>
                </Grid>
              )}

              {measurement.muscleMass && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Massa Muscular
                  </Typography>
                  <Typography variant="body1">
                    {Number(measurement.muscleMass).toFixed(1)} kg
                  </Typography>
                </Grid>
              )}

              {measurement.fatFreeMass && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Massa Livre de Gordura
                  </Typography>
                  <Typography variant="body1">
                    {Number(measurement.fatFreeMass).toFixed(1)} kg
                  </Typography>
                </Grid>
              )}

              {measurement.visceralFat && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gordura Visceral
                  </Typography>
                  <Typography variant="body1">
                    {Number(measurement.visceralFat).toFixed(1)}
                  </Typography>
                </Grid>
              )}

              {measurement.bodyWater && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Água Corporal
                  </Typography>
                  <Typography variant="body1">
                    {Number(measurement.bodyWater).toFixed(1)}%
                  </Typography>
                </Grid>
              )}

              {measurement.boneMass && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Massa Óssea
                  </Typography>
                  <Typography variant="body1">
                    {Number(measurement.boneMass).toFixed(1)} kg
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Medidas corporais, se existirem */}
            {measurement.measurements &&
              Object.keys(measurement.measurements).length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Circunferências Corporais
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {measurement.measurements.waist && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Cintura
                        </Typography>
                        <Typography variant="body1">
                          {Number(measurement.measurements.waist).toFixed(1)} cm
                        </Typography>
                      </Grid>
                    )}

                    {measurement.measurements.hip && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Quadril
                        </Typography>
                        <Typography variant="body1">
                          {Number(measurement.measurements.hip).toFixed(1)} cm
                        </Typography>
                      </Grid>
                    )}

                    {measurement.measurements.chest && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tórax
                        </Typography>
                        <Typography variant="body1">
                          {Number(measurement.measurements.chest).toFixed(1)} cm
                        </Typography>
                      </Grid>
                    )}

                    {measurement.measurements.arm && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Braço
                        </Typography>
                        <Typography variant="body1">
                          {Number(measurement.measurements.arm).toFixed(1)} cm
                        </Typography>
                      </Grid>
                    )}

                    {measurement.measurements.thigh && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Coxa
                        </Typography>
                        <Typography variant="body1">
                          {Number(measurement.measurements.thigh).toFixed(1)} cm
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
          </Paper>
        </Grid>

        {/* Coluna da direita - Dados comparativos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Comparação com Avaliação Anterior
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {previousMeasurement ? (
              <>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Data da avaliação anterior:{" "}
                  {format(
                    new Date(
                      new Date(previousMeasurement.date).getTime() +
                        new Date(previousMeasurement.date).getTimezoneOffset() *
                          60000
                    ),
                    "dd/MM/yyyy",
                    { locale: ptBR }
                  )}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Medida
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Anterior
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Diferença
                    </Typography>
                  </Grid>

                  {/* Peso */}
                  <Grid item xs={4}>
                    <Typography variant="body2">Peso</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      {Number(previousMeasurement.weight).toFixed(1)} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    {(() => {
                      const diff = weight - Number(previousMeasurement.weight);
                      const color =
                        diff > 0
                          ? "error.main"
                          : diff < 0
                          ? "success.main"
                          : "text.primary";
                      return (
                        <Typography variant="body2" color={color}>
                          {diff > 0 ? "+" : ""}
                          {diff.toFixed(1)} kg
                        </Typography>
                      );
                    })()}
                  </Grid>

                  {/* IMC */}
                  <Grid item xs={4}>
                    <Typography variant="body2">IMC</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    {(() => {
                      const prevHeight = Number(
                        previousMeasurement.height || patient.height
                      );
                      const prevBMI = calculateBMI(
                        Number(previousMeasurement.weight),
                        prevHeight
                      );
                      return (
                        <Typography variant="body2">
                          {prevBMI.toFixed(1)} kg/m²
                        </Typography>
                      );
                    })()}
                  </Grid>
                  <Grid item xs={4}>
                    {(() => {
                      const prevHeight = Number(
                        previousMeasurement.height || patient.height
                      );
                      const prevBMI = calculateBMI(
                        Number(previousMeasurement.weight),
                        prevHeight
                      );
                      const diff = bmi - prevBMI;
                      const color =
                        diff > 0
                          ? "error.main"
                          : diff < 0
                          ? "success.main"
                          : "text.primary";
                      return (
                        <Typography variant="body2" color={color}>
                          {diff > 0 ? "+" : ""}
                          {diff.toFixed(1)}
                        </Typography>
                      );
                    })()}
                  </Grid>

                  {/* % Gordura Corporal */}
                  {measurement.bodyFat && previousMeasurement.bodyFat && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="body2">% Gordura</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2">
                          {Number(previousMeasurement.bodyFat).toFixed(1)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        {(() => {
                          const diff =
                            Number(measurement.bodyFat) -
                            Number(previousMeasurement.bodyFat);
                          const color =
                            diff > 0
                              ? "error.main"
                              : diff < 0
                              ? "success.main"
                              : "text.primary";
                          return (
                            <Typography variant="body2" color={color}>
                              {diff > 0 ? "+" : ""}
                              {diff.toFixed(1)}%
                            </Typography>
                          );
                        })()}
                      </Grid>
                    </>
                  )}

                  {/* Massa Muscular */}
                  {measurement.muscleMass && previousMeasurement.muscleMass && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="body2">Massa Muscular</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2">
                          {Number(previousMeasurement.muscleMass).toFixed(1)} kg
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        {(() => {
                          const diff =
                            Number(measurement.muscleMass) -
                            Number(previousMeasurement.muscleMass);
                          const color =
                            diff < 0
                              ? "error.main"
                              : diff > 0
                              ? "success.main"
                              : "text.primary";
                          return (
                            <Typography variant="body2" color={color}>
                              {diff > 0 ? "+" : ""}
                              {diff.toFixed(1)} kg
                            </Typography>
                          );
                        })()}
                      </Grid>
                    </>
                  )}
                </Grid>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Não há avaliações anteriores disponíveis para comparação.
              </Typography>
            )}

            {/* Gráfico de evolução */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Evolução do Peso
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300, width: "100%" }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      yAxisId="left"
                      domain={["auto", "auto"]}
                      label={{
                        value: "Peso (kg)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={["auto", "auto"]}
                      label={{
                        value: "IMC",
                        angle: 90,
                        position: "insideRight",
                      }}
                    />
                    <RechartsTooltip
                      formatter={(value: number | null, name: string) => {
                        if (name === "weight")
                          return [`${value?.toFixed(1)} kg`, "Peso"];
                        if (name === "imc")
                          return [`${value?.toFixed(1)}`, "IMC"];
                        if (name === "bodyFat")
                          return [`${value?.toFixed(1)}%`, "% Gordura"];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="weight"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="imc"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      name="imc"
                      strokeWidth={2}
                    />
                    {/* Adicionar linha de % gordura se houver dados */}
                    {chartData.some((data) => data.bodyFat !== null) && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="#ff7300"
                        activeDot={{ r: 8 }}
                        name="bodyFat"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Observações Clínicas */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Observações Clínicas</Typography>
              {editingNotes ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveNotes}
                  startIcon={<SaveIcon />}
                  disabled={updateNotesMutation.isPending}
                >
                  Salvar
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setEditingNotes(true)}
                  startIcon={<EditIcon />}
                >
                  Editar
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            {editingNotes ? (
              <TextField
                fullWidth
                multiline
                minRows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações clínicas, recomendações ou notas sobre esta avaliação..."
                variant="outlined"
              />
            ) : (
              <Typography
                variant="body1"
                color={notes ? "text.primary" : "text.secondary"}
              >
                {notes ||
                  "Nenhuma observação clínica registrada para esta avaliação."}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evolução
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Gráfico de Evolução de Peso e IMC */}
            <Box sx={{ height: 300, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    name="Peso (kg)"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="imc"
                    name="IMC"
                    stroke="#82ca9d"
                  />
                  {chartData.some((data) => data.bodyFat !== null) && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bodyFat"
                      name="% Gordura"
                      stroke="#ffc658"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Gráfico de Composição Corporal */}
            {bodyCompositionData.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Composição Corporal
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bodyCompositionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Valor">
                        {bodyCompositionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index % 5 === 0
                                ? "#8884d8"
                                : index % 5 === 1
                                ? "#82ca9d"
                                : index % 5 === 2
                                ? "#ffc658"
                                : index % 5 === 3
                                ? "#ff8042"
                                : "#da70d6"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
