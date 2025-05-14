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

interface Alimento {
  nome: string;
  mc?: Array<{
    nome_mc: string;
    peso: number;
  }>;
  unidade?: string;
  kcal?: number;
  lip?: number;
  cho?: number;
  ptn?: number;
  colesterol?: number;
  fibras?: number;
  na?: number;
  vitb6?: number;
  ca?: number;
  fe?: number;
  mg?: number;
  p?: number;
  k?: number;
  zn?: number;
  co?: number;
  mn?: number;
  tiamina?: number;
  riboflavina?: number;
}

interface FoodDetailsModalProps {
  open: boolean;
  onClose: () => void;
  food: Alimento | null;
  onAdd?: (food: Alimento) => void;
}

const micronutrientesEsquerda = [
  { key: "colesterol" as keyof Alimento, label: "Colesterol" },
  { key: "fibras" as keyof Alimento, label: "Fibra alimentar" },
  { key: "na" as keyof Alimento, label: "Sódio" },
  { key: "vitb6" as keyof Alimento, label: "Vitamina B6" },
  { key: "ca" as keyof Alimento, label: "Cálcio" },
  { key: "fe" as keyof Alimento, label: "Ferro" },
  { key: "mg" as keyof Alimento, label: "Magnésio" },
];
const micronutrientesDireita = [
  { key: "p" as keyof Alimento, label: "Fósforo" },
  { key: "k" as keyof Alimento, label: "Potássio" },
  { key: "zn" as keyof Alimento, label: "Zinco" },
  { key: "co" as keyof Alimento, label: "Cobre" },
  { key: "mn" as keyof Alimento, label: "Manganês" },
  { key: "tiamina" as keyof Alimento, label: "Tiamina" },
  { key: "riboflavina" as keyof Alimento, label: "Riboflavina" },
];

const renderValue = (
  value: string | number | Array<{ nome_mc: string; peso: number }> | undefined,
  key: keyof Alimento
): React.ReactNode => {
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((item, index) => (
          <div key={index}>
            {item.nome_mc}: {item.peso}g
          </div>
        ))}
      </>
    );
  }
  const displayValue = value ?? 0;
  const unit = key === "na" ? "mg" : "g";
  return `${displayValue} ${unit}`;
};

const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({
  open,
  onClose,
  food,
  onAdd,
}) => {
  if (!food) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 1400 }}
    >
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
            mb: 2,
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="subtitle2">Energia</Typography>
            <Typography>{food.kcal ?? 0} kcal</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Gordura</Typography>
            <Typography>{food.lip ?? 0} g</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Carboidratos</Typography>
            <Typography>{food.cho ?? 0} g</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2">Proteína</Typography>
            <Typography>{food.ptn ?? 0} g</Typography>
          </Box>
        </Box>
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
              width: "100%",
            }}
          >
            <Box>
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
                  {micronutrientesEsquerda.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>
                        {renderValue(food[item.key], item.key)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box>
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
                  {micronutrientesDireita.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>
                        {renderValue(food[item.key], item.key)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
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
