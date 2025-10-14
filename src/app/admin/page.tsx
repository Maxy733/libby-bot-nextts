"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import styles from "./Admin.module.css";
import BookCard from "../components/BookCard";
import { Book } from "../../types/book";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

interface UserStats {
  recommendationsCount: number;
  totalUsers?: number;
  newSignupsWeek?: number;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "recommendations" | "books" | "analytics" | "settings"
  >("dashboard");

  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferencesGenres, setPreferencesGenres] = useState<string[]>([]);

  // Notification preference state
  const [emailFreq, setEmailFreq] = useState<"weekly" | "monthly" | "none">(
    "none"
  );
  const [savingPref, setSavingPref] = useState(false);
  const [prefLoaded, setPrefLoaded] = useState(false);
  const [prefMsg, setPrefMsg] = useState<string | null>(null);

  useEffect(() => {
    const validTabs = ["dashboard", "users", "recommendations", "books", "analytics", "settings"];
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
      if (activeTab === "settings" && user) {
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

  // Load current notification preferences when Notifications tab is opened
  useEffect(() => {
    const loadPref = async () => {
      if (activeTab !== "settings" || !user) return;
      try {
        const token = await getToken();
        const res = await fetch(
          `${API_BASE}/api/notify/email?clerk_user_id=${user.id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok) throw new Error("Failed to load preference");
        const data = await res.json();
        if (data.ok) {
          setEmailFreq((data.email_frequency || "none") as typeof emailFreq);
          setPrefLoaded(true);
        }
      } catch (e) {
        console.error(e);
        setPrefLoaded(true);
      }
    };
    loadPref();
  }, [activeTab, user, getToken]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);

      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      setWishlistBooks(wishlist);

      // fetch recommendation count
      const token = await getToken();
      const resCount = await fetch(
        `${API_BASE}/api/profile/recommendations/count?user_id=${user.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const countData = await resCount.json();

      setUserStats({
        recommendationsCount: countData.count ?? 0,
      });

      // Optionally load backend data (interests, activity, etc.)
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
  };

  const clearWishlist = () => {
    if (
      !user ||
      !confirm("Are you sure you want to clear your entire wishlist?")
    )
      return;

    setWishlistBooks([]);
    localStorage.removeItem(`wishlist_${user.id}`);
  };

  // Save email notification preference and optionally trigger a sample send
  const saveEmailPref = async () => {
    if (!user) return;
    setSavingPref(true);
    setPrefMsg(null);
    try {
      const token = await getToken();

      const res = await fetch(`${API_BASE}/api/notify/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clerk_user_id: user.id,
          frequency: emailFreq,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json?.error || "Save failed");
      }

      if (json.send_now) {
        setPrefMsg(
          json.send_now.ok
            ? "Email sent! Check your inbox."
            : `Could not send now: ${json.send_now.reason}`
        );
      } else {
        setPrefMsg("Email notifications turned off.");
      }
    } catch (e: any) {
      console.error(e);
      setPrefMsg(e?.message || "Something went wrong");
    } finally {
      setSavingPref(false);
    }
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
          <ul>
            {["dashboard", "users", "recommendations", "books", "analytics", "settings"].map(
              (tab) => (
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
              )
            )}
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
          {activeTab === "dashboard" && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Dashboard</h2>

              {userStats ? (
                <>
                  <div className={styles.overviewRow}>
                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>Total Users</div>
                      <div className={styles.overviewValue}>
                        {userStats.totalUsers ?? 0}
                      </div>
                    </div>

                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>Books in Library</div>
                      <div className={styles.overviewValue}>
                        {wishlistBooks.length}
                      </div>
                    </div>

                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>Active Recommendations</div>
                      <div className={styles.overviewValue}>
                        {userStats.recommendationsCount}
                      </div>
                    </div>

                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>New Sign-up This Week</div>
                      <div className={styles.overviewValue}>
                          {userStats.newSignupsWeek ?? 0}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p>Loading overview...</p>
              )}
            </div>
          )}

                    {activeTab === "users" && (
            <div className={styles.tabContent}>
              <h2>User Management</h2>
              {/* User management content will go here */}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className={styles.tabContent}>
              <h2>Recommendations</h2>
              {/* Recommendations management content will go here */}
            </div>
          )}

          {activeTab === "books" && (
            <div className={styles.tabContent}>
              <h2>Book Management</h2>
              {/* Book management content will go here */}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.tabContent}>
              <h2>Analytics Dashboard</h2>
              {/* Analytics content will go here */}
            </div>
          )}

          {activeTab === "settings" && (
            <div className={styles.tabContent}>
              <h2>System Settings</h2>
              {/* Settings content will go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
