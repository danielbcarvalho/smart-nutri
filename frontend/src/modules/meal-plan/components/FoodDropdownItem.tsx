import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Alimento } from "./AddFoodToMealModal";

interface FoodDropdownItemProps {
  food: Alimento;
  foodSearch: string;
  onSelect: (food: Alimento) => void;
  onOpenDetails: (food: Alimento) => void;
  highlightTerm: (text: string, term: string) => React.ReactNode;
}

const FoodDropdownItem: React.FC<FoodDropdownItemProps> = ({
  food,
  foodSearch,
  onSelect,
  onOpenDetails,
  highlightTerm,
}) => {
  return (
    <Box
      key={food.id}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1.2,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
        gap: 0.5, // Keep gap for spacing between Name and the right block
        "&:hover": { bgcolor: "grey.100" },
      }}
      onClick={() => onSelect(food)}
    >
      {/* Food Name - Stays on the Left */}
      <Typography
        sx={{
          minWidth: 200,
          maxWidth: 200,
          fontWeight: 500,
          textAlign: "left",
          pr: 1, // Add slight padding to avoid text touching potential border
        }}
      >
        {highlightTerm(food.nome, foodSearch)}
        {food.origem && (
          <Typography
            variant="caption"
            sx={{ display: "block", lineHeight: 1.1 }}
          >
            {food.origem}
          </Typography>
        )}
      </Typography>
      {/* Spacer - Pushes subsequent items to the right */}
      <Box
        sx={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {/* --- Items Appear Right-to-Left Visually (Order reversed in code) --- */}

        {/* Quantity */}
        <Typography
          sx={{
            minWidth: 80,
            maxWidth: 80,
            textAlign: "right",
            pr: 1, // Padding for better alignment from border
            borderRight: "1px solid #eee", // Border on the right now
          }}
          variant="caption"
          color="text.secondary"
        >
          {food.mc?.[0]?.peso
            ? `${food.mc[0].peso} ${food.unidade || "g"}`
            : food.unidade || "-"}
        </Typography>

        {/* Kcal */}
        <Typography
          sx={{
            minWidth: 70,
            maxWidth: 70,
            textAlign: "right",
            pr: 1, // Padding for better alignment
            justifyContent: "flex-end", // Align text content right within flex item
            display: { xs: "none", sm: "flex" },
            borderRight: "1px solid #eee", // Border on the right
          }}
          variant="caption"
          color="text.secondary"
        >
          {food.kcal ?? 0}
        </Typography>

        {/* Lipids (Fat) */}
        <Typography
          sx={{
            minWidth: 70,
            maxWidth: 70,
            textAlign: "right",
            pr: 1, // Padding for better alignment
            justifyContent: "flex-end", // Align text content right
            display: { xs: "none", md: "flex" },
            borderRight: "1px solid #eee", // Border on the right
          }}
          variant="caption"
          color="text.secondary"
        >
          {food.lip ?? 0} g
        </Typography>

        {/* CHO (Carbs) */}
        <Typography
          sx={{
            minWidth: 70,
            maxWidth: 70,
            textAlign: "right",
            pr: 1, // Padding for better alignment
            justifyContent: "flex-end", // Align text content right
            display: { xs: "none", md: "flex" },
            borderRight: "1px solid #eee", // Border on the right
          }}
          variant="caption"
          color="text.secondary"
        >
          {food.cho ?? 0} g
        </Typography>

        {/* Protein */}
        <Typography
          sx={{
            minWidth: 70,
            maxWidth: 70,
            textAlign: "right",
            pr: 1, // Padding for better alignment
            justifyContent: "flex-end", // Align text content right
            display: { xs: "none", md: "flex" },
            borderRight: "1px solid #eee", // Border on the right
          }}
          variant="caption"
          color="text.secondary"
        >
          {food.ptn ?? 0} g
        </Typography>

        {/* Info Button Box - Last element visually on the right */}
        <Box
          sx={{
            minWidth: 40,
            maxWidth: 40,
            display: "flex", // Use flex to center button
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
            // No border needed here as it's the last element
            // Add padding if needed instead of margin on button
            pl: 0.5, // Padding left for spacing from border
          }}
        >
          <IconButton
            size="medium"
            sx={{
              // ml: 1, // Removed margin, use parent padding/centering
              p: 0.5, // Adjust padding if needed
              bgcolor: "success.100",
              "&:hover": { bgcolor: "success.main", color: "white" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(food);
            }}
            aria-label={`Ver detalhes de ${food.nome}`}
            color="primary"
          >
            <InfoIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>{" "}
      {/* End of the right-aligned block */}
    </Box>
  );
};

export default FoodDropdownItem;
