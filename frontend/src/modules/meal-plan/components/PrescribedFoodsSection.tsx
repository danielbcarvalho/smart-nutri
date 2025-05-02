import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  useTheme,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PrescribedFoodItem from "./PrescribedFoodItem";
import { Alimento } from "./AddFoodToMealModal";

interface PrescribedFoodsSectionProps {
  selectedFoods: Array<{ food: Alimento; amount: number; mcIndex?: number }>;
  handleRemoveFood: (foodId: string) => void;
  handleUpdatePrescribedFood: (
    foodId: string,
    newAmount: number,
    newMcIndex: number
  ) => void;
  handleOpenDetails: (food: Alimento) => void;
}

const PrescribedFoodsSection: React.FC<PrescribedFoodsSectionProps> = ({
  selectedFoods,
  handleRemoveFood,
  handleUpdatePrescribedFood,
  handleOpenDetails,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        mb: 2,
        minHeight: 60,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: theme.palette.primary.main,
          textAlign: "center",
        }}
      >
        Alimentos Prescritos
      </Typography>
      {selectedFoods.length === 0 ? (
        <Typography
          color="text.secondary"
          align="center"
          sx={{
            py: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddCircleOutlineIcon
            sx={{ fontSize: 24, color: theme.palette.text.disabled }}
          />
          Você ainda não cadastrou alimentos para esta refeição. Use o buscador
          acima para começar.
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 400, overflowX: "auto" }}>
          <Table size="small" aria-label="Tabela de alimentos prescritos">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "30%", md: "20%" },
                    color: theme.palette.text.primary,
                  }}
                >
                  Nome do Alimento
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "20%", md: "15%" },
                    color: theme.palette.text.primary,
                  }}
                >
                  Medida Caseira
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "10%", md: "10%" },
                    color: theme.palette.text.primary,
                  }}
                >
                  Qtd.
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "10%", md: "10%" },
                    color: theme.palette.text.primary,
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Prot.
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "10%", md: "10%" },
                    color: theme.palette.text.primary,
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Lip.
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "10%", md: "10%" },
                    color: theme.palette.text.primary,
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Carb.
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "10%", md: "10%" },
                    color: theme.palette.text.primary,
                    display: { xs: "none", md: "table-cell" },
                  }}
                >
                  Cal.
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: "bold",
                    px: 1.5,
                    py: 1,
                    width: { xs: "10%", md: "5%" },
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedFoods.map(({ food }) => (
                <PrescribedFoodItem
                  key={food.id}
                  food={food}
                  onRemove={handleRemoveFood}
                  onUpdate={handleUpdatePrescribedFood}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default PrescribedFoodsSection;
