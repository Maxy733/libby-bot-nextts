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
import { ChevronDownIcon } from '@heroicons/react/20/solid'

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

        {/* Dropdown Menu Example */}
        <Menu as="div" className="relative inline-block md:hidden">
          <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
            Options
            <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
          >
            <div className="py-1">
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                >
                  Account settings
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                >
                  Support
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                >
                  License
                </a>
              </MenuItem>
              <form action="#" method="POST">
                <MenuItem>
                  <button
                    type="submit"
                    className="block w-full px-4 py-2 text-left text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </form>
            </div>
          </MenuItems>
        </Menu>

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
        </div>
      </div>
    </header>
  );
}
