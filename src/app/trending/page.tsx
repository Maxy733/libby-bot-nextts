// src/app/trending/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Type Definitions ---
interface Book {
  id: number;
  title: string;
  author: string;
}

// --- Reusable Components ---
const BookCard = ({ book, delay }: { book: Book, delay: number }) => (
    <div className="book-card" style={{ transitionDelay: `${delay * 50}ms` }}>
        <img 
            src={`https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`} 
            alt={book.title} 
            className="book-cover"
        />
        <p className="book-title">{book.title || 'No Title'}</p>
        <p className="book-author">{book.author || 'Unknown Author'}</p>
    </div>
);

// --- Main Trending Page Component ---
export default function TrendingPage() {
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);

    useEffect(() => {
        // Fetch trending books when the component loads
        fetch('http://127.0.0.1:5000/api/recommendations/globally-trending')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch trending books');
                }
                return res.json();
            })
            .then(data => {
                // In a real app with pagination, you'd fetch more than 10.
                // For this mockup, we'll just use the top 10.
                setTrendingBooks(data);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="container header-content">
                    <Link href="/" className="logo">
                         <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z" fill="#2F2F2F"/>
                            <path d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z" fill="#A18A68"/>
                            <path d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z" fill="#A18A68"/>
                            <rect x="45" y="45" width="10" height="20" fill="#F8F7F5"/>
                        </svg>
                        <span>LIBBY BOT</span>
                    </Link>
                    <nav className="main-nav">
                        <Link href="/discover">Discover</Link>
                        <Link href="/about">About Us</Link>
                        <Link href="/trending" className="text-brand-charcoal">Trending</Link>
                    </nav>
                    <div className="header-actions">
                        <Link href="/login" className="login-btn">Log In</Link>
                        <Link href="/signup" className="signup-btn">Sign Up</Link>
                    </div>
                </div>
            </header>

            <main className="container page-content">
                <div className="space-y-12">
                    <div>
                        <h1 className="page-title">Trending Books</h1>
                        <p className="page-subtitle">See what's popular in the library right now, based on recent checkouts and ratings.</p>
                    </div>

                    <section>
                        <div className="results-grid">
                            {trendingBooks.length > 0 ? (
                                trendingBooks.map((book, index) => <BookCard key={book.id} book={book} delay={index} />)
                            ) : (
                                <p className="loading-text col-span-full">Loading trending books...</p>
                            )}
                        </div>
                    </section>
                    
                    {/* Pagination Placeholder */}
                    <div className="pagination">
                        <a href="#" className="pagination-arrow">&laquo;</a>
                        <a href="#" className="pagination-number active">1</a>
                        <a href="#" className="pagination-number">2</a>
                        <a href="#" className="pagination-number">3</a>
                        <a href="#" className="pagination-arrow">&raquo;</a>
                    </div>
                </div>
            </main>
        </div>
    );
}
