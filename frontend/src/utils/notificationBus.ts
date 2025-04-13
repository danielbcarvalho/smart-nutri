type NotificationType = "error" | "success" | "info" | "warning";

type NotificationHandler = (message: string, type?: NotificationType) => void;

let handler: NotificationHandler | null = null;

export function setNotificationHandler(fn: NotificationHandler) {
  handler = fn;
}

export function notify(message: string, type: NotificationType = "info") {
  if (handler) {
    handler(message, type);
  }
}
