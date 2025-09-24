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
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'



function RecommendationsLink() {
  const { isSignedIn } = useUser();
  return (
    <Link href={isSignedIn ? "/recommendations" : "/#join-us"}>
      Recommendations
    </Link>
  );
}
export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        {/* Logo */}
        <SignedOut>
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
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="logo" prefetch>
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

        {/* Navigation */}
        <nav className="main-nav hidden md:flex">
          <Link href="/discover">Discover</Link>
          <Link href="/trending">Trending</Link>
          <RecommendationsLink />
          <Link href="/about">About Us</Link>
        </nav>


        {/* Auth Buttons */}
        <div className="header-actions flex gap-4 items-center">
        
        {/* Dropdown Menu Example */}
        <Menu as="div" className="relative inline-block md-hidden ">
        <MenuButton className="menu-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="menu-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </MenuButton>

          <MenuItems
            className="dropdown-menu transition transform origin-top-right duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <Link href="/discover" className="dropdown-item">Discover</Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <Link href="/trending" className="dropdown-item">Trending</Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => {
                  const { isSignedIn } = useUser();
                  return (
                    <Link
                      href={isSignedIn ? "/recommendations" : "/#join-us"}
                      className="dropdown-item"
                    >
                      Recommendation
                    </Link>
                  );
                }}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <Link href="/about" className="dropdown-item">About Us</Link>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>

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
            <div className="signed-in-actions">
              <Link href="/profile" className="profile-link">
                Profile
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
