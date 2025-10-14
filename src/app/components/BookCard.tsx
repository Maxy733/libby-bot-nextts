"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";
import { Book } from "../../types/book";
import styles from "./BookCard.module.css";
import { useUser } from "@clerk/nextjs";
import { trackUserInteraction } from "../utils/interactionTracker";

interface BookCardProps {
  book: Book;
  showWishlist?: boolean;
  className?: string; // ✅ allows custom styling
}

// Utility function to extract year from various date formats
const getYearFromDate = (date: string | number | null): string => {
  if (!date) return "Unknown Year";

  // If the date is just a numeric year, return it directly
  const yearNum = Number(date);
  if (!isNaN(yearNum) && yearNum > 1000 && yearNum < 3000) {
    return yearNum.toString();
  }

  // Otherwise, try to parse as a date
  try {
    const parsed = new Date(date);
    const parsedYear = parsed.getFullYear();
    return isNaN(parsedYear) ? "Unknown Year" : parsedYear.toString();
  } catch {
    return "Unknown Year";
  }
};

export default function BookCard({
  book,
  showWishlist = false,
}: BookCardProps) {
  const placeholderUrl = "/Libby_Bot.png";
  const { user } = useUser();

  const handleClick = () => {
    // Fire-and-forget tracking so navigation isn't blocked.
    try {
      if (user?.id) {
        trackUserInteraction({
          user_id: user.id,
          book_id: book.id,
          type: "view",
        });
      }
    } catch (err) {
      // ignore
      console.warn("trackUserInteraction failed:", err);
    }
  };

  return (
    <div className={styles["book-card-wrapper"]}>
      <Link
        href={`/book/${book.id}`}
        className={styles["book-card"]}
        onClick={handleClick}
      >
        <img
          src={book.coverurl || placeholderUrl}
          alt={book.title || "Book cover"}
          className={styles["book-cover"]}
        />
        <p className={styles["book-title"]}>{book.title || "No Title"}</p>
        <p className={styles["book-author"]}>
          {book.author || "Unknown Author"}
        </p>
        <p className={styles["book-year"]}>
          {getYearFromDate(book.publication_date)}
        </p>
      </Link>

      {showWishlist && (
        <div className={styles["book-card-actions"]}>
          <WishlistButton
            book={book}
            showText={false}
            className={styles["card-wishlist-btn"]}
          />
        </div>
      )}
    </div>
  );
}
