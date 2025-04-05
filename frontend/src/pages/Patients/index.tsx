import React, { useState } from "react";
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
  Grid,
} from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patientService,
  Patient,
  CreatePatientDto,
} from "../../services/patientService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const genderOptions = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
  { value: "OTHER", label: "Outro" },
];

const columns: GridColDef[] = [
  { field: "name", headerName: "Nome", flex: 1 },
  { field: "email", headerName: "Email", flex: 1 },
  { field: "phone", headerName: "Telefone", flex: 1 },
  {
    field: "birthDate",
    headerName: "Data de Nascimento",
    flex: 1,
    valueGetter: (params: GridValueGetterParams) =>
      format(new Date(params.row.birthDate), "dd/MM/yyyy", { locale: ptBR }),
  },
  {
    field: "gender",
    headerName: "Gênero",
    flex: 1,
    valueGetter: (params: GridValueGetterParams) => {
      const genderMap: Record<string, string> = {
        M: "Masculino",
        F: "Feminino",
        OTHER: "Outro",
      };
      return genderMap[params.row.gender] || params.row.gender;
    },
  },
  {
    field: "actions",
    headerName: "Ações",
    flex: 1,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => handleEdit(params.row)}
        >
          Editar
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleDelete(params.row.id)}
        >
          Excluir
        </Button>
      </Box>
    ),
  },
];

export const Patients = () => {
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: patientService.create,
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
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const handleOpen = () => {
    setOpen(true);
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

  const handleClose = () => {
    setOpen(false);
    setSelectedPatient(null);
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
      goals: patient.goals,
      allergies: patient.allergies,
      healthConditions: patient.healthConditions,
      medications: patient.medications,
      observations: patient.observations,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este paciente?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatient) {
      await updateMutation.mutateAsync({
        id: selectedPatient.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Pacientes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Novo Paciente
        </Button>
      </Box>

      <DataGrid
        rows={patients}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedPatient ? "Editar Paciente" : "Novo Paciente"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gênero"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Altura (m)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Peso (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedPatient ? "Salvar" : "Criar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
