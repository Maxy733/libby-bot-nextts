"use client";

import React, { useState } from "react";
import { useWishlist } from "../hooks/useWishlist";

interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
}

interface WishlistButtonProps {
  book: Book;
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({
  book,
  className = "",
  showText = true,
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const inWishlist = isInWishlist(book.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a link
    e.stopPropagation();

    setIsAnimating(true);

    if (inWishlist) {
      const success = removeFromWishlist(book.id);
      if (success && showText) {
        // Optional: Show toast notification
        console.log("Removed from wishlist");
      }
    } else {
      const success = addToWishlist(book);
      if (success && showText) {
        // Optional: Show toast notification
        console.log("Added to wishlist");
      }
    }

    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`wishlist-btn ${inWishlist ? "in-wishlist" : ""} ${
        isAnimating ? "animating" : ""
      } ${className}`}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span className="wishlist-icon">{inWishlist ? "❤️" : "🤍"}</span>
      {showText && (
        <span className="wishlist-text">
          {inWishlist ? "In Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </button>
  );
}
