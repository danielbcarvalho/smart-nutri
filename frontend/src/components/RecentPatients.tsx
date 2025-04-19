import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { patientService, Patient } from "../services/patientService";
import { PatientFormModal } from "./PatientForm/PatientFormModal";

export function PatientList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isPatientModalOpen, setIsPatientModalOpen] = React.useState(false);

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const sortedPatients = React.useMemo(() => {
    return [...patients].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [patients]);

  const filteredPatients = sortedPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const EmptyState = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Nenhum paciente encontrado
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {searchTerm
          ? "Tente buscar com outro termo"
          : "Adicione seu primeiro paciente"}
      </Typography>
      <Button
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={() => setIsPatientModalOpen(true)}
        sx={{ borderRadius: 20 }}
      >
        Adicionar Paciente
      </Button>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Seus Pacientes
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/patients")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "primary.main",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Ver todos os pacientes
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Link>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsPatientModalOpen(true)}
            sx={{ borderRadius: 20 }}
          >
            Novo Paciente
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar pacientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ mb: 2 }} />

        {filteredPatients.length === 0 ? (
          <EmptyState />
        ) : (
          <List>
            {filteredPatients.map((patient) => (
              <ListItem
                key={patient.id}
                component="div"
                onClick={() => navigate(`/patient/${patient.id}`)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar>{patient.name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={patient.name}
                  secondary={
                    <Box component="span">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="span"
                      >
                        Última atualização:{" "}
                        {new Date(patient.updatedAt).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        <PatientFormModal
          open={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          onSuccess={() => setIsPatientModalOpen(false)}
        />
      </CardContent>
    </Card>
  );
}
