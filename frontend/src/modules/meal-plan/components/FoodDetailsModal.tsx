import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Alimento } from "./AddFoodToMealModal";

interface FoodDetailsModalProps {
  open: boolean;
  onClose: () => void;
  food: Alimento | null;
  onAdd?: (food: Alimento) => void;
}

const micronutrientesEsquerda = [
  { key: "colesterol", label: "Colesterol" },
  { key: "fibras", label: "Fibra alimentar" },
  { key: "na", label: "Sódio" },
  { key: "vitb6", label: "Vitamina B6" },
  { key: "ca", label: "Cálcio" },
  { key: "fe", label: "Ferro" },
  { key: "mg", label: "Magnésio" },
];
const micronutrientesDireita = [
  { key: "p", label: "Fósforo" },
  { key: "k", label: "Potássio" },
  { key: "zn", label: "Zinco" },
  { key: "co", label: "Cobre" },
  { key: "mn", label: "Manganês" },
  { key: "tiamina", label: "Tiamina" },
  { key: "riboflavina", label: "Riboflavina" },
];

const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({
  open,
  onClose,
  food,
  onAdd,
}) => {
  if (!food) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: "center" }}>{food.nome}</DialogTitle>
      <DialogContent>
        <Typography align="center" sx={{ mb: 2 }}>
          {food.mc?.[0]?.nome_mc
            ? `${food.mc[0].nome_mc} (${food.mc[0].peso} ${
                food.unidade || "g"
              })`
            : null}
        </Typography>
        <Typography align="center" variant="h6" sx={{ mt: 2, mb: 1 }}>
          Macronutrientes
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <Grid item xs={3} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">Energia</Typography>
            <Typography>{food.kcal ?? 0} kcal</Typography>
          </Grid>
          <Grid item xs={3} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">Gordura</Typography>
            <Typography>{food.lip ?? 0} g</Typography>
          </Grid>
          <Grid item xs={3} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">Carboidratos</Typography>
            <Typography>{food.cho ?? 0} g</Typography>
          </Grid>
          <Grid item xs={3} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">Proteína</Typography>
            <Typography>{food.ptn ?? 0} g</Typography>
          </Grid>
        </Grid>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography align="center" variant="h6" sx={{ mb: 1 }}>
            Micronutrientes
          </Typography>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ width: "100%" }}
          >
            <Grid item xs={6}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Nutriente</b>
                    </TableCell>
                    <TableCell>
                      <b>Valor</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {micronutrientesEsquerda.map((nutr) => (
                    <TableRow key={nutr.key}>
                      <TableCell>{nutr.label}</TableCell>
                      <TableCell>
                        {food[nutr.key] ?? 0} {nutr.key === "na" ? "mg" : "g"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={6}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Nutriente</b>
                    </TableCell>
                    <TableCell>
                      <b>Valor</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {micronutrientesDireita.map((nutr) => (
                    <TableRow key={nutr.key}>
                      <TableCell>{nutr.label}</TableCell>
                      <TableCell>
                        {food[nutr.key] ?? 0} {nutr.key === "na" ? "mg" : "g"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        {onAdd && (
          <Button
            variant="contained"
            color="success"
            onClick={() => food && onAdd(food)}
          >
            Adicionar alimento
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FoodDetailsModal;
