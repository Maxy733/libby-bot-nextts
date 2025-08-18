// src/app/login/page.tsx
'use client'; // This is a client component because it involves user interaction.

import React, { useState } from 'react';
import Link from 'next/link'; // Use the Next.js Link component for navigation
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// The main component for the login page
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      
      {/* Left Side: Decorative Image */}
      <div className="auth-image-panel" style={{ backgroundImage: "url('/Musuem-2_1195x794.webp')" }}>
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
          <p className="auth-subtitle">Log in to access your personalized recommendations and lists.</p>

          <form onSubmit={handleLogin} className="auth-form">
            <div>
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <div className="form-label-group">
                <label htmlFor="password">Password</label>
                <Link href="#" className="form-link">Forgot your password?</Link>
              </div>
              <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div>
              <button type="submit" className="auth-button">
                Log In
              </button>
            </div>
          </form>

          {/* FIXED: Replaced ' with &apos; */}
          <p className="auth-footer-link">
            Don&apos;t have an account?
            <Link href="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
