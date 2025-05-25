import React from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DeleteIcon from "@mui/icons-material/Delete";

interface Substitute {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
}

interface FoodItemWithSubstitutesProps {
  food: {
    id: string;
    name: string;
    amount: number;
    unit: string;
    calories: number;
  };
  substitutes: Substitute[];
  onAddSubstitute: () => void;
  onRemoveSubstitute: (substituteId: string) => void;
}

const FoodItemWithSubstitutes: React.FC<FoodItemWithSubstitutesProps> = ({
  food,
  substitutes,
  onAddSubstitute,
  onRemoveSubstitute,
}) => {
  return (
    <>
      {/* Linha principal do alimento */}
      <TableRow hover sx={{ borderBottom: substitutes.length ? 0 : undefined }}>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography fontWeight={600}>{food.amount}</Typography>
          </Box>
        </TableCell>
        <TableCell>{food.unit}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>{food.name}</Typography>
            <Tooltip title="Adicionar substituto">
              <IconButton size="small" onClick={onAddSubstitute}>
                <SwapHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
        <TableCell>{food.calories.toFixed(1)}</TableCell>
      </TableRow>
      {/* Linhas dos substitutos */}
      {substitutes.map((sub) => (
        <TableRow key={sub.id} sx={{ bgcolor: "grey.50" }}>
          <TableCell />
          <TableCell />
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ↳ {sub.name} ({sub.amount} {sub.unit})
              </Typography>
              <Tooltip title="Remover substituto">
                <IconButton
                  size="small"
                  onClick={() => onRemoveSubstitute(sub.id)}
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
          <TableCell>{sub.calories.toFixed(1)}</TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default FoodItemWithSubstitutes;
