import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService, Patient } from "../../services/patientService";
import { PatientCard } from "../../components/PatientCard";
import { PatientDetailsModal } from "../../components/PatientDetailsModal";

export function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  return (
    <Box sx={{ height: "100%", width: "100%", p: { xs: 1, sm: 3 } }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Pacientes
            </Typography>
            <Typography variant="subtitle1">
              Total de pacientes: {patients?.length || 0}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            Novo Paciente
          </Button>
        </Stack>
      </Paper>

      {/* Barra de Busca */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar pacientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Lista de Pacientes */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPatients?.map((patient) => (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <PatientCard
                patient={patient}
                onClick={() => setSelectedPatient(patient)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Detalhes do Paciente */}
      {selectedPatient && (
        <PatientDetailsModal
          open={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          patient={selectedPatient}
        />
      )}
    </Box>
  );
}
