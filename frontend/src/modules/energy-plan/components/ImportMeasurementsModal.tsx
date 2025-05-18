import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { patientService } from "@/modules/patient/services/patientService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Measurement {
  id: string;
  date: string;
  weight?: string | number;
  height?: string | number;
  fatFreeMass?: string | number | null;
}

interface ImportMeasurementsModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (measurement: {
    weight: number;
    height: number;
    fatFreeMass?: number;
  }) => void;
  patientId: string;
}

export const ImportMeasurementsModal: React.FC<
  ImportMeasurementsModalProps
> = ({ open, onClose, onSelect, patientId }) => {
  const [measurements, setMeasurements] = React.useState<Measurement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        setLoading(true);
        const data = await patientService.findMeasurements(patientId);
        setMeasurements(data);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar medidas. Tente novamente.");
        console.error("Erro ao buscar medidas:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchMeasurements();
    }
  }, [open, patientId]);

  const handleSelectMeasurement = (measurement: Measurement) => {
    if (!measurement.weight || !measurement.height) {
      setError(
        "Medidas incompletas. Selecione uma avaliação com peso e altura."
      );
      return;
    }

    onSelect({
      weight: Number(measurement.weight),
      height: Number(measurement.height),
      fatFreeMass: measurement.fatFreeMass
        ? Number(measurement.fatFreeMass)
        : undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Importar Medidas Salvas
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecione uma avaliação para importar as medidas:
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : measurements.length === 0 ? (
          <Typography color="text.secondary">
            Nenhuma medida encontrada para este paciente.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Peso (kg)</TableCell>
                  <TableCell align="right">Altura (cm)</TableCell>
                  <TableCell align="right">
                    Massa Livre de Gordura (kg)
                  </TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {measurements.map((measurement) => (
                  <TableRow
                    key={measurement.id}
                    hover
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      {format(
                        new Date(measurement.date),
                        "dd 'de' MMMM 'de' yyyy",
                        {
                          locale: ptBR,
                        }
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {measurement.weight || "-"}
                    </TableCell>
                    <TableCell align="right">
                      {measurement.height || "-"}
                    </TableCell>
                    <TableCell align="right">
                      {measurement.fatFreeMass || "-"}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleSelectMeasurement(measurement)}
                        disabled={!measurement.weight || !measurement.height}
                      >
                        Importar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};
