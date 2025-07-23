// src/app/trending/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
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

const Pagination = ({ currentPage, totalPages }: { currentPage: number, totalPages: number }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination">
            {currentPage > 1 && (
                <Link href={`/trending?page=${currentPage - 1}`} className="pagination-arrow">&laquo;</Link>
            )}
            {pageNumbers.map(number => (
                <Link 
                    key={number} 
                    href={`/trending?page=${number}`}
                    className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                >
                    {number}
                </Link>
            ))}
            {currentPage < totalPages && (
                 <Link href={`/trending?page=${currentPage + 1}`} className="pagination-arrow">&raquo;</Link>
            )}
        </div>
    )
}

// --- This component contains the logic that uses the hook ---
function TrendingPageContent() {
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        // Fetch trending books for the current page
        fetch(`http://127.0.0.1:5000/api/recommendations/globally-trending?page=${currentPage}`)
            .then(res => res.json())
            .then(data => {
                setTrendingBooks(data.books);
                setTotalPages(Math.ceil(data.total_books / data.per_page));
            })
            .catch(err => console.error("Failed to fetch trending books:", err));
    }, [currentPage]); // Re-fetch whenever the currentPage changes

    return (
        <main className="container page-content">
            <div className="space-y-12">
                <div>
                    <h1 className="page-title">Trending Books</h1>
                    <p className="page-subtitle">See what&apos;s popular in the library right now, based on recent checkouts and ratings.</p>
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
                
                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
            </div>
        </main>
    )
}


// --- This is the main page component that will be rendered ---
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
                        <Link href="/#about">About Us</Link>
                        <Link href="/trending" className="text-brand-charcoal">Trending</Link>
                    </nav>
                    <div className="header-actions">
                        <Link href="/login" className="login-btn">Log In</Link>
                        <Link href="/signup" className="signup-btn">Sign Up</Link>
                    </div>
                </div>
            </header>
            
            {/* Wrap the part of the page that uses the hook in Suspense */}
            <Suspense fallback={<div className="container page-content loading-text">Loading page...</div>}>
                <TrendingPageContent />
            </Suspense>
        </div>
    );
}
