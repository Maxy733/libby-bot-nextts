"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";

export interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
  publication_date: string | Date | null;
}

interface BookCardProps {
  book: Book;
  showWishlist?: boolean;
}

// Utility function to format date nicely
const formatDate = (date: string | Date | null): string => {
  if (!date) return "Unknown Date";

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Unknown Date";

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Unknown Date";
  }
};


export default function BookCard({ book, showWishlist = false }: BookCardProps) {
  const placeholderUrl = `https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title || "No Title")}`;
  
  return (
    <div className="book-card-wrapper">
      <Link href={`/book/${book.id}`} className="book-card">
        <img
          src={book.coverurl || placeholderUrl}
          alt={book.title || "Book cover"}
          className="book-cover"
        />
        <p className="book-title">{book.title || "No Title"}</p>
        <p className="book-author">{book.author || "Unknown Author"}</p>
        <p className="book-date">{formatDate(book.publication_date)}</p>
      </Link>

      {showWishlist && (
        <div className="book-card-actions">
          <WishlistButton
            book={book}
            showText={false}
            className="card-wishlist-btn"
          />
        </div>
      )}
    </div>
  );
}