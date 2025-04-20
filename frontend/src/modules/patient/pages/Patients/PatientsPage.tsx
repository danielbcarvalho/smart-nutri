import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Paper } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PatientsTable } from "@/modules/patient/components/PatientsTable";
import { DeleteConfirmationDialog } from "@/modules/patient/components/DeleteConfirmationDialog";
import {
  Patient,
  patientService,
} from "@/modules/patient/services/patientService";
import { PatientFormModal } from "@components/PatientForm/PatientFormModal";

export function Patients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<"name" | "email" | "updatedAt">(
    "updatedAt"
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

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

  const handleEditClick = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsPatientModalOpen(true);
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
          onClick={() => {
            setIsPatientModalOpen(true);
            setPatientToEdit(null);
          }}
          sx={{ bgcolor: "primary.main" }}
        >
          Novo Paciente
        </Button>
      </Box>

      {/* Patient Table */}
      <Paper variant="outlined">
        <PatientsTable
          patients={sortedPatients}
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
          onDeleteClick={handleDeleteClick}
          navigate={navigate}
          onEditClick={handleEditClick}
        />
      </Paper>

      {/* Actions Menu */}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        patientName={patientToDelete?.name || ""}
      />

      {/* PatientFormModal para novo/editar paciente */}
      <PatientFormModal
        open={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => setIsPatientModalOpen(false)}
        patient={patientToEdit}
      />
    </Box>
  );
}
