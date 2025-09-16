"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";

export interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
  publication_date: Date | null;
}

interface BookCardProps {
  book: Book;
  showWishlist?: boolean;
}

// Component
export default function BookCard({ book, showWishlist = false }: BookCardProps) {
  return (
    <div className="book-card-wrapper">
      <Link href={`/book/${book.id}`} className="book-card">
        <img
          src={
            book.coverurl ||
            `https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(
              book.title
            )}`
          }
          alt={book.title}
          className="book-cover"
        />
        <p className="book-title">{book.title || "No Title"}</p>
        <p className="book-author">{book.author || "Unknown Author"}</p>
        <p className="book-year">
          {book.publication_date
            ? new Date(book.publication_date).getFullYear()
            : "Unknown Year"}
        </p>

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
