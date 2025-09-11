"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import styles from "./Profile.module.css";

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
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "wishlist" | "preferences" | "notifications">(
    "overview"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferencesGenres, setPreferencesGenres] = useState<string[]>([]);

  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (activeTab === "preferences" && user) {
        try {
          const token = await getToken();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/interests?user_id=${user.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          console.log("Fetched genres:", data.genres);

          if (Array.isArray(data.genres)) {
            const lastFiveGenres = data.genres.slice(-5); // Get the last 5 genres
            setPreferencesGenres(lastFiveGenres);
          }
        } catch (err) {
          console.error("Error loading preferences:", err);
        }
      }
    };
    fetchPreferences();
  }, [activeTab, user, getToken, router]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);

      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlistBooks(wishlist);

      setUserStats({
        booksWishlisted: wishlist.length,
        accountCreated: user?.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "Unknown",
        lastActive: new Date().toLocaleDateString(),
      });

      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/interests?user_id=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Fetch failed:", res.status, errorText);
        throw new Error("Fetch failed");
      }
      const data = await res.json();
      if (Array.isArray(data.genres)) {
        console.log("Loaded interests in overview tab:", data.genres);
      }
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
      {/* Left Sidebar */}
      <div className={styles.leftColumn}>
        <div className={styles.settingsMenu}>
          <h3>Settings</h3>
          <ul>
            <li><button className={styles.tabBtn} onClick={() => setActiveTab("overview")}>Account Overview</button></li>
            <li><button className={styles.tabBtn} onClick={() => setActiveTab("wishlist")}>Wishlist</button></li>
            <li><button className={styles.tabBtn} onClick={() => setActiveTab("preferences")}>Preferences</button></li>
            <li><button className={styles.tabBtn} onClick={() => setActiveTab("notifications")}>Notifications</button></li>
            <li><button onClick={clearWishlist} className={`${styles.actionBtn} ${styles.danger}`}>Clear Wishlist</button></li>
          </ul>
        </div>
      </div>

      {/* Middle Content (Profile) */}
      <div className={styles.middleColumn}>
        <div className={styles.profileContainer}>
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


          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className={styles.tabContent}>
              <div className={styles.accountOverview}>
                <h2>Account Status</h2>
                {isLoading ? (
                  <div className={styles.loadingStats}>Loading account information...</div>
                ) : error ? (
                  <div className={styles.errorMessage}>{error}</div>
                ) : (
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <h3>Books in Wishlist</h3>
                      <p className={styles.statNumber}>{userStats?.booksWishlisted || 0}</p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Member Since</h3>
                      <p className={styles.statText}>{userStats?.accountCreated || "Unknown"}</p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Last Active</h3>
                      <p className={styles.statText}>{userStats?.lastActive || "Unknown"}</p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Account Type</h3>
                      <p className={styles.statText}>Standard Member</p>
                    </div>
                  </div>
                )}

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
                    <p>Start exploring books and add them to your wishlist to keep track of what you want to read!</p>
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

          {activeTab === "preferences" && (
            <div className={styles.tabContent}>
              <h2>Preferences</h2>
              <ul>
                {preferencesGenres.map((genre: string, index: number) => (
                  <li key={index}>{genre}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className={styles.tabContent}>
              <h2>Notifications</h2>
              <p>[TODO: Add notification settings here]</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column (Blank for now) */}
      <div className={styles.rightColumn}>
        <p>More features coming soon...</p>
      </div>
    </div>
  );
}
