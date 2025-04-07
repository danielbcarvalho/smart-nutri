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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!patient) {
    return null;
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          boxShadow: 3,
          borderTop: `6px solid ${theme.palette.primary.main}`,
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: "center", position: "relative", mb: 3 }}>
            <Avatar
              src={patient.photoUrl}
              sx={{
                width: 100,
                height: 100,
                margin: "0 auto",
                mb: 2,
              }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5">{patient.name}</Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/patient/${patientId}/edit`)}
              sx={{ position: "absolute", top: 10, right: 10 }}
            >
              Editar
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: isMobile ? 2 : 4,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <CalendarIcon fontSize="small" /> Nascimento
              </Typography>
              <Typography variant="body1">
                {patient.birthDate
                  ? format(new Date(patient.birthDate), "dd/MM/yyyy")
                  : "-"}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <PhoneIcon fontSize="small" /> Telefone
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Typography variant="body1">{patient.phone || "-"}</Typography>
                {patient.phone && (
                  <Tooltip title="WhatsApp">
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(`https://wa.me/55${patient.phone}`)
                      }
                      color="success"
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <EmailIcon fontSize="small" /> Email
              </Typography>
              <Typography variant="body1">{patient.email || "-"}</Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <UpdateIcon fontSize="small" /> Atualizado em
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
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <AssessmentButton patientId={patientId} variant="contained" />
            <MealPlanButton
              patientId={patientId}
              variant="contained"
              color="secondary"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
