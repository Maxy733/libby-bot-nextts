"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import styles from "./Profile.module.css";
import BookCard from "../components/BookCard";
import { Book } from "../../types/book";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

interface RecentActivityItem {
  title: string;
  type: string;
}

interface UserStats {
  booksWishlisted: number;
  accountCreated: string;
  lastActive: string;
  recommendationsCount: number;
  loginCount?: number; // optional if you want to track
  recentActivity: RecentActivityItem[];
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "wishlist" | "preferences" | "notifications"
  >("overview");

  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferencesGenres, setPreferencesGenres] = useState<string[]>([]);

  useEffect(() => {
    const validTabs = ["overview", "wishlist", "preferences", "notifications"];
    const hash = window.location.hash.replace("#", "");
    if (validTabs.includes(hash)) {
      setActiveTab(hash as typeof activeTab);
    }
  }, []);

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
          const res = await fetch(
            `${API_BASE}/api/profile/interests?user_id=${user.id}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );
          const data = await res.json();
          if (Array.isArray(data.genres)) {
            setPreferencesGenres(data.genres.slice(-5)); // last 5 genres
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
        recommendationsCount: 0, // update when backend supports
        recentActivity: [], // placeholder until DB fetch
      });

      // Optionally load backend data (interests, activity, etc.)
      const token = await getToken();
      const res = await fetch(
        `${API_BASE}/api/profile/interests?user_id=${user.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (res.ok) {
        const data = await res.json();
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

  if (!isLoaded) return <div className="loading-container">Loading...</div>;

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
            {["overview", "wishlist", "preferences", "notifications"].map((tab) => (
              <li key={tab}>
                <button
                  className={styles.tabBtn}
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab);
                    window.location.hash = tab;
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
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
              <h2 className={styles.sectionTitle}>Profile Overview</h2>

              {userStats ? (
                <div className={styles.overviewRow}>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewLabel}>Books Wishlisted</div>
                    <div className={styles.overviewValue}>
                      {userStats.booksWishlisted}
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewLabel}>Account Created</div>
                    <div className={styles.overviewValue}>
                      {userStats.accountCreated}
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewLabel}>Last Active</div>
                    <div className={styles.overviewValue}>
                      {userStats.lastActive}
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewLabel}>Recommendations Generated</div>
                    <div className={styles.overviewValue}>
                      {userStats.recommendationsCount}
                    </div>
                  </div>
                  <div className={`${styles.overviewItem} ${styles.recentActivityCard}`}>
                    <div className={styles.overviewLabel}>Recent Activity</div>
                    <ul className={styles.recentActivityList}>
                      {userStats.recentActivity.length > 0 ? (
                        userStats.recentActivity.slice(0, 3).map((act, idx) => (
                          <li key={idx} className={styles.recentActivityItem}>
                            • {act.title} ({act.type})
                          </li>
                        ))
                      ) : (
                        <li className={styles.recentActivityItem}>
                          No recent activity
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className={styles.overviewItem}>
                    <h3 className={styles.sectionSubtitle}>Wishlist Progress</h3>
                    <p>You’ve wishlisted {userStats.booksWishlisted} books 🎉</p>
                    <div className={styles.progressWrapper}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${Math.min(
                            (userStats.booksWishlisted / 50) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading overview...</p>
              )}
            </div>
          )}

          {/* Wishlist / Preferences / Notifications remain same */}
          {activeTab === "wishlist" && (
            <div className={styles.tabContent}>
              <div className={styles.wishlistSection}>
                <div className={styles.wishlistHeader}>
                  <h2>My Book Wishlist</h2>
                  {wishlistBooks.length > 0 && (
                    <button
                      onClick={clearWishlist}
                      className={styles.clearWishlistBtn}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className={styles.loadingWishlist}>
                    Loading your wishlist...
                  </div>
                ) : wishlistBooks.length === 0 ? (
                  <div className={styles.emptyWishlist}>
                    <h3>Your wishlist is empty</h3>
                    <p>
                      Start exploring books and add them to your wishlist to
                      keep track of what you want to read!
                    </p>
                    <Link href="/discover" className={styles.discoverBtn}>
                      Discover Books
                    </Link>
                  </div>
                ) : (
                  <div className={styles.wishlistRow}>
                    {wishlistBooks.map((book) => (
                      <div key={book.id} className={styles.wishlistCardWrapper}>
                        <BookCard book={book} />
                        <button
                          onClick={() => removeFromWishlist(book.id)}
                          className={styles.removeBookBtn}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className={styles.tabContent}>
              <h2>Preferences</h2>
              <div className={styles.preferencesGrid}>
                {preferencesGenres.map((genre: string, index: number) => (
                  <div key={index} className={styles.genreTab}>
                    {genre}
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push("/interests")}
                className={`${styles.actionBtn} ${styles.redoInterestsBtn}`}
              >
                Redo Interests
              </button>
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
    </div>
  );
}