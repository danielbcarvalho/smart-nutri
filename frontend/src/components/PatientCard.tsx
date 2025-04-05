import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Stack,
} from "@mui/material";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Patient } from "../services/patientService";
import { Update as UpdateIcon } from "@mui/icons-material";

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const lastUpdate = new Date(patient.updatedAt || patient.createdAt);

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => theme.shadows[4],
          transition: "all 0.2s ease-in-out",
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              fontSize: "1.5rem",
            }}
          >
            {patient.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {patient.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {patient.email}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <UpdateIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Última atualização:{" "}
                {format(lastUpdate, "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
