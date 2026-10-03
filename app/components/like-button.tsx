import { toggleLikeButton } from "../actions/posts";
import styles from "./like-button.module.css";

type LikeButtonProps = {
  postId: number;
  likes: number;
  author: string;
};

export default function LikeButton({ postId, likes, author }: LikeButtonProps) {
  return (
    <form action={toggleLikeButton}>
      <input type="hidden" name="id" value={postId} />
      <button
        className={styles.button}
        type="submit"
        aria-label={`Like ${author}'s post`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
        <span>Like</span>
        {likes > 0 && <span className={styles.count}>{likes}</span>}
      </button>
    </form>
  );
}
