import React from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/RemoveCircle";
import InfoIcon from "@mui/icons-material/Info";
import { Alimento } from "./AddFoodToMealModal";

interface PrescribedFoodItemProps {
  food: Alimento;
  amount: number;
  mcIndex?: number;
  onRemove: (foodId: string) => void;
  onUpdate?: (foodId: string, newAmount: number, newMcIndex: number) => void;
  onOpenDetails?: (food: Alimento) => void;
}

const PrescribedFoodItem: React.FC<PrescribedFoodItemProps> = ({
  food,
  amount,
  mcIndex: mcIndexProp,
  onRemove,
  onUpdate,
  onOpenDetails,
}) => {
  const [mcIndex, setMcIndex] = React.useState(mcIndexProp ?? 0);
  const [mcValue, setMcValue] = React.useState(
    Number.isNaN(amount) ? 0 : parseInt(amount.toString(), 10)
  );
  const isCountableUnit = (nome: string) => {
    const keywords = [
      "unidade",
      "fatia",
      "colher",
      "pedaço",
      "porção",
      "concha",
      "copo",
      "xícara",
      "biscoito",
      "tablete",
      "fatia",
      "pedaço",
      "porção",
      "unid",
      "fatias",
      "unidades",
    ];
    return keywords.some((kw) => nome.includes(kw));
  };

  React.useEffect(() => {
    setMcIndex(mcIndexProp ?? 0);
  }, [mcIndexProp, food]);

  React.useEffect(() => {
    setMcValue(Number.isNaN(amount) ? 0 : parseInt(amount.toString(), 10));
  }, [amount, food]);

  const handleMcUnitChange = (e: SelectChangeEvent<number>) => {
    const idx = Number(e.target.value);
    setMcIndex(idx);
    const nome = food.mc?.[idx]?.nome_mc?.toLowerCase() || "";
    if (isCountableUnit(nome)) {
      setMcValue(1);
      if (onUpdate) onUpdate(food.id, 1, idx);
    } else {
      const peso = Number(food.mc?.[idx]?.peso) || 1;
      setMcValue(peso);
      if (onUpdate) onUpdate(food.id, peso, idx);
    }
  };

  // Fator para cálculo dos macros
  const unidadePeso = Number(food.mc?.[mcIndex]?.peso) || 1;
  const quantidadeGramas = mcValue * unidadePeso;
  const fator = quantidadeGramas / 100;

  return (
    <TableRow
      sx={{
        minHeight: 40,
        borderBottom: "none",
      }}
    >
      <TableCell
        sx={{
          fontWeight: 500,
          minWidth: 180,
          maxWidth: 220,
          px: 1,
          borderBottom: "none",
          background: "none",
          fontSize: "1rem",
        }}
      >
        <Tooltip title={food.nome} arrow placement="top">
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {food.nome}
          </div>
        </Tooltip>
        {food.origem && (
          <div
            style={{ color: "#b0b0b0", fontSize: "0.75em", lineHeight: 1.1 }}
          >
            {food.origem}
          </div>
        )}
      </TableCell>
      <TableCell
        align="center"
        sx={{
          minWidth: 100,
          px: 1,
          display: "flex",
          gap: 1,
          alignItems: "center",
          borderBottom: "none",
        }}
      >
        <input
          type="text"
          value={mcValue === 0 ? "" : mcValue}
          onChange={(e) => {
            // Aceita apenas números inteiros positivos
            const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
            const value = onlyNumbers === "" ? 0 : Number(onlyNumbers);
            setMcValue(value);
            if (onUpdate && value > 0) onUpdate(food.id, value, mcIndex);
          }}
          style={{
            textAlign: "center",
            fontSize: "0.85em",
            width: 60,
            height: 32,
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "0 8px",
            outline: "none",
            backgroundColor: "#fff",
            color: "#222",
            boxShadow: "none",
          }}
          min={1}
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Select
          size="small"
          value={mcIndex}
          onChange={handleMcUnitChange}
          sx={{
            minWidth: 110,
            maxWidth: 110,
            fontSize: "0.85em",
            "& .MuiSelect-select": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            },
            background: "#fff",
            boxShadow: "none",
          }}
        >
          {food.mc?.map((mc, idx) => (
            <MenuItem key={idx} value={idx}>
              {mc.nome_mc}
            </MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          minWidth: 36,
          maxWidth: 66,
          px: 1,
          fontSize: "0.75em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderBottom: "none",
        }}
      >
        {quantidadeGramas.toFixed(1)}g
      </TableCell>
      <TableCell
        align="center"
        sx={{
          minWidth: 36,
          maxWidth: 66,
          px: 1,
          fontSize: "0.75em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderBottom: "none",
        }}
      >
        {(Number(food.ptn ?? 0) * fator).toFixed(1)}g
      </TableCell>
      <TableCell
        align="center"
        sx={{
          minWidth: 36,
          maxWidth: 66,
          px: 1,
          fontSize: "0.75em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderBottom: "none",
        }}
      >
        {(Number(food.lip ?? 0) * fator).toFixed(1)}g
      </TableCell>
      <TableCell
        align="center"
        sx={{
          minWidth: 36,
          maxWidth: 66,
          px: 1,
          fontSize: "0.75em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderBottom: "none",
        }}
      >
        {(Number(food.cho ?? 0) * fator).toFixed(1)}g
      </TableCell>
      <TableCell
        align="center"
        sx={{
          minWidth: 36,
          maxWidth: 66,
          px: 1,
          fontSize: "0.75em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          borderBottom: "none",
        }}
      >
        {(Number(food.kcal ?? 0) * fator).toFixed(1)} Kcal
      </TableCell>
      <TableCell
        align="right"
        sx={{ minWidth: 40, px: 1, borderBottom: "none" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 4,
          }}
        >
          <Tooltip title={`Ver detalhes de ${food.nome}`} arrow>
            <IconButton
              onClick={() => onOpenDetails && onOpenDetails(food)}
              aria-label={`Ver detalhes de ${food.nome}`}
              size="small"
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Remover ${food.nome}`} arrow>
            <IconButton
              onClick={() => onRemove(food.id)}
              aria-label={`Remover ${food.nome}`}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default PrescribedFoodItem;
