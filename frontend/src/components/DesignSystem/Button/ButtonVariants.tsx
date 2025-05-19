import { Button, ButtonProps } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ReactNode } from "react";

export type DesignSystemButtonVariant =
  | "primary"
  | "secondary"
  | "text"
  | "icon"
  | "outlined"
  | "contained"
  | "error"
  | "success"
  | "warning"
  | "info"
  | "disabled";

export interface DesignSystemButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: DesignSystemButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const buttonVariants = {
  primary: {
    variant: "contained" as const,
    sx: {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      "&:hover": {
        bgcolor: "primary.dark",
      },
    },
  },
  secondary: {
    variant: "outlined" as const,
    sx: {
      borderColor: "secondary.main",
      color: "secondary.main",
      "&:hover": {
        borderColor: "secondary.dark",
        bgcolor: alpha("#000", 0.04),
      },
    },
  },
  outlined: {
    variant: "outlined" as const,
    sx: {
      borderColor: "primary.main",
    },
  },
  contained: {
    variant: "contained" as const,
    sx: {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      "&:hover": {
        bgcolor: "primary.dark",
      },
    },
  },
  text: {
    variant: "text" as const,
    sx: {
      color: "primary.main",
      "&:hover": {
        bgcolor: alpha("#000", 0.04),
      },
    },
  },
  icon: {
    variant: "text" as const,
    sx: {
      minWidth: "auto",
      p: 1,
      color: "text.secondary",
      "&:hover": {
        bgcolor: alpha("#000", 0.04),
      },
    },
  },
};

export const DesignSystemButton = ({
  variant = "primary",
  children,
  startIcon,
  endIcon,
  ...props
}: DesignSystemButtonProps) => {
  const variantProps = buttonVariants[variant];

  return (
    <Button
      {...variantProps}
      startIcon={startIcon}
      endIcon={endIcon}
      {...props}
      sx={{
        ...variantProps.sx,
        ...props.sx,
      }}
    >
      {children}
    </Button>
  );
};
