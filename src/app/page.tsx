// src/app/page.tsx
'use client'; // This marks the component as a Client Component, which is needed for hooks like useState and useEffect.

import { useState, useEffect } from 'react';
import Link from 'next/link'; // CORRECTED: Import the Link component

// --- Reusable BookCard Component ---
interface Book {
  id: number;
  title: string;
  author: string;
}

const BookCard = ({ book, delay }: { book: Book, delay: number }) => (
    <div 
        className="book-card" 
        style={{ transitionDelay: `${delay * 50}ms` }}
    >
        <img 
            src={`https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`} 
            alt={book.title} 
            className="book-cover"
        />
        <p className="book-title">{book.title || 'No Title'}</p>
        <p className="book-author">{book.author || 'Unknown Author'}</p>
    </div>
);


// --- Main Home Page Component ---
export default function Home() {
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/recommendations/globally-trending')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data: Book[]) => {
                setTrendingBooks(data);
            })
            .catch(error => {
                console.error("Error fetching trending books:", error);
            });
    }, []);

    const handleSearch = () => {
        const input = document.getElementById('hero-search-input') as HTMLInputElement;
        const query = input?.value.trim();
        if (query) {
            // In a real Next.js app, you would use the <Link> component or useRouter hook for navigation.
            // For now, simple redirection works to connect to our other HTML pages.
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    };

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
                        <a href="#about">About Us</a>
                        <a href="trending.html">Trending</a>
                    </nav>
                    <div className="header-actions">
                        {/* CORRECTED: Replaced <a> with <Link> */}
                        <Link href="/login" className="login-btn">Log In</Link>
                        <Link href="/signup" className="signup-btn">Sign Up</Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <div className="hero-wrapper">
                    <section className="hero-bg">
                        <div className="container hero-content">
                            <h1>Find Your Next Great Read Today</h1>
                            <p>Explore our vast collection, discover hidden gems, and find exactly what you need for your next academic breakthrough.</p>
                            <div className="search-bar">
                                <input id="hero-search-input" type="text" placeholder="Search for any book..." onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                <button onClick={handleSearch}>Search</button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Discover Section */}
                <section id="discover" className="discover-section">
                    <div className="container">
                        <div id="trending">
                            <h2 className="section-title">Trending This Week</h2>
                            <div className="carousel-container">
                                {trendingBooks.length > 0 ? (
                                    trendingBooks.map((book, index) => (
                                        <BookCard key={book.id || index} book={book} delay={index} />
                                    ))
                                ) : (
                                    <p className="loading-text">Loading trending books...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about" className="about-section">
                    <div className="container about-content">
                        <div className="about-title">
                            <h2 className="section-title">A Smarter Library Experience</h2>
                        </div>
                        <div className="about-text">
                            <p>LIBBY BOT is a project designed to modernize how our community interacts with the university library. By leveraging smart recommendations and real-time data, we help you find the resources you need faster than ever before.</p>
                        </div>
                    </div>
                </section>

                {/* Join Us Section */}
                <section className="join-us-section">
                    <div className="container">
                        <div className="join-us-card">
                            <h2>Unlock Personalized Recommendations</h2>
                            <p>Create a free account to get recommendations based on your courses, interests, and reading history. Find your next favorite book today.</p>
                            {/* CORRECTED: Replaced <a> with <Link> */}
                            <Link href="/signup" className="join-us-btn">Join Us</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
