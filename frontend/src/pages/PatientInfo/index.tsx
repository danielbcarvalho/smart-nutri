import React from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";

export function PatientInfo() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  if (!patient) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="text.primary">
        Informações Pessoais
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "custom.lightest",
              },
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nome
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
                    CPF
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {patient.cpf}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data de Nascimento
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {new Date(patient.birthDate).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={patient.status === "active" ? "Ativo" : "Inativo"}
                    sx={{
                      bgcolor:
                        patient.status === "active"
                          ? "custom.main"
                          : "grey.300",
                      color:
                        patient.status === "active"
                          ? "common.white"
                          : "text.primary",
                    }}
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
