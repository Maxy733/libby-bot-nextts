// src/app/discover/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Type Definitions ---
interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
}

// --- Reusable Components ---
const BookCard = ({ book, delay }: { book: Book, delay: number }) => (
    <Link href={`/book/${book.id}`} className="book-card" style={{ transitionDelay: `${delay * 50}ms` }}>
        <img 
            src={book.coverurl || `https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`} 
            alt={book.title} 
            className="book-cover"
        />
        <p className="book-title">{book.title || 'No Title'}</p>
        <p className="book-author">{book.author || 'Unknown Author'}</p>
    </Link>
);

const GenreCard = ({ title, imageUrl, delay }: { title: string, imageUrl: string, delay: number }) => (
    <Link href="#" className="genre-card" style={{ transitionDelay: `${delay * 100}ms` }}>
        <div className="genre-card-bg" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${imageUrl})` }}></div>
        <h3 className="genre-card-title">{title}</h3>
    </Link>
);


// --- Main Discover Page Component ---
export default function DiscoverPage() {
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const [majorBooks, setMajorBooks] = useState<Book[]>([]);
    const [selectedMajor, setSelectedMajor] = useState('Computer Science');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        
        // Fetch both sets of data
        Promise.all([
            fetch(`${apiUrl}/api/recommendations/globally-trending`),
            fetch(`${apiUrl}/api/recommendations/by-major?major=${encodeURIComponent(selectedMajor)}`)
        ])
        .then(async ([trendingRes, majorRes]) => {
            if (!trendingRes.ok || !majorRes.ok) {
                throw new Error("API request failed");
            }
            const trendingData = await trendingRes.json();
            const majorData = await majorRes.json();

            if (trendingData && Array.isArray(trendingData.books)) {
                setTrendingBooks(trendingData.books);
            } else {
                console.error("Invalid format for trending books");
            }

            if (Array.isArray(majorData)) {
                setMajorBooks(majorData);
            } else {
                console.error("Invalid format for major books");
            }
        })
        .catch(err => {
            console.error("Failed to fetch data for Discover page:", err);
            setError("Could not load book collections.");
        })
        .finally(() => setIsLoading(false));

    }, [selectedMajor]);

    const handleMajorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMajor(event.target.value);
    };

    const genres = [
        { name: "Science", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Science" },
        { name: "Technology", imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Technology" },
        // ... add other genres
    ];

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
                        <div className="carousel-container">
                            {isLoading && <p className="loading-text">Loading...</p>}
                            {error && <p className="error-text">{error}</p>}
                            {!isLoading && !error && trendingBooks.map((book, index) => <BookCard key={book.id} book={book} delay={index} />)}
                        </div>
                    </section>
                    
                    {/* ... (rest of the page remains the same) ... */}
                </div>
            </main>
        </div>
    );
}
