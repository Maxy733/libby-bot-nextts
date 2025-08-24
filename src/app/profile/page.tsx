"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image"; // ✅ Import Next.js Image

interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
  dateAdded?: string;
}

interface UserStats {
  booksWishlisted: number;
  accountCreated: string;
  lastActive: string;
}

const BookCard = ({
  book,
  onRemove,
}: {
  book: Book;
  onRemove?: (bookId: number) => void;
}) => (
  <div className="wishlist-book-card">
    <Link href={`/book/${book.id}`} className="book-link">
      <Image
        src={
          book.coverurl ||
          `https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(
            book.title
          )}`
        }
        alt={book.title || "Book cover"}
        width={60} // match your CSS small cover size
        height={80}
        className="book-cover-small"
      />
      <div className="book-info">
        <h4 className="book-title">{book.title || "No Title"}</h4>
        <p className="book-author">{book.author || "Unknown Author"}</p>
        {book.dateAdded && (
          <p className="date-added">
            Added: {new Date(book.dateAdded).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
    {onRemove && (
      <button
        onClick={() => onRemove(book.id)}
        className="remove-btn"
        aria-label={`Remove ${book.title} from wishlist`}
      >
        ✕
      </button>
    )}
  </div>
);

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "wishlist">(
    "overview"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    }
  }, [isLoaded, user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      const savedWishlist = localStorage.getItem(`wishlist_${user?.id}`);
      const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlistBooks(wishlist);

      setUserStats({
        booksWishlisted: wishlist.length,
        accountCreated: user?.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "Unknown",
        lastActive: new Date().toLocaleDateString(),
      });
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = (bookId: number) => {
    if (!user) return;
    const updatedWishlist = wishlistBooks.filter((book) => book.id !== bookId);
    setWishlistBooks(updatedWishlist);
    localStorage.setItem(
      `wishlist_${user.id}`,
      JSON.stringify(updatedWishlist)
    );
    setUserStats((prev) =>
      prev ? { ...prev, booksWishlisted: updatedWishlist.length } : null
    );
  };

  const clearWishlist = () => {
    if (
      !user ||
      !confirm("Are you sure you want to clear your entire wishlist?")
    )
      return;

    setWishlistBooks([]);
    localStorage.removeItem(`wishlist_${user.id}`);
    setUserStats((prev) => (prev ? { ...prev, booksWishlisted: 0 } : null));
  };

  if (!isLoaded) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container page-content">
        <div className="auth-required">
          <h1>Sign In Required</h1>
          <p>Please sign in to view your profile.</p>
          <Link href="/sign-in" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-info">
          <Image
            src={user.imageUrl}
            alt="Profile avatar"
            width={80}
            height={80}
            className="profile-avatar"
          />
          <div>
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
            </h1>
            <p className="profile-email">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Account Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
          onClick={() => setActiveTab("wishlist")}
        >
          My Wishlist ({wishlistBooks.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="tab-content">
          <div className="account-overview">
            <h2>Account Status</h2>
            {isLoading ? (
              <div className="loading-stats">
                Loading account information...
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Books in Wishlist</h3>
                  <p className="stat-number">
                    {userStats?.booksWishlisted || 0}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Member Since</h3>
                  <p className="stat-text">
                    {userStats?.accountCreated || "Unknown"}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Last Active</h3>
                  <p className="stat-text">
                    {userStats?.lastActive || "Unknown"}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Account Type</h3>
                  <p className="stat-text">Standard Member</p>
                </div>
              </div>
            )}

            <div className="account-actions">
              <h3>Account Actions</h3>
              <div className="action-buttons">
                <Link href="/account-settings" className="action-btn secondary">
                  Edit Profile
                </Link>
                <Link href="/preferences" className="action-btn secondary">
                  Reading Preferences
                </Link>
                <button onClick={clearWishlist} className="action-btn danger">
                  Clear Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "wishlist" && (
        <div className="tab-content">
          <div className="wishlist-section">
            <div className="wishlist-header">
              <h2>My Book Wishlist</h2>
              {wishlistBooks.length > 0 && (
                <button onClick={clearWishlist} className="clear-wishlist-btn">
                  Clear All
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="loading-wishlist">Loading your wishlist...</div>
            ) : wishlistBooks.length === 0 ? (
              <div className="empty-wishlist">
                <h3>Your wishlist is empty</h3>
                <p>
                  Start exploring books and add them to your wishlist to keep
                  track of what you want to read!
                </p>
                <Link href="/discover" className="discover-btn">
                  Discover Books
                </Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlistBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onRemove={removeFromWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
