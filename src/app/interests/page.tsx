"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import styles from "./interests.module.css";

const GENRES = [
  { key: "fiction", label: "Fiction" },
  { key: "technology", label: "Technology" },
  { key: "science", label: "Science" },
  { key: "history", label: "History" },
  { key: "philosophy", label: "Philosophy" },
  { key: "selfhelp", label: "Self‑Help" },
  { key: "art", label: "Art" },
  { key: "business", label: "Business" },
  { key: "romance", label: "Romance" },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `http://${location.hostname}:${process.env.NEXT_PUBLIC_API_PORT || 5000}`
    : "http://localhost:5000");

type UserMetadata = {
  interestsCompleted?: boolean;
  [key: string]: unknown;
};

export default function InterestsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isSignedIn, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const minRequired = 5;

  const progress = useMemo(
    () => Math.round((selected.length / minRequired) * 100),
    [selected.length]
  );

  useEffect(() => {
    setMounted(true);
    
    // Wait for auth to load
    if (!authLoaded || !userLoaded) return;

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/interests");
      return;
    }

    // Check if user has already completed interests
    if (user) {
      const metadata = user.unsafeMetadata as UserMetadata;
      
      if (metadata?.interestsCompleted) {
        // User already completed interests, redirect to dashboard/home
        router.push("/dashboard");
        return;
      }
    }
  }, [authLoaded, userLoaded, isSignedIn, user, router]);

  function toggle(k: string) {
    setSelected((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  async function handleContinue() {
    if (!isSignedIn || !user || selected.length < minRequired) return;
    setSaving(true);

    try {
      // Optional: persist to Flask DB keyed by Clerk id
      try {
        const tok = await getToken();
        await fetch(`${API_BASE}/api/profile/interests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
          },
          body: JSON.stringify({ interests: selected, clerk_user_id: user.id }),
        });
      } catch (err) {
        console.log("API call failed:", err);
      }

      // One-time completion flag so the gate hides forever
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata as UserMetadata),
          interestsCompleted: true,
        },
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving interests:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    if (!user || saving) return;
    
    setSaving(true);
    try {
      // Mark as completed even when skipped
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata as UserMetadata),
          interestsCompleted: true,
        },
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error skipping interests:", err);
    } finally {
      setSaving(false);
    }
  }

  // Loading state
  if (!authLoaded || !userLoaded || !mounted) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  // Not signed in (will redirect)
  if (!isSignedIn) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Redirecting to sign in...</div>
      </div>
    );
  }

  // Main interests page
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>📚</span>
          </div>
          <h1 className={styles.title}>
            Welcome to{" "}
            <span className={styles.titleGradient}>Libby-Bot</span>
          </h1>
          <p className={styles.subtitle}>
            Pick {minRequired} or more genres to get personalized book
            recommendations
          </p>
        </div>

        {/* Progress */}
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressCounter}>
              {selected.length} / {minRequired}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div 
              className={styles.progressFill}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Genre Grid */}
        <div className={styles.genreGrid}>
          {GENRES.map((genre) => {
            const active = selected.includes(genre.key);
            return (
              <button
                key={genre.key}
                onClick={() => toggle(genre.key)}
                className={`${styles.genreButton} ${active ? styles.active : ''}`}
              >
                {genre.label}
                {active && <span className={styles.checkmark}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={saving || selected.length < minRequired}
          className={`${styles.continueButton} ${
            selected.length >= minRequired 
              ? styles.enabled 
              : styles.disabled
          } ${saving ? styles.saving : ''}`}
        >
          {saving
            ? "Setting up your library..."
            : selected.length >= minRequired
            ? "Continue →"
            : `Select ${minRequired - selected.length} more genres`}
        </button>

        {/* Skip option */}
        <div className={styles.skipContainer}>
          <button
            onClick={handleSkip}
            disabled={saving}
            className={styles.skipButton}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}