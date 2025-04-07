import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AssessmentButton } from "../../components/AssessmentButton";
import { MealPlanButton } from "../../components/MealPlanButton";

export function PatientInfo() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
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
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Dados básicos</Typography>
            <Button
              startIcon={<EditIcon />}
              onClick={() => navigate(`/patient/${patientId}/edit`)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              Editar
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 3 }}>
            {/* Coluna da foto */}
            <Box sx={{ width: 120 }}>
              <Avatar
                src={patient.photoUrl}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid",
                  borderColor: "background.paper",
                  boxShadow: 1,
                }}
              />
            </Box>

            {/* Coluna das informações */}
            <Box
              sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Primeira linha */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ width: "60%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Nome completo
                  </Typography>
                  <Typography variant="body1">{patient.name}</Typography>
                </Box>
                <Box sx={{ width: "40%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    align="center"
                  >
                    Data de nascimento
                  </Typography>
                  <Typography variant="body1" align="center">
                    {patient.birthDate
                      ? format(new Date(patient.birthDate), "dd/MM/yyyy")
                      : "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Segunda linha */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ width: "60%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Telefone com DDD
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body1">
                      {patient.phone || "-"}
                    </Typography>
                    {patient.phone && (
                      <Tooltip title="WhatsApp">
                        <IconButton
                          size="small"
                          onClick={() =>
                            window.open(`https://wa.me/${patient.phone}`)
                          }
                          sx={{ color: "success.main" }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                <Box sx={{ width: "40%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    align="center"
                  >
                    Email
                  </Typography>
                  <Typography variant="body1" align="center">
                    {patient.email || "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Terceira linha */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ width: "60%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Última atualização
                  </Typography>
                  <Typography variant="body1">
                    {patient.updatedAt
                      ? format(
                          new Date(patient.updatedAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          {
                            locale: ptBR,
                          }
                        )
                      : "-"}
                  </Typography>
                </Box>
                <Box sx={{ width: "40%" }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 15, my: 7 }}>
            <AssessmentButton patientId={patientId} sx={{ flex: 1 }} />
            <MealPlanButton patientId={patientId} sx={{ flex: 1 }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
