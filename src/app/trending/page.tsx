// src/app/trending/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

// --- Type Definitions ---
interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
}

type Period = 'weekly' | 'monthly' | 'yearly';

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

// --- This component contains the main logic for the page ---
function TrendingPageContent() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    
    // --- NEW: State to manage the selected time period ---
    const [period, setPeriod] = useState<Period>('weekly');

    // --- UPDATED: useEffect now depends on the 'period' state ---
    useEffect(() => {
        setIsLoading(true);
        // Reset to page 1 whenever the period changes
        setCurrentPage(1); 
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        
        // --- UPDATED: API call now includes both period and page ---
        fetch(`${apiUrl}/api/recommendations/globally-trending?period=${period}&page=1`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.books)) {
                    setBooks(data.books);
                    setTotalPages(Math.ceil(data.total_books / data.per_page));
                } else {
                    throw new Error("Invalid data format from API");
                }
            })
            .catch(err => {
                console.error(`Failed to fetch trending books for period ${period}:`, err);
                setError(err.message);
            })
            .finally(() => setIsLoading(false));
    }, [period]); // This effect re-runs only when the period changes

    // This separate effect handles pagination
    useEffect(() => {
        // Don't run this on the initial load, only on page changes > 1
        if (currentPage === 1 && period) return; 

        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/recommendations/globally-trending?period=${period}&page=${currentPage}`)
            .then(res => res.json())
            //... (same as above)
    }, [currentPage]);


    // This effect handles the animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const elementsToAnimate = document.querySelectorAll('.book-card');
        elementsToAnimate.forEach(el => observer.observe(el));

        return () => elementsToAnimate.forEach(el => observer.unobserve(el));
    }, [books]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };
    
    const getButtonClass = (buttonPeriod: Period) => {
        return period === buttonPeriod
            ? 'px-4 py-2 rounded-md bg-brand-accent text-white font-semibold'
            : 'px-4 py-2 rounded-md bg-brand-light-grey text-brand-muted-grey font-semibold hover:bg-gray-300';
    };


    return (
        <main className="container page-content">
            <div>
                <h1 className="page-title">Trending Books</h1>
                <p className="page-subtitle">Discover the most popular books by time period.</p>
            </div>

            {/* --- NEW: Buttons to change the period --- */}
            <div className="flex items-center gap-4 my-8">
                <button onClick={() => setPeriod('weekly')} className={getButtonClass('weekly')}>
                    This Week
                </button>
                <button onClick={() => setPeriod('monthly')} className={getButtonClass('monthly')}>
                    This Month
                </button>
                <button onClick={() => setPeriod('yearly')} className={getButtonClass('yearly')}>
                    This Year
                </button>
            </div>

            <section>
                <div className="results-grid">
                    {isLoading && <p className="loading-text col-span-full">Loading books...</p>}
                    {error && <p className="error-text col-span-full">{error}</p>}
                    {!isLoading && !error && books.length > 0 && (
                        books.map((book) => <BookCard key={book.id} book={book} />)
                    )}
                    {!isLoading && !error && books.length === 0 && (
                        <p className="loading-text col-span-full">No trending books found for this period.</p>
                    )}
                </div>

                {/* Pagination Controls */}
                {!isLoading && !error && totalPages > 1 && (
                    <div className="pagination mt-12 flex justify-center items-center gap-4">
                        <button 
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1}
                            className="pagination-arrow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr; Previous
                        </button>
                        <span className="pagination-number font-semibold">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages}
                            className="pagination-arrow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next &rarr;
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}


// --- This is the main page component that Next.js will render ---
export default function TrendingPage() {
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
                <TrendingPageContent />
            </Suspense>
        </div>
    );
}