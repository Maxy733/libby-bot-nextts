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

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/recommendations/globally-trending`)
            .then(res => res.json())
            .then(data => setTrendingBooks(data))
            .catch(err => console.error("Failed to fetch trending books:", err));
    }, []);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        
        fetch(`${apiUrl}/api/recommendations/by-major?major=${encodeURIComponent(selectedMajor)}`)
            .then(res => res.json())
            .then(data => setMajorBooks(data))
            .catch(err => console.error("Failed to fetch major books:", err));
    }, [selectedMajor]);

    const handleMajorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMajor(event.target.value);
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
                        <div className="carousel-container">
                            {trendingBooks.map((book, index) => <BookCard key={book.id} book={book} delay={index} />)}
                        </div>
                    </section>

                    <section>
                        <h2 className="section-title">Browse by Genre</h2>
                        <div className="genre-grid">
                            {/* UPDATED: Dynamically render the 10 genres */}
                            {genres.map((genre, index) => (
                                <GenreCard 
                                    key={genre.name}
                                    title={genre.name} 
                                    imageUrl={genre.imageUrl}
                                    delay={index} 
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="section-header">
                            <h2 className="section-title">Major Collections</h2>
                            <select className="major-select" value={selectedMajor} onChange={handleMajorChange}>
                                <option>Computer Science</option>
                                <option>Economics</option>
                                <option>Literature</option>
                                <option>Biology</option>
                                <option>History</option>
                            </select>
                        </div>
                        <div className="carousel-container">
                             {majorBooks.length > 0 ? (
                                majorBooks.map((book, index) => <BookCard key={book.id} book={book} delay={index} />)
                             ) : (
                                <p className="loading-text">No books found for this major.</p>
                             )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
