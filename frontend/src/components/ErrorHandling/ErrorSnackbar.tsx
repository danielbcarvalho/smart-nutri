import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import { useNotification } from "../../context/NotificationContext";

import { AlertProps } from "@mui/material/Alert";
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ErrorSnackbar: React.FC = () => {
  const { notification, closeNotification } = useNotification();

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={5000}
      onClose={closeNotification}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={closeNotification}
        severity={notification.type as AlertColor}
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default ErrorSnackbar;
