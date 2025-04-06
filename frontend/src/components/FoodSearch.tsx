import React, { useState } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { foodService, Food } from "../services/foodService";

interface FoodSearchProps {
  onSelectFood: (food: Food) => void;
}

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: foods, isLoading } = useQuery({
    queryKey: ["foods", searchTerm],
    queryFn: () => foodService.searchFoods(searchTerm),
    enabled: searchTerm.length > 2, // só busca com 3+ caracteres
  });

  return (
    <Box>
      <TextField
        fullWidth
        label="Buscar alimento"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Paper
        variant="outlined"
        sx={{
          maxHeight: 300,
          overflow: "auto",
          bgcolor: "background.paper",
          borderColor: "divider",
        }}
      >
        <List>
          {isLoading && (
            <ListItem>
              <ListItemText
                primary="Buscando..."
                primaryTypographyProps={{
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              />
            </ListItem>
          )}

          {!isLoading && foods?.length === 0 && (
            <ListItem>
              <ListItemText
                primary="Nenhum alimento encontrado"
                primaryTypographyProps={{
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              />
            </ListItem>
          )}

          {foods?.map((food) => (
            <ListItem
              key={food.id}
              sx={{
                "&:hover": {
                  bgcolor: "custom.lightest",
                },
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="adicionar"
                  onClick={() => onSelectFood(food)}
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "custom.main",
                      bgcolor: "custom.lightest",
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={food.name}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {food.calories} kcal | P: {food.protein}g | C:{" "}
                    {food.carbohydrates}g | G: {food.fat}g
                  </Typography>
                }
                primaryTypographyProps={{
                  color: "text.primary",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
