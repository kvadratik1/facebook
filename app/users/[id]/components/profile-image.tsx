"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "../profile.module.css";

export default function ProfileImage({ src, name, kind }: {
  src: string | null;
  name: string;
  kind: "avatar" | "cover";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?";

  return (
    <div className={kind === "avatar" ? styles.avatar : styles.cover}>
      {kind === "avatar" && <span role="img" aria-label={`${name}'s avatar`}>{initials}</span>}
      {src && src !== failedSrc && (
        <Image
          src={src}
          alt={kind === "avatar" ? `${name}'s profile photo` : `${name}'s cover photo`}
          fill
          unoptimized
          className={styles.image}
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}
