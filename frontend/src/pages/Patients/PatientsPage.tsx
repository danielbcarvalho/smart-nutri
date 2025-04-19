import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Paper } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService, Patient } from "../../services/patientService";
import { PatientTable } from "./components/PatientTable";
import { PatientActionsMenu } from "./components/PatientActionsMenu";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";
import { PatientFormModal } from "../../components/PatientForm/PatientFormModal";

export function Patients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<"name" | "email" | "updatedAt">(
    "updatedAt"
  );
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      handleDeleteDialogClose();
    },
  });

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (patientToDelete) {
      deleteMutation.mutate(patientToDelete.id);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const handleRequestSort = (property: "name" | "email" | "updatedAt") => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

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

  // Filter and sort patients
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (orderBy === "updatedAt") {
      return order === "asc"
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }

    const aValue = a[orderBy]?.toLowerCase() || "";
    const bValue = b[orderBy]?.toLowerCase() || "";

    return order === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <TextField
            placeholder="Buscar paciente..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setIsPatientModalOpen(true)}
          sx={{ bgcolor: "primary.main" }}
        >
          Novo Paciente
        </Button>
      </Box>

      {/* Patient Table */}
      <Paper variant="outlined">
        <PatientTable
          patients={sortedPatients}
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
          onDeleteClick={handleDeleteClick}
          onMenuOpen={handleMenuOpen}
          navigate={navigate}
        />
      </Paper>

      {/* Actions Menu */}
      <PatientActionsMenu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        patient={selectedPatient}
        navigate={navigate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        patientName={patientToDelete?.name || ""}
      />

      {/* PatientFormModal para novo paciente */}
      <PatientFormModal
        open={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => setIsPatientModalOpen(false)}
      />
    </Box>
  );
}
