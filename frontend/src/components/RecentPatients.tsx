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
  Chip,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/axios";

interface Patient {
  id: string;
  name: string;
  email: string;
  updatedAt: string;
  status?: "active" | "inactive";
}

export function RecentPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredPatients, setFilteredPatients] = React.useState<Patient[]>([]);

  React.useEffect(() => {
    async function loadPatients() {
      try {
        const response = await api.get("/patients");
        const sortedPatients = response.data.sort(
          (a: Patient, b: Patient) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setPatients(sortedPatients);
        setFilteredPatients(sortedPatients);
      } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
      }
    }

    loadPatients();
  }, []);

  React.useEffect(() => {
    const filtered = patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastUpdate = (date: string) => {
    const updateDate = new Date(date);
    const day = updateDate.getDate().toString().padStart(2, "0");
    const month = (updateDate.getMonth() + 1).toString().padStart(2, "0");
    const year = updateDate.getFullYear();
    const hours = updateDate.getHours().toString().padStart(2, "0");
    const minutes = updateDate.getMinutes().toString().padStart(2, "0");

    return `Atualizado em ${day}/${month}/${year} às ${hours}:${minutes}`;
  };

  const EmptyState = () => (
    <Box
      sx={{
        py: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <PersonAddIcon
        sx={{
          fontSize: 48,
          color: "text.disabled",
        }}
      />
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{ maxWidth: 300 }}
      >
        {searchTerm
          ? "Ops! Não encontramos nenhum paciente com esse nome."
          : "Está vazio por aqui. Cadastre seu primeiro paciente!"}
      </Typography>
      {!searchTerm && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/patients/new")}
          sx={{
            borderRadius: 20,
            textTransform: "none",
            boxShadow: "none",
            px: 3,
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          Adicionar paciente
        </Button>
      )}
    </Box>
  );

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              component="h2"
              onClick={() => navigate("/patients")}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  color: "primary.main",
                  textDecoration: "underline",
                },
              }}
            >
              Seus pacientes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Para adicionar uma avaliação ou plano alimentar, selecione um
              paciente
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/patients/new")}
            sx={{
              borderRadius: 20,
              textTransform: "none",
              boxShadow: "none",
              px: 2,
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            Novo
          </Button>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Pesquisar pacientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },
            },
          }}
        />
      </Box>
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {filteredPatients.length > 0 ? (
          <List
            sx={{
              width: "100%",
              maxHeight: "calc(100vh - 400px)",
              minHeight: 400,
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                },
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "& .MuiListItem-root": {
                px: 3,
                py: 2,
                transition: "background-color 0.2s ease",
                "&:hover": {
                  bgcolor: "action.hover",
                  cursor: "pointer",
                },
              },
            }}
          >
            {filteredPatients.map((patient) => (
              <React.Fragment key={patient.id}>
                <ListItem onClick={() => navigate(`/patient/${patient.id}`)}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                      }}
                    >
                      {getInitials(patient.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={patient.name}
                    secondary={
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="span"
                          >
                            {formatLastUpdate(patient.updatedAt)}
                          </Typography>
                          {patient.status && (
                            <Chip
                              label={
                                patient.status === "active"
                                  ? "Ativo"
                                  : "Inativo"
                              }
                              size="small"
                              color={
                                patient.status === "active"
                                  ? "success"
                                  : "default"
                              }
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/patient/${patient.id}/assessments/new`
                              );
                            }}
                            startIcon={<AssessmentIcon />}
                            sx={{
                              borderRadius: 20,
                              textTransform: "none",
                              borderColor: "success.main",
                              color: "success.main",
                              "&:hover": {
                                borderColor: "success.dark",
                                bgcolor: "success.lighter",
                              },
                            }}
                          >
                            Nova Avaliação
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/patient/${patient.id}/meal-plans?new=true`
                              );
                            }}
                            startIcon={<RestaurantMenuIcon />}
                            sx={{
                              borderRadius: 20,
                              textTransform: "none",
                              borderColor: "info.main",
                              color: "info.main",
                              "&:hover": {
                                borderColor: "info.dark",
                                bgcolor: "info.lighter",
                              },
                            }}
                          >
                            Novo Plano
                          </Button>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}
