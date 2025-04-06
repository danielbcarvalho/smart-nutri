import React from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid as MuiGrid,
  Paper,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";

export function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 4,
        }}
      >
        <CircularProgress sx={{ color: "custom.main" }} />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Não foi possível carregar os dados do paciente.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="text.primary">
        Detalhes do Paciente
      </Typography>

      <MuiGrid container spacing={3}>
        <MuiGrid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              bgcolor: "background.paper",
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome Completo
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {patient.name}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {patient.email}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {patient.phone}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Data de Nascimento
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {patient.birthDate
                    ? new Date(patient.birthDate).toLocaleDateString()
                    : "-"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  CPF
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {patient.cpf}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Instagram
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {patient.instagram ? `@${patient.instagram}` : "-"}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </MuiGrid>
      </MuiGrid>
    </Box>
  );
}
