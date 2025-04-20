import { Box, BoxProps } from "@mui/material";
import { ReactNode } from "react";

type ContainerProps = BoxProps & {
  children: ReactNode;
  fullHeight?: boolean;
};

export const Container = ({
  children,
  fullHeight = false,
  sx,
  ...rest
}: ContainerProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px", // Ajuste conforme necessidade do design
        mx: "auto", // Centraliza o container
        height: fullHeight ? "100%" : "auto",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};
