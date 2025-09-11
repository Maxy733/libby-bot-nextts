"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import styles from "./profile.module.css";

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
  <div className={styles.wishlistBookCard}>
    <Link href={`/book/${book.id}`} className={styles.bookLink}>
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
        className={styles.bookCoverSmall}
      />
      <div className={styles.bookInfo}>
        <h4 className={styles.bookTitle}>{book.title || "No Title"}</h4>
        <p className={styles.bookAuthor}>{book.author || "Unknown Author"}</p>
        {book.dateAdded && (
          <p className={styles.dateAdded}>
            Added: {new Date(book.dateAdded).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
    {onRemove && (
      <button
        onClick={() => onRemove(book.id)}
        className={styles.removeBtn}
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
    <div className={styles.threeColumnLayout}>
      <div className={styles.leftColumn}>
        <div className={styles.settingsMenu}>
          <h3>Settings</h3>
          <ul>
            <li><Link href="/account-settings">Account Settings</Link></li>
            <li><Link href="/preferences">Preferences</Link></li>
            <li><Link href="/notifications">Notifications</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.middleColumn}>
        <div className="container page-content profile-page">
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              <Image
                src={user.imageUrl}
                alt="Profile avatar"
                width={80}
                height={80}
                className={styles.profileAvatar}
              />
              <div>
                <h1 className={styles.profileName}>
                  {user.firstName} {user.lastName}
                </h1>
                <p className={styles.profileEmail}>
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tabBtn} ${activeTab === "overview" ? styles.active : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Account Overview
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "wishlist" ? styles.active : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              My Wishlist ({wishlistBooks.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className={styles.tabContent}>
              <div className={styles.accountOverview}>
                <h2>Account Status</h2>
                {isLoading ? (
                  <div className={styles.loadingStats}>
                    Loading account information...
                  </div>
                ) : error ? (
                  <div className={styles.errorMessage}>{error}</div>
                ) : (
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <h3>Books in Wishlist</h3>
                      <p className={styles.statNumber}>
                        {userStats?.booksWishlisted || 0}
                      </p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Member Since</h3>
                      <p className={styles.statText}>
                        {userStats?.accountCreated || "Unknown"}
                      </p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Last Active</h3>
                      <p className={styles.statText}>
                        {userStats?.lastActive || "Unknown"}
                      </p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Account Type</h3>
                      <p className={styles.statText}>Standard Member</p>
                    </div>
                  </div>
                )}

                <div className={styles.accountActions}>
                  <h3>Account Actions</h3>
                  <div className={styles.actionButtons}>
                    <Link href="/account-settings" className={`${styles.actionBtn} ${styles.secondary}`}>
                      Edit Profile
                    </Link>
                    <Link href="/preferences" className={`${styles.actionBtn} ${styles.secondary}`}>
                      Reading Preferences
                    </Link>
                    <button onClick={clearWishlist} className={`${styles.actionBtn} ${styles.danger}`}>
                      Clear Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className={styles.tabContent}>
              <div className={styles.wishlistSection}>
                <div className={styles.wishlistHeader}>
                  <h2>My Book Wishlist</h2>
                  {wishlistBooks.length > 0 && (
                    <button onClick={clearWishlist} className={styles.clearWishlistBtn}>
                      Clear All
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className={styles.loadingWishlist}>Loading your wishlist...</div>
                ) : wishlistBooks.length === 0 ? (
                  <div className={styles.emptyWishlist}>
                    <h3>Your wishlist is empty</h3>
                    <p>
                      Start exploring books and add them to your wishlist to keep
                      track of what you want to read!
                    </p>
                    <Link href="/discover" className={styles.discoverBtn}>
                      Discover Books
                    </Link>
                  </div>
                ) : (
                  <div className={styles.wishlistGrid}>
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
      </div>
      <div className={styles.rightColumn}>
        <p>More features coming soon...</p>
      </div>
    </div>
  );
}
