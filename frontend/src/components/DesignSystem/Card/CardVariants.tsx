import { Card, CardProps, Box } from "@mui/material";
import { ReactNode } from "react";

export type DesignSystemCardVariant = "default" | "elevated" | "outlined";

export interface DesignSystemCardProps extends Omit<CardProps, "variant"> {
  variant?: DesignSystemCardVariant;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export const cardVariants = {
  default: {
    sx: {
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: 1,
    },
  },
  elevated: {
    sx: {
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: 3,
    },
  },
  outlined: {
    sx: {
      bgcolor: "background.paper",
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
    },
  },
};

export const DesignSystemCard = ({
  variant = "default",
  title,
  subtitle,
  actions,
  children,
  ...props
}: DesignSystemCardProps) => {
  const variantProps = cardVariants[variant];

  return (
    <Card
      {...variantProps}
      {...props}
      sx={{
        ...variantProps.sx,
        ...props.sx,
      }}
    >
      {(title || subtitle || actions) && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box>
            {title}
            {subtitle}
          </Box>
          {actions && <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>}
        </Box>
      )}
      <Box sx={{ p: 2 }}>{children}</Box>
    </Card>
  );
};
