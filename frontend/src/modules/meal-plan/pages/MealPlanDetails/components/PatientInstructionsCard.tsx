import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Collapse,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

interface PatientInstructionsCardProps {
  instructions: string;
  onSave: (instructions: string) => void;
}

export function PatientInstructionsCard({
  instructions,
  onSave,
}: PatientInstructionsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInstructions, setEditedInstructions] = useState(instructions);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedInstructions(instructions);
  };

  const handleBlur = () => {
    onSave(editedInstructions);
    setIsEditing(false);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Orientações para o Paciente
          </Typography>
          <IconButton onClick={handleExpandClick}>
            <ExpandMoreIcon
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editedInstructions}
                onChange={(e) => setEditedInstructions(e.target.value)}
                onBlur={handleBlur}
                placeholder="Digite as orientações para o paciente..."
                autoFocus
              />
            ) : (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 1,
                  }}
                >
                  <IconButton onClick={handleEditClick} size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    minHeight: "100px",
                    p: 1,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  {instructions || "Nenhuma orientação cadastrada."}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
