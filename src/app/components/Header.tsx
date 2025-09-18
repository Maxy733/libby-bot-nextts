"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";


function RecommendationsLink() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  if (!isLoaded) return <span className="text-gray-500">Recommendations</span>;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isSignedIn) {
      e.preventDefault();
      if (pathname === "/") {
        const section = document.getElementById("personalized");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/#personalized");
      }
    }
  };

  return (
    <a
      href={isSignedIn ? "/recommendations" : "/#personalized"}
      onClick={handleClick}
      className={`hover:opacity-80 transition-opacity ${!isSignedIn ? "text-gray-600" : ""}`}
    >
      {isSignedIn ? "My Recommendations" : "Recommendations"}
    </a>
  );
}

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        {/* Logo - Smart routing based on auth status */}
        <Link 
          href="/" 
          className="logo" 
          prefetch
        >
          <SignedIn>
            <Link href="/dashboard" className="logo" prefetch>
              <svg
                width="32"
                height="32"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z"
                  fill="#c2a560"
                />
                <path
                  d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z"
                  fill="#ffffffff"
                />
                <path
                  d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z"
                  fill="#ffffffff"
                />
                <rect x="45" y="45" width="10" height="20" fill="#c2a560" />
              </svg>
              <span>LIBBY BOT</span>
            </Link>
          </SignedIn>
          
          <SignedOut>
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z"
                fill="#c2a560"
              />
              <path
                d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z"
                fill="#ffffffff"
              />
              <path
                d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z"
                fill="#ffffffff"
              />
              <rect x="45" y="45" width="10" height="20" fill="#c2a560" />
            </svg>
            <span>LIBBY BOT</span>
          </SignedOut>
        </Link>

        {/* Navigation */}
        <nav className="main-nav">
          <Link href="/discover" className="hover:opacity-80 transition-opacity">
            Discover
          </Link>
          <Link href="/trending" className="hover:opacity-80 transition-opacity">
            Trending
          </Link>
          <RecommendationsLink />
          <Link href="/about" className="hover:opacity-80 transition-opacity">
            About Us
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="header-actions flex gap-4 items-center">
          <SignedOut>
            <div className="flex gap-4">
              <SignInButton>
                <button className="login-btn">Log In</button>
              </SignInButton>
              <SignUpButton>
                <button className="signup-btn">Sign Up</button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="signed-in-actions flex gap-4 items-center">
              <Link 
                href="/wishlist" 
                className="profile-link hover:opacity-80 transition-opacity"
                title="View your wishlist"
              >
                Wishlist
              </Link>
              <Link 
                href="/profile" 
                className="profile-link hover:opacity-80 transition-opacity"
              >
                Profile
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}