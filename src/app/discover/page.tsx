// src/app/discover/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Type Definitions ---
interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
}

// --- Data for Genres ---
const genres = [
    { name: "Science", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Science" },
    { name: "Technology", imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Technology" },
    { name: "Politics", imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=Politics" },
    { name: "Art", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Art" },
    { name: "Fiction", imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Fiction" },
    { name: "History", imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=History" },
    { name: "Philosophy", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Philosophy" },
    { name: "Self-Help", imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Self-Help" },
    { name: "Biography", imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=Biography" },
    { name: "Literature", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Literature" },
];


// --- Reusable Components ---
const BookCard = ({ book }: { book: Book }) => (
    <Link href={`/book/${book.id}`} className="book-card">
        <img 
            src={book.coverurl || `https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`} 
            alt={book.title} 
            className="book-cover"
        />
        <p className="book-title">{book.title || 'No Title'}</p>
        <p className="book-author">{book.author || 'Unknown Author'}</p>
    </Link>
);

const GenreCard = ({ title, imageUrl }: { title: string, imageUrl: string }) => (
    <Link href={`/genre/${encodeURIComponent(title)}`} className="genre-card">
        <div className="genre-card-bg" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${imageUrl})` }}></div>
        <h3 className="genre-card-title">{title}</h3>
    </Link>
);


// --- Main Discover Page Component ---
export default function DiscoverPage() {
    const [trendingBooks, setTrendingBooks] useState<Book[]>([]);
    const trendingCarouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/recommendations/globally-trending`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.books)) {
                    setTrendingBooks(data.books);
                }
            })
            .catch(err => console.error("Failed to fetch trending books:", err));
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const elementsToAnimate = document.querySelectorAll('.animated-element, .book-card, .genre-card');
        elementsToAnimate.forEach(el => observer.observe(el));

        return () => elementsToAnimate.forEach(el => observer.unobserve(el));
    }, [trendingBooks]);
    
    const handleCarouselScroll = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
            const scrollAmount = 300;
            const currentScroll = ref.current.scrollLeft;
            
            if (direction === 'left') {
                ref.current.scrollTo({ left: currentScroll - scrollAmount, behavior: 'smooth' });
            } else {
                ref.current.scrollTo({ left: currentScroll + scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="container header-content">
                    <Link href="/" className="logo">
                         <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z" fill="#2F2F2F"/><path d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z" fill="#A18A68"/><path d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z" fill="#A18A68"/><rect x="45" y="45" width="10" height="20" fill="#F8F7F5"/></svg>
                        <span>LIBBY BOT</span>
                    </Link>
                    <nav className="main-nav">
                        <Link href="/discover" className="text-brand-charcoal">Discover</Link>
                        <Link href="/about">About Us</Link>
                        <Link href="/trending">Trending</Link>
                    </nav>
                    <div className="header-actions">
                        <Link href="/login" className="login-btn">Log In</Link>
                        <Link href="/signup" className="signup-btn">Sign Up</Link>
                    </div>
                </div>
            </header>

            <main className="container page-content">
                <div className="space-y-16">
                    <div>
                        <h1 className="page-title">Discover</h1>
                        <p className="page-subtitle">Browse genres, find trending books, and explore curated collections.</p>
                    </div>

                    <section id="trending">
                        <div className="section-header">
                            <h2 className="section-title">Trending This Week</h2>
                            <Link href="/trending" className="see-more-link">See More &rarr;</Link>
                        </div>
                        <div className="carousel-wrapper">
                            <div ref={trendingCarouselRef} className="carousel-container">
                                {trendingBooks.map((book) => <BookCard key={book.id} book={book} />)}
                            </div>
                            <button onClick={() => handleCarouselScroll('left', trendingCarouselRef)} className="carousel-button prev" aria-label="Scroll left">‹</button>
                            <button onClick={() => handleCarouselScroll('right', trendingCarouselRef)} className="carousel-button next" aria-label="Scroll right">›</button>
                        </div>
                    </section>

                    <section>
                        <h2 className="section-title">Browse by Genre</h2>
                        <div className="genre-grid">
                            {genres.map((genre) => (
                                <GenreCard 
                                    key={genre.name}
                                    title={genre.name} 
                                    imageUrl={genre.imageUrl}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
