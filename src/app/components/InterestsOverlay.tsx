"use client";

import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth, useUser } from "@clerk/nextjs";

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

export default function InterestsOverlay() {
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const minRequired = 5;

  const progress = useMemo(
    () => Math.round((selected.length / minRequired) * 100),
    [selected.length]
  );

  // Simple mounting effect
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);

    // Lock background scroll
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

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
          ...(user.unsafeMetadata as any),
          interestsCompleted: true,
        },
      });
    } catch (err) {
      console.error("Error saving interests:", err);
    } finally {
      setSaving(false);
    }
  }

  // Don't render portal until we're mounted client-side
  if (!mounted || typeof window === "undefined") {
    return null;
  }

  // Render the full-screen overlay
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.5s ease-out",
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Main content card */}
      <div
        style={{
          width: "90%",
          maxWidth: "900px",
          textAlign: "center",
          color: "white",
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "transform 0.6s ease-out",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "2rem",
          padding: "3rem 2rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              margin: "0 auto 1.5rem auto",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <span style={{ fontSize: "2rem" }}>📚</span>
          </div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              margin: "0 0 1rem 0",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            Welcome to{" "}
            <span
              style={{
                background: "linear-gradient(45deg, #60a5fa, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Libby
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              opacity: 0.9,
              margin: 0,
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Pick {minRequired} or more genres to get personalized book
            recommendations
          </p>
        </div>

        {/* Progress */}
        <div
          style={{
            marginBottom: "2rem",
            maxWidth: "350px",
            margin: "0 auto 2rem auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: "500",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
              }}
            >
              Progress
            </span>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: "500",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
              }}
            >
              {selected.length} / {minRequired}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "2px",
              overflow: "hidden",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                width: `${Math.min(progress, 100)}%`,
                transition: "width 0.3s ease-out",
                boxShadow: "0 0 8px rgba(96, 165, 250, 0.4)",
              }}
            />
          </div>
        </div>

        {/* Genre Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          {GENRES.map((genre) => {
            const active = selected.includes(genre.key);
            return (
              <button
                key={genre.key}
                onClick={() => toggle(genre.key)}
                style={{
                  padding: "1.2rem 0.8rem",
                  border: active
                    ? "2px solid rgba(96, 165, 250, 0.8)"
                    : "2px solid rgba(255,255,255,0.25)",
                  borderRadius: "0.8rem",
                  backgroundColor: active
                    ? "rgba(96, 165, 250, 0.2)"
                    : "rgba(255,255,255,0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: active ? "bold" : "normal",
                  transition: "all 0.2s ease-out",
                  backdropFilter: "blur(10px)",
                  boxShadow: active
                    ? "0 4px 12px rgba(96, 165, 250, 0.3)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
                }}
                onMouseOver={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.15)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  }
                }}
              >
                {genre.label}
                {active && <span style={{ marginLeft: "0.5rem" }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={saving || selected.length < minRequired}
          style={{
            padding: "1rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: "bold",
            border: "none",
            borderRadius: "1.5rem",
            cursor: selected.length >= minRequired ? "pointer" : "not-allowed",
            background:
              selected.length >= minRequired
                ? "linear-gradient(45deg, #60a5fa, #a78bfa)"
                : "rgba(255,255,255,0.15)",
            color: "white",
            transition: "all 0.3s ease-out",
            opacity: saving ? 0.7 : 1,
            boxShadow:
              selected.length >= minRequired
                ? "0 4px 16px rgba(96, 165, 250, 0.4)"
                : "0 2px 8px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)",
            transform:
              selected.length >= minRequired ? "scale(1)" : "scale(0.98)",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
          }}
          onMouseOver={(e) => {
            if (selected.length >= minRequired && !saving) {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(96, 165, 250, 0.5)";
            }
          }}
          onMouseOut={(e) => {
            if (selected.length >= minRequired && !saving) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(96, 165, 250, 0.4)";
            }
          }}
        >
          {saving
            ? "Setting up your library..."
            : selected.length >= minRequired
            ? "Continue →"
            : `Select ${minRequired - selected.length} more genres`}
        </button>

        {/* Skip option */}
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => {
              if (!saving && user) {
                handleContinue();
              }
            }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.9rem",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
