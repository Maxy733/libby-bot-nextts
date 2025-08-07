// src/app/login/page.tsx
"use client"; // This is a client component because it involves user interaction.

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter

// The main component for the login page
export default function LoginPage() {
  const router = useRouter(); // Initialize router

  // Update handleLogin to redirect after "login"
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would handle authentication logic.
    // On success, redirect to BookInterestSelector page:
    router.push("/User_Interest");
  };

  return (
    <div className="auth-page">
      {/* Left Side: Decorative Image */}
      <div
        className="auth-image-panel"
        style={{ backgroundImage: "url('/stack-of-library-books.webp')" }}
      >
        {/* This div is for the background image, styled in globals.css */}
      </div>

      {/* Right Side: Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* Use the Link component for the logo to navigate back to the home page */}
          <Link href="/" className="logo auth-logo">
            LIBBY BOT
          </Link>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Log in to access your personalized recommendations and lists.
          </p>

          <form onSubmit={handleLogin} className="auth-form">
            <div>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="form-label-group">
                <label htmlFor="password">Password</label>
                <Link href="#" className="form-link">
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <button type="submit" className="auth-button">
                Log In
              </button>
            </div>
          </form>

          <p className="auth-footer-link">
            Don't have an account?
            {/* Use the Link component for navigation to the sign-up page */}
            <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
