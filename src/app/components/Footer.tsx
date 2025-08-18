// src/components/Footer.tsx
import React, { useState } from "react";
import Link from "next/link";

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

const FooterLink = ({ href, children, ariaLabel }: FooterLinkProps) => (
  <li>
    <Link
      href={href}
      aria-label={ariaLabel}
      className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
    >
      {children}
    </Link>
  </li>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      return;
    }
    try {
      setStatus("loading");
      // Optional: implement this API route to actually subscribe users
      // e.g., /app/api/newsletter/route.ts in Next.js 13+
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const genres = [
    { name: "Fiction", href: "/genres/fiction" },
    { name: "Mystery", href: "/genres/mystery" },
    { name: "Sci‑Fi", href: "/genres/science-fiction" },
    { name: "Romance", href: "/genres/romance" },
    { name: "Non‑Fiction", href: "/genres/non-fiction" },
    { name: "Fantasy", href: "/genres/fantasy" },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: 4 columns */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100">
              LIBBY BOT
            </h3>
            <ul className="mt-4 space-y-2">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/how-it-works">How It Works</FooterLink>
              <FooterLink href="/mission">Our Mission</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/press">Press</FooterLink>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100">
              Community
            </h3>
            <ul className="mt-4 space-y-2">
              <FooterLink href="/readers">For Readers</FooterLink>
              <FooterLink href="/authors">For Authors</FooterLink>
              <FooterLink href="/publishers">For Publishers</FooterLink>
              <FooterLink href="/partners">Partnerships</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
            </ul>
          </div>

          {/* Support / Legal */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
              <FooterLink href="/accessibility">Accessibility</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </ul>

            {/* Top Genres quick links */}
            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Top Genres
            </h4>
            <ul className="mt-3 flex flex-wrap gap-3">
              {genres.map((g) => (
                <li key={g.name}>
                  <Link
                    href={g.href}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Apps + Social */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100">
              Stay Connected
            </h3>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Get weekly book picks, reading lists, and feature releases.
            </p>

            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                aria-invalid={status === "error"}
              />
              <button
                type="submit"
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                disabled={status === "loading" || status === "success"}
                aria-live="polite"
              >
                {status === "loading" ? "Subscribing…" : status === "success" ? "Subscribed" : "Subscribe"}
              </button>
            </form>
            {status === "error" && (
              <p className="mt-2 text-xs text-red-600">Please enter a valid email.</p>
            )}
            {status === "success" && (
              <p className="mt-2 text-xs text-green-600">
                Thanks! Check your inbox to confirm.
              </p>
            )}

            {/* App buttons (placeholders) */}
            <div className="mt-6 flex gap-3">
              <Link
                href="/apps/ios"
                aria-label="Download on the App Store"
                className="flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                App Store
              </Link>
              <Link
                href="/apps/android"
                aria-label="Get it on Google Play"
                className="flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Google Play
              </Link>
            </div>

            {/* Social icons (text placeholders, swap for SVGs anytime) */}
            <div className="mt-6 flex items-center gap-4">
              <Link href="https://facebook.com" aria-label="Facebook" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                FB
              </Link>
              <Link href="https://twitter.com" aria-label="Twitter/X" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                X
              </Link>
              <Link href="https://instagram.com" aria-label="Instagram" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                IG
              </Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                LI
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 md:flex-row md:text-left">
          <p>
            &copy; 2025 <span className="font-medium text-gray-700 dark:text-gray-200">LIBBY BOT</span>. All rights reserved.
          </p>
          <p className="text-xs">
            “Reading is to the mind what exercise is to the body.”
          </p>
        </div>
      </div>
    </footer>
  );
}