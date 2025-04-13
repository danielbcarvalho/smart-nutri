import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { setNotificationHandler } from "../utils/notificationBus";

type NotificationType = "error" | "success" | "info" | "warning";

interface Notification {
  message: string;
  type: NotificationType;
  open: boolean;
}

interface NotificationContextProps {
  notification: Notification;
  showNotification: (message: string, type?: NotificationType) => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification>({
    message: "",
    type: "info",
    open: false,
  });

  const showNotification = (
    message: string,
    type: NotificationType = "info"
  ) => {
    setNotification({ message, type, open: true });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    setNotificationHandler(showNotification);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, closeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
