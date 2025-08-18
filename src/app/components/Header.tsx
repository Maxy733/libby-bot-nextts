'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
            <header className="header">
                <div className="container header-content">
                    <Link href="/" className="logo">
                        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z" fill="#ffffffff"/>
                            <path d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z" fill="#A18A68"/>
                            <path d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z" fill="#A18A68"/>
                            <rect x="45" y="45" width="10" height="20" fill="#83652bff"/>
                        </svg>
                        <span>LIBBY BOT</span>
                    </Link>
                    <nav className="main-nav">
                        <Link href="/discover">Discover</Link>
                        <Link href="/about">About Us</Link>
                        <Link href="/trending">Trending</Link>
                    </nav>
                    <div className="header-actions">
                        <Link href="/login" className="login-btn">Log In</Link>
                        <Link href="/signup" className="signup-btn">Sign Up</Link>
                    </div>
                </div>
            </header>
        );
}