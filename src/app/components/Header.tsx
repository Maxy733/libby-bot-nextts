'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export default function Header() {
  // const { user } = useUser(); // Optional, in case you want to use user info

  return (
    <header className="header">
      <div className="container header-content">
        {/* Logo */}
        <Link href="/" className="logo" prefetch>
          <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z"
              fill="#7e5e26ff"
            />
            <path
              d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z"
              fill="#ffffffff"
            />
            <path
              d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z"
              fill="#ffffffff"
            />
            <rect x="45" y="45" width="10" height="20" fill="#000000ff" />
          </svg>
          <span>LIBBY BOT</span>
        </Link>

        {/* Navigation */}
        <nav className="main-nav">
          <Link href="/discover">Discover</Link>
          <Link href="/trending">Trending</Link>
          <Link href="/recommendations">Recommendations</Link>
          <Link href="/about">About Us</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="header-actions flex gap-4 items-center">
          <SignedOut>
            <div className="flex gap-4">
              <SignInButton>
                <button className="login-btn">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="signup-btn">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" /> {/* v7 is still beta, v6 works fine i guess */}
          </SignedIn>
        </div>
      </div>
    </header>
  );
}