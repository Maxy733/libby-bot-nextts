"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import styles from "./preferences.module.css";

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

export default function PreferencesPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();

  const [selected, setSelected] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [authors, setAuthors] = useState<string>("");
  const [goals, setGoals] = useState<string[]>([]);
  const [bookLength, setBookLength] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const minRequired = 5;

  const progress = useMemo(
    () => Math.round((selected.length / minRequired) * 100),
    [selected.length]
  );

  useEffect(() => {
    if (!isSignedIn || !userLoaded || !user) return;

    // Get saved genres from metadata (if available)
    const savedGenres = user.unsafeMetadata?.genres;
    if (Array.isArray(savedGenres)) {
      setSelected(savedGenres);
    }

    // Load additional preferences
    const md = user.unsafeMetadata || {};
    if (md.frequency) setFrequency(md.frequency as string);
    if (md.language) setLanguage(md.language as string);
    if (md.authors) setAuthors(md.authors as string);
    if (Array.isArray(md.goals)) setGoals(md.goals as string[]);
    if (md.bookLength) setBookLength(md.bookLength as string);

    setLoading(false);
  }, [userLoaded, isSignedIn, user]);

  const toggle = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSave = async () => {
    if (!user || !isSignedIn) return;

    setSaving(true);
    try {
      const token = await getToken();

      // Update backend (optional)
      await fetch(`${API_BASE}/api/profile/interests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clerk_user_id: user.id,
          interests: selected,
          frequency,
          language,
          authors,
          goals,
          bookLength,
        }),
      });

      // Update Clerk metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          interestsCompleted: true,
          genres: selected,
          frequency,
          language,
          authors,
          goals,
          bookLength,
        },
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading preferences...</div>
      </div>
    );
  }

  // Options for new preferences
  const FREQUENCY_OPTIONS = [
    { value: "", label: "Select frequency" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "rarely", label: "Rarely" },
  ];
  const LANGUAGE_OPTIONS = [
    { value: "", label: "Select language" },
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "other", label: "Other" },
  ];
  const GOALS_OPTIONS = [
    { value: "learn", label: "Learn new things" },
    { value: "relax", label: "Relaxation" },
    { value: "career", label: "Career growth" },
    { value: "entertainment", label: "Entertainment" },
    { value: "social", label: "Social connection" },
  ];
  const BOOK_LENGTH_OPTIONS = [
    { value: "short", label: "Short (<200 pages)" },
    { value: "medium", label: "Medium (200-400 pages)" },
    { value: "long", label: "Long (>400 pages)" },
    { value: "any", label: "Any length" },
  ];

  return (
    <div className={styles.preferencesLayout}>
      <div className={styles.sidebar}>
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem}>Reading Frequency</li>
          <li className={styles.sidebarItem}>Preferred Language</li>
          <li className={styles.sidebarItem}>Favorite Authors</li>
          <li className={styles.sidebarItem}>Reading Goals</li>
          <li className={styles.sidebarItem}>Preferred Book Length</li>
          <li className={styles.sidebarItem}>
            <a href="/interests" className={styles.sidebarLink}>Edit Genres</a>
          </li>
        </ul>
      </div>
      <div className={styles.formPanel}>
        <div className={styles.card}>
          {/* Additional Preferences */}
          <div className={styles.additionalPreferences}>
            {/* Reading Frequency */}
            <div className={styles.formGroup}>
              <label htmlFor="frequency" className={styles.formLabel}>
                Reading Frequency
              </label>
              <select
                id="frequency"
                className={styles.formSelect}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Preferred Language */}
            <div className={styles.formGroup}>
              <label htmlFor="language" className={styles.formLabel}>
                Preferred Language
              </label>
              <select
                id="language"
                className={styles.formSelect}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Favorite Authors */}
            <div className={styles.formGroup}>
              <label htmlFor="authors" className={styles.formLabel}>
                Favorite Authors
              </label>
              <textarea
                id="authors"
                className={styles.formTextarea}
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                rows={2}
                placeholder="List your favorite authors"
              />
            </div>
            {/* Reading Goals */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Reading Goals</label>
              <div className={styles.checkboxGroup}>
                {GOALS_OPTIONS.map((goal) => (
                  <label key={goal.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={goals.includes(goal.value)}
                      onChange={() => toggleGoal(goal.value)}
                    />
                    {goal.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Preferred Book Length */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Preferred Book Length</label>
              <div className={styles.radioGroup}>
                {BOOK_LENGTH_OPTIONS.map((opt) => (
                  <label key={opt.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="bookLength"
                      value={opt.value}
                      checked={bookLength === opt.value}
                      onChange={() => setBookLength(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`${styles.continueButton} ${saving ? styles.saving : ""}`}
          >
            {saving ? "Saving preferences..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}