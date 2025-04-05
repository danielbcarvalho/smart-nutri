import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Stack,
  Paper,
  InputAdornment,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as TransgenderIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patientService,
  Patient,
  CreatePatientDto,
} from "../../services/patientService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PatientMeasurements } from "../../components/PatientMeasurements";

export function Patients() {
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientForMeasurements, setSelectedPatientForMeasurements] =
    useState<Patient | null>(null);
  const [formData, setFormData] = useState<CreatePatientDto>({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "M",
    height: 0,
    weight: 0,
  });

  const queryClient = useQueryClient();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const data = await patientService.getAll();
      console.log("Dados recebidos do backend:", data);
      return data;
    },
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePatientDto) => patientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePatientDto }) =>
      patientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const handleClickOpen = () => {
    setSelectedPatient(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPatient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "M",
      height: 0,
      weight: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      height: Number(formData.height),
      weight: Number(formData.weight),
      gender: formData.gender as "M" | "F" | "OTHER",
    };

    if (selectedPatient) {
      updateMutation.mutate({ id: selectedPatient.id, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      height: patient.height,
      weight: patient.weight,
    });
    setOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    if (window.confirm("Tem certeza que deseja excluir este paciente?")) {
      deleteMutation.mutateAsync(patient.id);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: "all",
    createdAt: "all",
    updatedAt: "all",
  });

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
            onClick={handleClickOpen}
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

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
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
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
              sx={{ minWidth: 130 }}
            >
              Filtros
            </Button>
          </Stack>

          {showFilters && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Gênero
              </Typography>
              <ToggleButtonGroup
                value={filters.gender}
                exclusive
                onChange={(e, value) =>
                  setFilters({ ...filters, gender: value || "all" })
                }
                size="small"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="all">Todos</ToggleButton>
                <ToggleButton value="M">
                  <MaleIcon sx={{ mr: 1 }} /> Masculino
                </ToggleButton>
                <ToggleButton value="F">
                  <FemaleIcon sx={{ mr: 1 }} /> Feminino
                </ToggleButton>
                <ToggleButton value="OTHER">
                  <TransgenderIcon sx={{ mr: 1 }} /> Outro
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="subtitle2" gutterBottom>
                Data de cadastro
              </Typography>
              <ToggleButtonGroup
                value={filters.createdAt}
                exclusive
                onChange={(e, value) =>
                  setFilters({ ...filters, createdAt: value || "all" })
                }
                size="small"
              >
                <ToggleButton value="all">Todos</ToggleButton>
                <ToggleButton value="today">Hoje</ToggleButton>
                <ToggleButton value="week">Última semana</ToggleButton>
                <ToggleButton value="month">Último mês</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Patient Cards */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        }}
      >
        {(patients || [])
          .filter((patient) => {
            if (!searchTerm) return true;
            return (
              patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              patient.phone.includes(searchTerm)
            );
          })
          .filter((patient) => {
            if (filters.gender === "all") return true;
            return patient.gender === filters.gender;
          })
          .map((patient) => (
            <Card key={patient.id}>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {patient.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{patient.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {patient.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {patient.birthDate
                        ? format(new Date(patient.birthDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : ""}
                    </Typography>
                  </Box>
                  <Stack direction="column" spacing={1}>
                    <Button
                      size="small"
                      onClick={() => setSelectedPatientForMeasurements(patient)}
                      color="primary"
                      variant="outlined"
                      startIcon={<TimelineIcon />}
                    >
                      Avaliação
                    </Button>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(patient)}
                        color="primary"
                        aria-label="editar paciente"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(patient)}
                        color="error"
                        aria-label="excluir paciente"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={
                      patient.gender === "M" ? (
                        <MaleIcon />
                      ) : patient.gender === "F" ? (
                        <FemaleIcon />
                      ) : (
                        <TransgenderIcon />
                      )
                    }
                    label={
                      patient.gender === "M"
                        ? "Masculino"
                        : patient.gender === "F"
                        ? "Feminino"
                        : "Outro"
                    }
                    size="small"
                  />
                  <Chip
                    label={`${patient.height}cm`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${patient.weight}kg`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        sx={{
          "& .MuiDialog-paper": {
            margin: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {selectedPatient ? "Editar Paciente" : "Novo Paciente"}
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 2,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
              <TextField
                required
                margin="dense"
                id="name"
                label="Nome"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <TextField
                required
                margin="dense"
                id="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
              <TextField
                required
                margin="dense"
                id="phone"
                label="Telefone"
                fullWidth
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <TextField
                required
                margin="dense"
                id="birthDate"
                label="Data de Nascimento"
                type="date"
                fullWidth
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
              <TextField
                select
                margin="dense"
                id="gender"
                label="Gênero"
                fullWidth
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "M" | "F" | "OTHER",
                  })
                }
              >
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
                <MenuItem value="OTHER">Outro</MenuItem>
              </TextField>
              <TextField
                required
                margin="dense"
                id="height"
                label="Altura (cm)"
                type="number"
                fullWidth
                value={formData.height}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    height: Number(e.target.value),
                  })
                }
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
              />
              <TextField
                required
                margin="dense"
                id="weight"
                label="Peso (kg)"
                type="number"
                fullWidth
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: Number(e.target.value),
                  })
                }
                inputProps={{
                  step: "0.01",
                  min: "0",
                }}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ minWidth: { xs: "120px", sm: "140px" } }}
          >
            {selectedPatient ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Medições */}
      {selectedPatientForMeasurements && (
        <PatientMeasurements
          patient={{
            ...selectedPatientForMeasurements,
            height: Number(selectedPatientForMeasurements.height) || 0,
            weight: Number(selectedPatientForMeasurements.weight) || 0,
          }}
          open={!!selectedPatientForMeasurements}
          onClose={() => setSelectedPatientForMeasurements(null)}
        />
      )}
    </Box>
  );
}
