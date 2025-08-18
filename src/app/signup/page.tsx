// src/app/signup/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ApiError = { error?: string };

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000" // local dev
    : process.env.NEXT_PUBLIC_API!; // must exist on Vercel

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API is not set — add it in Vercel project settings and redeploy.");
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  function splitName(fullname: string) {
    const trimmed = fullname.trim().replace(/\s+/g, " ");
    if (!trimmed) return { first_name: "", last_name: "" };
    const parts = trimmed.split(" ");
    const first_name = parts[0];
    const last_name = parts.length > 1 ? parts.slice(1).join(" ") : "";
    return { first_name, last_name };
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // basic validations
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { first_name, last_name } = splitName(form.fullname);

    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          first_name,
          last_name,
          phone: form.phone.trim() || null,
        }),
      });

      if (!res.ok) {
        const body: ApiError = await res.json().catch(() => ({}));
        if (res.status === 409) setError(body.error || "Email already in use.");
        else if (res.status === 400) setError(body.error || "Invalid input.");
        else setError(body.error || "Sign up failed. Please try again.");
        setStatus("idle");
        return;
      }

      const data = await res.json();
      // Save token (your app can later move to httpOnly cookies if desired)
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      // Optionally store a bit of user info
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to a logged-in page
      router.replace("/recommendations"); // change to '/' or '/discover' if you prefer
    } catch (err) {
      console.error("Signup error:", err); // ✅ now 'err' is used
      setError("Network error. Please check your connection.");
      setStatus("idle");
    }
  }

  return (
    <div className="auth-page">
      {/* Left: image */}
      <div
        className="auth-image-panel"
        style={{ backgroundImage: "url('/stack-of-library-books.webp')" }}
      />

      {/* Right: form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <Link href="/" className="logo auth-logo">LIBBY BOT</Link>

          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Join our community to get personalized recommendations.</p>

          <form onSubmit={handleSignUp} className="auth-form">
            <div>
              <label htmlFor="fullname">Full Name</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                autoComplete="name"
                required
                placeholder="John Wick"
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0812345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            {error && (
              <p className="auth-footer-link" style={{ color: "#ef4444", marginTop: "-0.5rem" }}>
                {error}
              </p>
            )}

            <div>
              <button type="submit" className="auth-button" disabled={status === "loading"}>
                {status === "loading" ? "Creating Account…" : "Create Account"}
              </button>
            </div>
          </form>

          <p className="auth-footer-link">
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}