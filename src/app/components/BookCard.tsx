"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";
import { Book } from "../../types/book";
import styles from './BookCard.module.css';



interface BookCardProps {
  book: Book;
  showWishlist?: boolean;
}

// Utility function to extract year from various date formats
const getYearFromDate = (date: string | Date | null): string => {
  if (!date) return "Unknown Year";
  
  try {
    // Handle both Date objects and date strings (same logic as your working code)
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    
    // Check if year is valid
    if (isNaN(year)) return "Unknown Year";
    
    return year.toString();
  } catch (error) {
    return "Unknown Year";
  }
};

export default function BookCard({ book, showWishlist = false, onPrevious, onNext, showControls = false }: BookCardProps & {
  onPrevious?: () => void;
  onNext?: () => void;
  showControls?: boolean;
}) {
  const placeholderUrl = `https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title || "No Title")}`;
  
  return (
    <div className={styles["book-card-wrapper"]}>
      {showControls && (
        <>
          <button
            onClick={onPrevious}
            className={`${styles['carousel-arrow']} ${styles['carousel-arrow-left']}`}
            aria-label="Previous book"
          >
            ←
          </button>
          <button
            onClick={onNext}
            className={`${styles['carousel-arrow']} ${styles['carousel-arrow-right']}`}
            aria-label="Next book"
          >
            →
          </button>
        </>
      )}
      <Link href={`/book/${book.id}`} className={styles["book-card"]}>
        <img
          src={book.coverurl || placeholderUrl}
          alt={book.title || "Book cover"}
          className={styles["book-cover"]}
        />
        <p className={styles["book-title"]}>{book.title || "No Title"}</p>
        <p className={styles["book-author"]}>{book.author || "Unknown Author"}</p>
        <p className={styles["book-year"]}>{getYearFromDate(book.publication_date)}</p>
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