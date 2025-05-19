import {
  Snackbar,
  SnackbarProps,
  Alert,
  AlertProps,
  Typography,
} from "@mui/material";

export type DesignSystemSnackbarVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info";

export interface DesignSystemSnackbarProps
  extends Omit<SnackbarProps, "variant"> {
  variant?: DesignSystemSnackbarVariant;
  message: string;
  severity?: AlertProps["severity"];
  onClose?: () => void;
}

export const snackbarVariants = {
  default: {
    sx: {
      "& .MuiAlert-root": {
        backgroundColor: "background.paper",
        color: "text.primary",
      },
    },
  },
  success: {
    sx: {
      "& .MuiAlert-root": {
        backgroundColor: "success.main",
        color: "success.contrastText",
      },
    },
  },
  error: {
    sx: {
      "& .MuiAlert-root": {
        backgroundColor: "error.main",
        color: "error.contrastText",
      },
    },
  },
  warning: {
    sx: {
      "& .MuiAlert-root": {
        backgroundColor: "warning.main",
        color: "warning.contrastText",
      },
    },
  },
  info: {
    sx: {
      "& .MuiAlert-root": {
        backgroundColor: "info.main",
        color: "info.contrastText",
      },
    },
  },
};

export const DesignSystemSnackbar = ({
  variant = "default",
  message,
  severity = "info",
  onClose,
  ...props
}: DesignSystemSnackbarProps) => {
  const variantProps = snackbarVariants[variant];

  return (
    <Snackbar
      {...variantProps}
      {...props}
      sx={{
        ...variantProps.sx,
        ...props.sx,
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          width: "100%",
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <Typography variant="body2">{message}</Typography>
      </Alert>
    </Snackbar>
  );
};
