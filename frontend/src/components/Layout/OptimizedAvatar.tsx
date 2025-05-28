// Avatar otimizado com melhor renderização de imagem
import { useState, useEffect } from "react";
import {
  Avatar as MuiAvatar,
  useTheme,
  Box,
  CircularProgress,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

export const OptimizedAvatar = ({
  src,
  size = 44,
  onClick,
  isLoading = false,
}: {
  src: string | undefined;
  size?: number;
  onClick?: () => void;
  isLoading?: boolean;
}) => {
  const theme = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  // Preparar URL da imagem com dimensões adequadas
  const optimizedSrc = src
    ? `${src}${src.includes("?") ? "&" : "?"}width=${size * 2}&quality=90`
    : undefined;

  return (
    <Box position="relative" sx={{ width: size, height: size }}>
      {isLoading && (
        <Box
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={2}
          bgcolor="rgba(255,255,255,0.7)"
          borderRadius="50%"
        >
          <CircularProgress size={size * 0.6} />
        </Box>
      )}

      <MuiAvatar
        src={!imageError ? optimizedSrc : undefined}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          bgcolor: "primary.main",
          fontSize: `${size * 0.35}px`,
          border: `3px solid ${theme.palette.custom.accent}`,
          boxShadow: `0 2px 8px 0 ${theme.palette.custom.lightest}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 60%, ${theme.palette.custom.accent} 100%)`,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: `0 4px 16px 0 ${theme.palette.custom.light}`,
            transform: onClick ? "scale(1.05)" : "none",
          },
          // Melhorar a renderização da imagem
          "& .MuiAvatar-img": {
            objectFit: "cover",
            imageRendering: "-webkit-optimize-contrast", // Melhora no Chrome
            backfaceVisibility: "hidden", // Reduz problema de pixelização
            transform: "translateZ(0)", // Forçar aceleração de hardware
          },
        }}
      >
        {(!optimizedSrc || imageError) && <PersonIcon />}
      </MuiAvatar>
    </Box>
  );
};
