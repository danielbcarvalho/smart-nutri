import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Typography, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import { LoadingBackdrop } from "../../components/LoadingBackdrop";
import { patientService, Measurement } from "../../services/patientService";
import { MeasurementsTable } from "./components/MeasurementsTable";
import { NewMeasurementModal } from "./components/NewMeasurementModal";

export function Measurements() {
  const { patientId } = useParams<{ patientId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null);

  const { data: measurements, isLoading } = useQuery({
    queryKey: ["measurements", patientId],
    queryFn: () => patientService.findMeasurements(patientId!),
  });

  const handleOpenModal = () => {
    setSelectedMeasurement(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditMeasurement = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Medições</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenModal}
        >
          Nova medição
        </Button>
      </Stack>

      {isLoading ? (
        <LoadingBackdrop open={isLoading} />
      ) : (
        <MeasurementsTable
          measurements={measurements || []}
          onEditMeasurement={handleEditMeasurement}
        />
      )}

      <NewMeasurementModal
        open={isModalOpen}
        onClose={handleCloseModal}
        patientId={patientId!}
        measurement={selectedMeasurement}
      />
    </Box>
  );
}
