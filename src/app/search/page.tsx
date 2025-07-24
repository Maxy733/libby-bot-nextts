// src/app/search/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

// --- This component contains the main search logic ---
function SearchResults() {
    const [results, setResults] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            
            fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}`)
                .then(res => {
                    if (!res.ok) throw new Error("Search request failed");
                    return res.json();
                })
                .then(data => {
                    if (Array.isArray(data)) {
                        setResults(data);
                    } else {
                        throw new Error("Invalid data format from search API");
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch search results:", err);
                    setError(err.message);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [query]);

    return (
        <main className="container page-content">
            <div>
                <p className="page-subtitle">Search results for:</p>
                <h1 className="page-title">&quot;{query}&quot;</h1>
            </div>
            <section className="mt-12">
                <div className="results-grid">
                    {isLoading && <p className="loading-text col-span-full">Loading results...</p>}
                    {error && <p className="error-text col-span-full">{error}</p>}
                    {!isLoading && !error && results.length > 0 && (
                        results.map((book, index) => <BookCard key={book.id} book={book} delay={index} />)
                    )}
                    {!isLoading && !error && results.length === 0 && (
                        <p className="loading-text col-span-full">No books found matching your search.</p>
                    )}
                </div>
            </section>
        </main>
    );
}

// --- This is the main page component that will be rendered ---
export default function SearchPage() {
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
            
            <Suspense fallback={<div className="container page-content loading-text">Loading page...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}
