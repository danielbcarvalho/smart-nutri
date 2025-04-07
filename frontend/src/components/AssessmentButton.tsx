import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { Assessment as AssessmentIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface AssessmentButtonProps extends Omit<ButtonProps, "onClick"> {
  patientId?: string;
  onClick?: () => void;
}

export function AssessmentButton({
  patientId,
  onClick,
  ...props
}: AssessmentButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (patientId) {
      navigate(`/patient/${patientId}/assessments/new`);
    }
  };

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<AssessmentIcon />}
      onClick={handleClick}
      sx={{
        fontSize: "0.75rem",
        py: 0.5,
        borderColor: "success.main",
        color: "success.main",
        "&:hover": {
          borderColor: "success.dark",
          bgcolor: "success.lighter",
        },
        ...props.sx,
      }}
      {...props}
    >
      Nova Avaliação
    </Button>
  );
}
