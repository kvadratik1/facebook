"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type NotificationType = "success" | "error";

type NotificationContextType = {
  message: string;
  type: NotificationType;
  showNotification: (message: string, type?: NotificationType) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("success");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback(
    (message: string, type: NotificationType = "success") => {
      // Cancel the old countdown so each new message gets five full seconds.
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      setMessage(message);
      setType(type);

      timerRef.current = setTimeout(() => {
        setMessage("");
        timerRef.current = null;
      }, 5000);
    },
    [],
  );

  useEffect(() => {
    // Stop the countdown if this provider is removed from the page.
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <NotificationContext value={{ message, type, showNotification }}>
      {children}
    </NotificationContext>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (context === null) {
    throw new Error("useNotification must be used inside NotificationProvider.");
  }

  return context;
}
