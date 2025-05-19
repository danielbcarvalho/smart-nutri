import { TextField, TextFieldProps } from "@mui/material";
import { ReactNode } from "react";

export type DesignSystemInputVariant = "default" | "filled" | "outlined";

export interface DesignSystemInputProps
  extends Omit<TextFieldProps, "variant"> {
  variant?: DesignSystemInputVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const inputVariants = {
  default: {
    variant: "outlined" as const,
    sx: {
      "& .MuiOutlinedInput-root": {
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "primary.main",
        },
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: "primary.main",
      },
    },
  },
  filled: {
    variant: "filled" as const,
    sx: {
      "& .MuiFilledInput-root": {
        "&.Mui-focused": {
          backgroundColor: "action.hover",
        },
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: "primary.main",
      },
    },
  },
  outlined: {
    variant: "outlined" as const,
    sx: {
      "& .MuiOutlinedInput-root": {
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "primary.main",
        },
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: "primary.main",
      },
    },
  },
};

export const DesignSystemInput = ({
  variant = "default",
  startIcon,
  endIcon,
  ...props
}: DesignSystemInputProps) => {
  const variantProps = inputVariants[variant];

  return (
    <TextField
      {...variantProps}
      InputProps={{
        startAdornment: startIcon,
        endAdornment: endIcon,
        ...props.InputProps,
      }}
      {...props}
      sx={{
        ...variantProps.sx,
        ...props.sx,
      }}
    />
  );
};
