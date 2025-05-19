import {
  Select,
  SelectProps,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { ReactNode } from "react";

export type DesignSystemSelectVariant = "default" | "filled" | "outlined";

export interface DesignSystemSelectProps extends Omit<SelectProps, "variant"> {
  variant?: DesignSystemSelectVariant;
  label?: string;
  options: Array<{
    value: string | number;
    label: string;
  }>;
  onChange?: (event: SelectChangeEvent<unknown>) => void;
}

export const selectVariants = {
  default: {
    variant: "outlined" as const,
    sx: {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "divider",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
      },
      "& .MuiSelect-icon": {
        color: "text.secondary",
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
      "& .MuiSelect-icon": {
        color: "text.secondary",
      },
    },
  },
  outlined: {
    variant: "outlined" as const,
    sx: {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "divider",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
      },
      "& .MuiSelect-icon": {
        color: "text.secondary",
      },
    },
  },
};

export const DesignSystemSelect = ({
  variant = "default",
  label,
  options,
  onChange,
  ...props
}: DesignSystemSelectProps) => {
  const variantProps = selectVariants[variant];

  return (
    <FormControl
      variant={variantProps.variant}
      sx={{
        minWidth: 200,
        ...props.sx,
      }}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        {...variantProps}
        label={label}
        onChange={onChange}
        {...props}
        sx={{
          ...variantProps.sx,
          ...props.sx,
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
