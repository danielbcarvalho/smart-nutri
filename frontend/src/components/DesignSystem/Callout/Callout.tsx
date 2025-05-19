import { Box, Typography, useTheme, alpha } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type CalloutVariant = "info" | "warning" | "error" | "success";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

const getIcon = (variant: CalloutVariant) => {
  switch (variant) {
    case "warning":
      return <WarningIcon />;
    case "error":
      return <ErrorIcon />;
    case "success":
      return <CheckCircleIcon />;
    default:
      return <InfoIcon />;
  }
};

export function DesignSystemCallout({
  variant = "info",
  title,
  children,
}: CalloutProps) {
  const theme = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case "warning":
        return alpha(theme.palette.warning.main, 0.1);
      case "error":
        return alpha(theme.palette.error.main, 0.1);
      case "success":
        return alpha(theme.palette.success.main, 0.1);
      default:
        return alpha(theme.palette.secondary.main, 0.1);
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case "warning":
        return theme.palette.warning.main;
      case "error":
        return theme.palette.error.main;
      case "success":
        return theme.palette.success.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "warning":
        return theme.palette.warning.main;
      case "error":
        return theme.palette.error.main;
      case "success":
        return theme.palette.success.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: getBackgroundColor(),
        border: "1px solid",
        borderColor: getBorderColor(),
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          color: getIconColor(),
          display: "flex",
          alignItems: "flex-start",
          pt: 0.5,
        }}
      >
        {getIcon(variant)}
      </Box>
      <Box>
        {title && (
          <Typography
            variant="subtitle2"
            sx={{ mb: 0.5, color: getIconColor() }}
          >
            {title}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {children}
        </Typography>
      </Box>
    </Box>
  );
}
