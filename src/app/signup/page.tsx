// src/app/signup/page.tsx
'use client'; // This is a client component because it involves user interaction.

import React from 'react';
import Link from 'next/link'; // Use the Next.js Link component for navigation

// The main component for the sign-up page
export default function SignUpPage() {
  
  // A placeholder function for handling form submission.
  const handleSignUp = (event: React.FormEvent) => {
    event.preventDefault(); // Prevents the default form submission behavior
    alert('Sign up functionality would be handled here!');
  };

  return (
    <div className="auth-page">
      
      {/* Left Side: Decorative Image */}
      <div className="auth-image-panel" style={{ backgroundImage: "url('/stack-of-library-books.webp')" }}>
        {/* This div is for the background image, styled in globals.css */}
      </div>

      {/* Right Side: Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <Link href="/" className="logo auth-logo">
            LIBBY BOT
          </Link>
          
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Join our community to get personalized recommendations.</p>

          <form onSubmit={handleSignUp} className="auth-form">
            <div>
              <label htmlFor="fullname">Full Name</label>
              <input id="fullname" name="fullname" type="text" autoComplete="name" required placeholder="John Wick" />
            </div>

            <div>
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="••••••••" />
            </div>

            <div>
              <label htmlFor="confirm-password">Confirm Password</label>
              <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required placeholder="••••••••" />
            </div>

            <div>
              <button type="submit" className="auth-button">
                Create Account
              </button>
            </div>
          </form>

          <p className="auth-footer-link">
            Already have an account?
            <Link href="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
