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
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridInitialState,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 960);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
      setIsTablet(window.innerWidth < 960);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initialState: GridInitialState = {
    columns: {
      columnVisibilityModel: {
        email: !isMobile,
        phone: !isMobile,
        height: !isTablet,
        weight: !isTablet,
      },
    },
  };

  const columns: GridColDef<Patient>[] = [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: "Telefone",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "birthDate",
      headerName: "Data de Nascimento",
      flex: 1,
      minWidth: 130,
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
      minWidth: 100,
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
      minWidth: 100,
    },
    {
      field: "weight",
      headerName: "Peso (kg)",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }: GridRenderCellParams<Patient>) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleEdit(row)}
            sx={{
              padding: { xs: "8px", sm: "4px" }, // Maior área de toque em mobile
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row)}
            sx={{
              padding: { xs: "8px", sm: "4px" }, // Maior área de toque em mobile
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%", p: { xs: 1, sm: 2 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" component="h1">
          Pacientes
        </Typography>
        <Button
          variant="contained"
          onClick={handleClickOpen}
          startIcon={<AddIcon />}
          sx={{
            minWidth: { xs: "auto", sm: "140px" },
            px: { xs: 2, sm: 3 },
          }}
        >
          {window.innerWidth < 600 ? "+" : "Novo Paciente"}
        </Button>
      </Stack>

      <DataGrid
        rows={patients || []}
        columns={columns}
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
        initialState={initialState}
        sx={{
          "& .MuiDataGrid-cell": {
            padding: { xs: "8px 4px", sm: "16px 8px" },
          },
          "& .MuiDataGrid-columnHeader": {
            padding: { xs: "8px 4px", sm: "16px 8px" },
          },
        }}
      />

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
    </Box>
  );
}
