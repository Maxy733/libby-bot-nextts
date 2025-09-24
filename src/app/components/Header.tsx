"use client";

import Link from "next/link";
import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function RecommendationsLink() {
  const { isSignedIn } = useUser();
  return (
    <Link href={isSignedIn ? "/recommendations" : "/#join-us"}>
      Recommendations
    </Link>
  );
}
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

        {/* Hamburger button for mobile */}
        <button
          className="mobile-menu-btn md:hidden flex flex-col justify-center items-center w-10 h-10"
          aria-label="Toggle navigation menu"
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>

        {/* Navigation - hidden on mobile, shown on md+ */}
        <nav className="main-nav hidden md:flex">
          <Link href="/discover">Discover</Link>
          <Link href="/trending">Trending</Link>
          <RecommendationsLink />
          <Link href="/about">About Us</Link>
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
            <div className="signed-in-actions">
              <Link href="/profile" className="profile-link">
                Profile
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {/* Mobile dropdown menu */}
          <div className="md:hidden">
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="inline-flex justify-center items-center w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                Menu
                <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5 text-black" aria-hidden="true" />
              </MenuButton>
              <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-1 py-1 ">
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/discover"
                        className={`${
                          active ? 'bg-gray-100 text-black' : 'text-black'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Discover
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/trending"
                        className={`${
                          active ? 'bg-gray-100 text-black' : 'text-black'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Trending
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <span
                        className={`${
                          active ? 'bg-gray-100 text-black cursor-pointer' : 'text-black cursor-pointer'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        <RecommendationsLink />
                      </span>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/about"
                        className={`${
                          active ? 'bg-gray-100 text-black' : 'text-black'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        About Us
                      </Link>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}
