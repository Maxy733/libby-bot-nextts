import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
  dateAdded?: string;
}

export const useWishlist = () => {
  const { user } = useUser();
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist on component mount
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlistBooks([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadWishlist = () => {
    if (!user) {
      setWishlistBooks([]);
      setIsLoading(false);
      return;
    }

    try {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlistBooks(wishlist);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setWishlistBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = (book: Book) => {
    if (!user) {
      alert("Please sign in to add books to your wishlist");
      return false;
    }

    const bookWithDate = {
      ...book,
      dateAdded: new Date().toISOString(),
    };

    const updatedWishlist = [...wishlistBooks, bookWithDate];
    setWishlistBooks(updatedWishlist);

    try {
      localStorage.setItem(
        `wishlist_${user.id}`,
        JSON.stringify(updatedWishlist)
      );
      return true;
    } catch (error) {
      console.error("Error saving to wishlist:", error);
      // Revert the state change if saving failed
      setWishlistBooks(wishlistBooks);
      return false;
    }
  };

  const removeFromWishlist = (bookId: number) => {
    if (!user) return false;

    const updatedWishlist = wishlistBooks.filter((book) => book.id !== bookId);
    setWishlistBooks(updatedWishlist);

    try {
      localStorage.setItem(
        `wishlist_${user.id}`,
        JSON.stringify(updatedWishlist)
      );
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      // Revert the state change if saving failed
      setWishlistBooks(wishlistBooks);
      return false;
    }
  };

  const isInWishlist = (bookId: number) => {
    return wishlistBooks.some((book) => book.id === bookId);
  };

  const clearWishlist = () => {
    if (!user) return false;

    setWishlistBooks([]);

    try {
      localStorage.removeItem(`wishlist_${user.id}`);
      return true;
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      return false;
    }
  };

  return {
    wishlistBooks,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlistBooks.length,
  };
};
