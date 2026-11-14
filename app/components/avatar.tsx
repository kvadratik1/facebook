"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./avatar.module.css";

export default function Avatar({ src, name, className }: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?";

  return (
    <span className={`${styles.avatar} ${className ?? ""}`} aria-hidden="true">
      {initials}
      {src && src !== failedSrc && (
        <Image src={src} alt="" fill unoptimized sizes="42px"
          className={styles.image} onError={() => setFailedSrc(src)} />
      )}
    </span>
  );
}
