"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import styles from "./Interests.module.css";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}
interface InterestItem {
  id: string;
  icon: string;
  title: string;
}
interface Particle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const totalPages = 3;
const minInterests = 3;

declare global {
  interface Window {
    google?: any;
  }
}

export default function BookInterestSelector() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set()
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const interests: Record<number, InterestItem[]> = {
    1: [
      { id: "fantasy", icon: "🧙", title: "Fantasy" },
      { id: "mystery", icon: "🕵️", title: "Mystery" },
      { id: "romance", icon: "💕", title: "Romance" },
      { id: "thriller", icon: "⚡", title: "Thriller" },
      { id: "literary", icon: "📚", title: "Literary Fiction" },
      { id: "historical", icon: "⏳", title: "Historical" },
    ],
    2: [
      { id: "science", icon: "🔬", title: "Science" },
      { id: "biography", icon: "👤", title: "Biography" },
      { id: "business", icon: "💼", title: "Business" },
      { id: "selfhelp", icon: "🌟", title: "Self-Help" },
      { id: "history", icon: "🏛️", title: "History" },
      { id: "philosophy", icon: "🤔", title: "Philosophy" },
    ],
    3: [
      { id: "cooking", icon: "👨‍🍳", title: "Cooking" },
      { id: "travel", icon: "✈️", title: "Travel" },
      { id: "art", icon: "🎨", title: "Art & Design" },
      { id: "technology", icon: "💻", title: "Technology" },
      { id: "health", icon: "🏥", title: "Health & Fitness" },
      { id: "spirituality", icon: "🙏", title: "Spirituality" },
    ],
  };

  // confetti-ish background
  useEffect(() => {
    const arr: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 3 + 5,
    }));
    setParticles(arr);
  }, []);

  // restore session
  useEffect(() => {
    checkUserSession();
  }, []);

  // ---------- Google Identity Services ----------
  useEffect(() => {
    const init = () => {
      const ga = window.google?.accounts?.id;
      if (!ga) return;

      if (!GOOGLE_CLIENT_ID) {
        console.error(
          "GIS: client_id missing. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local"
        );
        setError(
          "Google client ID is not set. Check your .env.local and restart the dev server."
        );
        return;
      }

      // helpful logs
      console.log("GIS init origin =", window.location.origin);
      console.log("GIS init href =", window.location.href);
      console.log("GIS init client_id =", GOOGLE_CLIENT_ID);

      try {
        ga.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true, // avoid FedCM AbortError on some browsers
          itp_support: true, // Safari "Prevent cross‑site tracking"
        });

        // Pre-render the fallback button (hidden until needed)
        const mount = document.getElementById("gsi-button");
        if (mount) {
          ga.renderButton(mount, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
          });
          // keep it hidden until we decide to show it
          mount.style.display = "none";
        }
      } catch {
        setError("Failed to initialize Google Sign-In.");
      }
    };

    if (!window.google) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    } else {
      init();
    }
  }, []);

  const showFallbackButton = () => {
    const mount = document.getElementById("gsi-button");
    if (mount) mount.style.display = "inline-block";
  };

  const checkUserSession = () => {
    const userData = localStorage.getItem("bookAppUser");
    if (!userData) return;
    try {
      const u: User = JSON.parse(userData);
      setCurrentUser(u);
      loadUserPreferences(u);
    } catch {
      localStorage.removeItem("bookAppUser");
    }
  };

  const handleCredentialResponse = (res: any) => {
    try {
      const payload = JSON.parse(atob(res.credential.split(".")[1]));
      const user: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      localStorage.setItem("bookAppUser", JSON.stringify(user));
      setCurrentUser(user);
      setShowLoginModal(false);
      setError(null);
      loadUserPreferences(user);
    } catch {
      setError("Failed to process login response. Please try again.");
    }
  };

  const loadUserPreferences = async (user: User) => {
    try {
      const stored = localStorage.getItem(`userPreferences_${user.id}`);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (Array.isArray(prefs.interests))
          setSelectedInterests(new Set(prefs.interests));
      }
      const res = await fetch(
        `http://localhost:5001/api/get-preferences/${user.id}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.interests))
          setSelectedInterests(new Set(data.interests));
      }
    } catch {
      /* ignore */
    }
  };

  const saveUserPreferences = async () => {
    if (!currentUser) {
      setError("No user logged in");
      return false;
    }
    const prefs = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      interests: Array.from(selectedInterests),
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(
        `userPreferences_${currentUser.id}`,
        JSON.stringify(prefs)
      );
      const res = await fetch(
        "http://localhost:5001/api/save-user-and-interests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        }
      );
      if (!res.ok) console.log("API save failed (local ok)");
      return true;
    } catch {
      setError("Failed to save preferences. Please try again.");
      return false;
    }
  };

  const toggle = (id: string) => {
    const s = new Set(selectedInterests);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedInterests(s);
  };

  const next = async () => {
    if (currentPage === totalPages && selectedInterests.size >= minInterests) {
      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }
      setLoading(true);
      const ok = await saveUserPreferences();
      setLoading(false);
      if (ok) {
        setShowSuccess(true);
        setTimeout(() => router.push("/discover"), 2200);
      }
    } else if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const prev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const isNextDisabled = () =>
    currentPage === totalPages && selectedInterests.size < minInterests;

  const openGoogle = () => {
    setError(null);
    const ga = window.google?.accounts?.id;
    if (!ga) {
      setError("Google Sign-In not loaded. Please refresh.");
      return;
    }

    try {
      ga.prompt((notification: any) => {
        // If One Tap is blocked or skipped, show the fallback button
        if (notification.isDisplayed && notification.isDisplayed()) {
          console.log("One Tap displayed");
        } else if (
          notification.isSkippedMoment &&
          notification.isSkippedMoment()
        ) {
          console.warn("One Tap skipped:", notification.getSkippedReason?.());
          showFallbackButton();
        } else if (
          notification.isNotDisplayed &&
          notification.isNotDisplayed()
        ) {
          console.warn(
            "One Tap not displayed:",
            notification.getNotDisplayedReason?.()
          );
          showFallbackButton();
        } else {
          // Unknown state; show fallback
          showFallbackButton();
        }
      });
    } catch {
      showFallbackButton();
    }
  };

  const signOut = () => {
    window.google?.accounts?.id?.disableAutoSelect?.();
    localStorage.removeItem("bookAppUser");
    setCurrentUser(null);
    setSelectedInterests(new Set());
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className="bg-white/10 text-white rounded-2xl px-10 py-12 backdrop-blur-2xl border border-white/20">
          <Loader2 className="w-16 h-16 mx-auto mb-5 animate-spin" />
          <p className="text-xl font-semibold">Saving your preferences…</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className={styles.wrapper}>
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <div className="text-2xl font-bold">Welcome to Libby Bot!</div>
          <div className="opacity-90 mt-2">
            Personalized recommendations are ready…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* particles */}
      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.dot}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              ["--dur" as any]: `${p.duration}s`,
              ["--delay" as any]: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* PANEL */}
      <section className={styles.panel} aria-label="Choose your interests">
        <h1 className={styles.h1}>Choose Your Interests</h1>
        <p className={styles.sub}>Get personalized book recommendations</p>

        {/* user block */}
        {currentUser && (
          <div className="mt-4 mb-3 text-center text-white/90">
            {currentUser.picture ? (
              <img
                src={currentUser.picture}
                alt="avatar"
                className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/30"
              />
            ) : null}
            <div className="font-semibold">{currentUser.name}</div>
            <div className="text-white/70 text-sm">{currentUser.email}</div>
            <button
              onClick={signOut}
              className="mt-2 px-3 py-1.5 text-xs rounded-md border border-white/25 text-white/90 hover:bg-white/15"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* progress */}
        <div className={styles.progress}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
        <div className={styles.counter}>
          <span className="text-amber-300 font-semibold">
            {selectedInterests.size}
          </span>
          <span> of {minInterests}+ interests selected</span>
        </div>

        {/* pills */}
        <div className={styles.grid}>
          {interests[currentPage].map((it, i) => {
            const active = selectedInterests.has(it.id);
            return (
              <button
                key={it.id}
                onClick={() => toggle(it.id)}
                className={`${styles.pill} ${
                  active ? styles.pillSelected : ""
                }`}
                style={{ animation: `fade-up .45s ease ${i * 0.04}s both` }}
                aria-pressed={active}
              >
                <div className={styles.emoji}>{it.icon}</div>
                <div className="font-semibold text-sm">{it.title}</div>
                {active && <div className={styles.tick}>✓</div>}
              </button>
            );
          })}
        </div>

        {/* dots */}
        <div className="flex justify-center gap-2 mt-5">
          {[1, 2, 3].map((p) => (
            <span
              key={p}
              className={`w-2.5 h-2.5 rounded-full ${
                p === currentPage ? "bg-amber-300" : "bg-white/35"
              }`}
            />
          ))}
        </div>

        {/* buttons */}
        <div className={`${styles.buttons} mt-5`}>
          <button
            onClick={() => prev()}
            disabled={currentPage === 1}
            className="btn"
          >
            <ChevronLeft className="w-4 h-4 inline-block mr-1" /> Previous
          </button>
          <button
            onClick={() => next()}
            disabled={isNextDisabled()}
            className={`btn ${styles.cta}`}
          >
            {currentPage === totalPages
              ? isNextDisabled()
                ? "Select More"
                : "Get Recommendations"
              : "Next"}
            <ChevronRight className="w-4 h-4 inline-block ml-1" />
          </button>
        </div>

        {/* error */}
        {error && (
          <div className="mt-4 text-center text-sm text-rose-100/90 bg-rose-500/20 border border-rose-300/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
      </section>

      {/* modal */}
      {showLoginModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className="text-3xl mb-3">🔐</div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Sign In Required
            </h2>
            <p className="text-gray-600 mt-2 mb-4">
              Please sign in with your Google account to save your preferences
              and get personalized recommendations.
            </p>

            {error && (
              <div className="mb-3 rounded border border-rose-300 bg-rose-50 text-rose-700 text-sm px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              {/* One Tap trigger; if blocked we'll show the button below */}
              <button
                onClick={openGoogle}
                className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-shadow shadow"
              >
                {/* Google G icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              {/* Fallback button mount */}
              <div id="gsi-button" />
              <button
                onClick={() => setShowLoginModal(false)}
                className="py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
