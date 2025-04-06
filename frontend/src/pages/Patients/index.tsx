import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid as MuiGrid,
  Card,
  Stack,
  Button,
  TextField,
  InputAdornment,
  ButtonGroup,
  IconButton,
  CardActionArea,
  Container,
  alpha,
  Collapse,
  Paper,
  Avatar,
  CardContent,
  CardActions,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  AccountCircle as AccountCircleIcon,
  Instagram as InstagramIcon,
  FileDownload as FileDownloadIcon,
  PersonAdd as PersonAddIcon,
  Tune as TuneIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService, Patient } from "../../services/patientService";
import { format } from "date-fns";

type FilterPeriod = "all" | "1month" | "2months" | "3months" | "custom";
type SortBy = "modified" | "created" | "alphabetical" | "app";

const genderLabels: Record<Patient["gender"], string> = {
  M: "Masculino",
  F: "Feminino",
  OTHER: "Outro",
};

export function Patients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modifiedPeriod, setModifiedPeriod] = useState<FilterPeriod>("all");
  const [createdPeriod, setCreatedPeriod] = useState<FilterPeriod>("all");
  const [selectedGender, setSelectedGender] = useState<
    "all" | Patient["gender"]
  >("all");
  const [sortBy, setSortBy] = useState<SortBy>("alphabetical");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const filteredPatients =
    patients?.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm);

      const matchesGender =
        selectedGender === "all" || patient.gender === selectedGender;

      return matchesSearch && matchesGender;
    }) || [];

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case "modified":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "created":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "alphabetical":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    patient: Patient
  ) => {
    setSelectedPatient(patient);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setSelectedPatient(null);
    setMenuAnchorEl(null);
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ color: "text.primary" }}>
          Pacientes
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{
              borderColor: "custom.main",
              color: "custom.main",
              "&:hover": {
                borderColor: "custom.light",
                bgcolor: "custom.lightest",
              },
            }}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/patients/new")}
            sx={{
              bgcolor: "custom.main",
              "&:hover": {
                bgcolor: "custom.light",
              },
            }}
          >
            Adicionar paciente
          </Button>
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              fullWidth
              placeholder="Buscar pacientes..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                minWidth: { xs: "100%", sm: "auto" },
                borderColor: "custom.main",
                color: "custom.main",
                "&:hover": {
                  borderColor: "custom.light",
                  bgcolor: "custom.lightest",
                },
              }}
            >
              Filtros
            </Button>
          </Box>

          <Collapse in={showFilters}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ pt: 2 }}
            >
              <TextField
                select
                label="Data de modificação"
                fullWidth
                value={modifiedPeriod}
                onChange={(e) =>
                  setModifiedPeriod(e.target.value as FilterPeriod)
                }
              >
                <MenuItem value="all">Todo período</MenuItem>
                <MenuItem value="1month">1 mês atrás</MenuItem>
                <MenuItem value="2months">2 meses atrás</MenuItem>
                <MenuItem value="3months">3 meses atrás</MenuItem>
                <MenuItem value="custom">Personalizar data</MenuItem>
              </TextField>

              <TextField
                select
                label="Data de criação"
                fullWidth
                value={createdPeriod}
                onChange={(e) =>
                  setCreatedPeriod(e.target.value as FilterPeriod)
                }
              >
                <MenuItem value="all">Todo período</MenuItem>
                <MenuItem value="1month">1 mês atrás</MenuItem>
                <MenuItem value="2months">2 meses atrás</MenuItem>
                <MenuItem value="3months">3 meses atrás</MenuItem>
                <MenuItem value="custom">Personalizar data</MenuItem>
              </TextField>

              <TextField
                select
                label="Gênero"
                fullWidth
                value={selectedGender}
                onChange={(e) =>
                  setSelectedGender(e.target.value as "all" | Patient["gender"])
                }
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
                <MenuItem value="OTHER">Outro</MenuItem>
              </TextField>
            </Stack>
          </Collapse>
        </Stack>
      </Paper>

      {/* Patient Cards */}
      <MuiGrid container spacing={3}>
        {sortedPatients.map((patient) => (
          <MuiGrid item xs={12} sm={6} md={4} key={patient.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Avatar
                    src={patient.avatar}
                    sx={{ width: 56, height: 56, bgcolor: "custom.lightest" }}
                  >
                    {patient.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{
                        color: "text.primary",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {patient.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Modificado em{" "}
                      {format(new Date(patient.updatedAt), "dd/MM/yyyy")}
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Chip
                      size="small"
                      label={genderLabels[patient.gender]}
                      sx={{
                        bgcolor: "custom.lightest",
                        color: "text.primary",
                      }}
                    />
                    {patient.instagram && (
                      <Chip
                        size="small"
                        icon={
                          <InstagramIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                        }
                        label={`@${patient.instagram}`}
                        sx={{
                          bgcolor: "custom.lightest",
                          color: "text.primary",
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient/${patient.id}/edit`);
                  }}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "custom.main",
                      bgcolor: "custom.lightest",
                    },
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient/${patient.id}`);
                  }}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "custom.main",
                      bgcolor: "custom.lightest",
                    },
                  }}
                >
                  Ver detalhes
                </Button>
              </CardActions>

              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "text.secondary",
                  "&:hover": {
                    color: "custom.main",
                    bgcolor: "custom.lightest",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, patient);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Card>
          </MuiGrid>
        ))}
      </MuiGrid>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (selectedPatient) {
              navigate(`/patient/${selectedPatient.id}/edit`);
            }
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            if (selectedPatient) {
              navigate(`/patient/${selectedPatient.id}`);
            }
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </ListItemIcon>
          <ListItemText>Ver detalhes</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
