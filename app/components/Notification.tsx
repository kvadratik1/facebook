"use client";

import { useNotification } from "./NotificationContext";
import styles from "./notification.module.css";

export default function Notification() {
  const { message, type } = useNotification();

  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {message && (
        <div className={`${styles.banner} ${styles[type]}`}>
          <strong>{type === "success" ? "Success" : "Something went wrong"}</strong>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
