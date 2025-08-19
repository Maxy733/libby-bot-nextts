'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Check login state on mount and when storage changes (e.g., after login in another tab)
  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem('token'));
    check();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') check();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // optional if you store user
    setIsLoggedIn(false);
    setMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/" className="logo">
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

        <nav className="main-nav">
          <Link href="/discover">Discover</Link>
          <Link href="/about">About Us</Link>
          <Link href="/trending">Trending</Link>
        </nav>

        <div className="header-actions" style={{ position: 'relative' }}>
          {isLoggedIn ? (
            <>
              {/* Profile trigger */}
              <button
                ref={btnRef}
                type="button"
                className="profile-trigger"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                title="Open profile menu"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.5rem',
                  padding: '.25rem .5rem',
                  background: 'transparent',
                  border: '1px solid var(--brand-light-grey)',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  color: 'var(--brand-charcoal)',
                }}
              >
                {/* Simple avatar icon (fallback circle) */}
                <span
                  aria-hidden
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '9999px',
                    background: 'var(--brand-charcoal)',
                    display: 'inline-block',
                  }}
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.143l3.71-3.91a.75.75 0 0 1 1.08 1.04l-4.24 4.47a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen ? (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="Profile menu"
                  className="profile-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: '200px',
                    background: 'var(--brand-surface)',
                    border: '1px solid var(--brand-light-grey)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,.25)',
                    padding: '.25rem',
                    zIndex: 50,
                  }}
                >
                  <Link
                    href="/favorites"
                    role="menuitem"
                    className="footer-link"
                    style={{
                      display: 'block',
                      padding: '.6rem .75rem',
                      borderRadius: '.375rem',
                      textDecoration: 'none',
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    ★ Favorites
                  </Link>
                  <Link
                    href="/settings"
                    role="menuitem"
                    className="footer-link"
                    style={{
                      display: 'block',
                      padding: '.6rem .75rem',
                      borderRadius: '.375rem',
                      textDecoration: 'none',
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <button
                    role="menuitem"
                    className="logout-btn"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--brand-charcoal)',
                      padding: '.6rem .75rem',
                      borderRadius: '.375rem',
                      cursor: 'pointer',
                    }}
                    onClick={handleLogout}
                  >
                    ⎋ Logout
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/login" className="login-btn">Log In</Link>
              <Link href="/signup" className="signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}