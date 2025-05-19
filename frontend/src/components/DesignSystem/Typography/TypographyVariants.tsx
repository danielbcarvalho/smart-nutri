import { Typography, TypographyProps } from "@mui/material";

export interface DesignSystemTypographyProps extends TypographyProps {
  variant?: "pageTitle" | "sectionTitle" | "cardTitle" | "bodyText" | "caption";
}

export const typographyVariants = {
  pageTitle: {
    variant: "h4" as const,
    sx: {
      fontWeight: 600,
      lineHeight: 1.2,
      mb: 3,
    },
  },
  sectionTitle: {
    variant: "h5" as const,
    sx: {
      fontWeight: 500,
      lineHeight: 1.3,
      mb: 2,
    },
  },
  cardTitle: {
    variant: "h6" as const,
    sx: {
      fontWeight: 500,
      lineHeight: 1.4,
      mb: 1,
    },
  },
  bodyText: {
    variant: "body1" as const,
    sx: {
      lineHeight: 1.5,
    },
  },
  caption: {
    variant: "caption" as const,
    sx: {
      color: "text.secondary",
    },
  },
};

export const DesignSystemTypography = ({
  variant = "bodyText",
  children,
  ...props
}: DesignSystemTypographyProps) => {
  const variantProps = typographyVariants[variant];

  return (
    <Typography
      {...variantProps}
      {...props}
      sx={{
        ...variantProps.sx,
        ...props.sx,
      }}
    >
      {children}
    </Typography>
  );
};
