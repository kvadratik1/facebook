import Image from "next/image";
import styles from "./post-photo.module.css";

export default function PostPhoto({ photoKey, author }: { photoKey: string | null; author: string }) {
  if (!photoKey) return null;

  let src: URL;
  try {
    const base = new URL(process.env.POST_PHOTO_BASE_URL ?? "");
    src = new URL(photoKey, base.origin);
    if (base.protocol !== "https:" || src.origin !== base.origin || !src.pathname.startsWith("/post-photos/")) {
      return null;
    }
  } catch {
    return null;
  }

  return (
    <div className={styles.photo}>
      <Image src={src.href} alt={`Photo attached to ${author}’s post`} fill unoptimized />
    </div>
  );
}
