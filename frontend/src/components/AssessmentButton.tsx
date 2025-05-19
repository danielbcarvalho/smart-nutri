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
        fontSize: (theme) => theme.typography.caption.fontSize,
        py: 0.5,
        borderColor: "primary.main",
        color: "primary.main",
        "&:hover": {
          borderColor: "primary.dark",
          bgcolor: "primary.light",
        },
        ...props.sx,
      }}
      {...props}
    >
      Nova Avaliação
    </Button>
  );
}
