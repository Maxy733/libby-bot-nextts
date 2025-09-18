"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";
import { Book } from "../../types/book";



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
        <p className="book-year">{getYearFromDate(book.publication_date)}</p>
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