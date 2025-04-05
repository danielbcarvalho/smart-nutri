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
  IconButton,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
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

export function Patients() {
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

  const { data: patients, isLoading } = useQuery({
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

    // Converte os valores de string para número antes de enviar
    const formattedData = {
      ...formData,
      height: Number(formData.height),
      weight: Number(formData.weight),
      gender: formData.gender as "M" | "F" | "OTHER", // Garante que apenas M, F ou OTHER seja enviado
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

  const columns: GridColDef<Patient>[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Telefone",
      flex: 1,
    },
    {
      field: "birthDate",
      headerName: "Data de Nascimento",
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Patient>) => {
        if (!row?.birthDate) return "";
        try {
          const date = new Date(row.birthDate);
          if (isNaN(date.getTime())) return row.birthDate;
          return format(date, "dd/MM/yyyy", { locale: ptBR });
        } catch (error) {
          console.error("Erro ao formatar data:", error);
          return row.birthDate;
        }
      },
    },
    {
      field: "gender",
      headerName: "Gênero",
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Patient>) => {
        if (!row?.gender) return "";
        switch (row.gender) {
          case "M":
            return "Masculino";
          case "F":
            return "Feminino";
          case "OTHER":
            return "Outro";
          default:
            return row.gender;
        }
      },
    },
    {
      field: "height",
      headerName: "Altura (cm)",
      flex: 1,
    },
    {
      field: "weight",
      headerName: "Peso (kg)",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      renderCell: ({ row }: GridRenderCellParams<Patient>) => (
        <Box>
          <IconButton onClick={() => handleEdit(row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(row)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%", p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" component="h1">
          Pacientes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Novo Paciente
        </Button>
      </Box>

      <DataGrid
        rows={patients || []}
        columns={columns}
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedPatient ? "Editar Paciente" : "Novo Paciente"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Stack
                spacing={2}
                direction={{ xs: "column", sm: "row" }}
                useFlexGap
                flexWrap="wrap"
              >
                <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Nome"
                    type="text"
                    fullWidth
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                  <TextField
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
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                  <TextField
                    margin="dense"
                    id="phone"
                    label="Telefone"
                    type="tel"
                    fullWidth
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                  <TextField
                    margin="dense"
                    id="birthDate"
                    label="Data de Nascimento"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                  <TextField
                    select
                    margin="dense"
                    id="gender"
                    label="Gênero"
                    fullWidth
                    value={formData.gender}
                    onChange={(e) => {
                      console.log("Mudando gênero para:", e.target.value);
                      setFormData({
                        ...formData,
                        gender: e.target.value as "M" | "F" | "OTHER",
                      });
                      console.log("Novo formData:", {
                        ...formData,
                        gender: e.target.value,
                      });
                    }}
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Feminino</MenuItem>
                    <MenuItem value="OTHER">Outro</MenuItem>
                  </TextField>
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                  <TextField
                    margin="dense"
                    id="height"
                    label="Altura (cm)"
                    type="number"
                    fullWidth
                    inputProps={{
                      step: "0.01",
                      min: "0",
                    }}
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
                  <TextField
                    margin="dense"
                    id="weight"
                    label="Peso (kg)"
                    type="number"
                    fullWidth
                    inputProps={{
                      step: "0.01",
                      min: "0",
                    }}
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                  />
                </Box>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {selectedPatient ? "Salvar" : "Criar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
