"use client";

import React, { useState } from "react";
import { useWishlist } from "../hooks/useWishlist";
import { useUser } from "@clerk/nextjs";
import { addToWishlistWithTracking } from "../utils/interactionTracker";

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
  const { user } = useUser();
  const [isAnimating, setIsAnimating] = useState(false);

  const inWishlist = isInWishlist(book.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);

    if (inWishlist) {
      removeFromWishlist(book.id);
    } else {
      const ok = addToWishlist(book);

      // best-effort tracking
      try {
        if (ok && user?.id) {
          addToWishlistWithTracking(user.id, book.id);
        }
      } catch (err) {
        console.warn("addToWishlistWithTracking failed:", err);
      }
    }

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
