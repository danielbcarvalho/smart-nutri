import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { Restaurant as RestaurantIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface MealPlanButtonProps extends Omit<ButtonProps, "onClick"> {
  patientId?: string;
  onClick?: () => void;
}

export function MealPlanButton({
  patientId,
  onClick,
  ...props
}: MealPlanButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (patientId) {
      navigate(`/patient/${patientId}/meal-plans?new=true`);
    }
  };

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<RestaurantIcon />}
      onClick={handleClick}
      sx={{
        minWidth: 140,
        fontSize: "0.75rem",
        py: 0.5,
        borderColor: "info.main",
        color: "info.main",
        "&:hover": {
          borderColor: "info.dark",
          bgcolor: "info.lighter",
        },
        ...props.sx,
      }}
      {...props}
    >
      Novo Plano
    </Button>
  );
}
