// src/app/trending/[period]/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- Type Definitions ---
interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
}

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

// --- This component contains the main logic ---
function TrendingPeriodContent() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const params = useParams();
    const period = params.period as string; // 'weekly', 'monthly', or 'yearly'

    useEffect(() => {
        if (period) {
            setIsLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            
            fetch(`${apiUrl}/api/recommendations/globally-trending?period=${period}&page=${currentPage}`)
                .then(res => res.json())
                .then(data => {
                    if (data && Array.isArray(data.books)) {
                        setBooks(data.books);
                        setTotalPages(Math.ceil(data.total_books / data.per_page));
                    } else {
                        throw new Error("Invalid data format from API");
                    }
                })
                .catch(err => setError(err.message))
                .finally(() => setIsLoading(false));
        }
    }, [period, currentPage]);

    // Animation effect
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
    
    // Capitalize the first letter of the period for the title
    const pageTitle = period ? period.charAt(0).toUpperCase() + period.slice(1) : 'Trending';

    return (
        <main className="container page-content">
            <div>
                <p className="page-subtitle">Showing all</p>
                <h1 className="page-title">Trending {pageTitle}</h1>
            </div>
            <section className="mt-12">
                <div className="results-grid">
                    {isLoading && <p className="loading-text col-span-full">Loading books...</p>}
                    {error && <p className="error-text col-span-full">{error}</p>}
                    {!isLoading && !error && books.map((book) => <BookCard key={book.id} book={book} />)}
                </div>

                {/* Pagination Controls */}
                {!isLoading && !error && totalPages > 1 && (
                    <div className="pagination mt-12 flex justify-center items-center gap-4">
                        <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-arrow disabled:opacity-50">
                            &larr; Previous
                        </button>
                        <span className="pagination-number font-semibold">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-arrow disabled:opacity-50">
                            Next &rarr;
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}


// --- Main page component ---
export default function TrendingPeriodPage() {
    return (
        <div>
            {/* You would have a shared Header here */}
            <Suspense fallback={<div className="container page-content loading-text">Loading page...</div>}>
                <TrendingPeriodContent />
            </Suspense>
        </div>
    );
}