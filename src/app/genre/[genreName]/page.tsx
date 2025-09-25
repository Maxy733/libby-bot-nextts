// src/app/genre/[genreName]/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import BookCard from '../../components/BookCard';
import { Book } from "../../../types/book";
import styles from "../[genreName]/Genre.module.css";
import { useRouter } from 'next/navigation';

// --- This component contains the main logic ---
function GenrePageContent() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- NEW: State for pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    
    const params = useParams();
    const genreName = decodeURIComponent(params.genreName as string);

    // --- UPDATED: useEffect now depends on currentPage ---
    useEffect(() => {
        if (genreName) {
            setIsLoading(true); // Set loading true on page change
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
            
            // --- UPDATED: Fetch now includes the page number ---
            fetch(`${apiUrl}/api/books/recommendations/by-major?major=${encodeURIComponent(genreName)}&page=${currentPage}`)
                .then(res => res.json())
                .then(data => {
                    if (data && Array.isArray(data.books)) {
                        setBooks(data.books);
                        // --- NEW: Calculate total pages from the API response ---
                        setTotalPages(Math.ceil(data.total_books / 15));
                    } else {
                        throw new Error("Invalid data format from API");
                    }
                })
                .catch(err => {
                    console.error(`Failed to fetch books for genre ${genreName}:`, err);
                    setError(err.message);
                })
                .finally(() => setIsLoading(false));
        }
    }, [genreName, currentPage]); // Rerun when genreName or currentPage changes

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

    // --- NEW: Handler functions for pagination buttons ---
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
    const router = useRouter();

    return (
        <main className="container page-content">
            <div>
                <button onClick={() => router.back()} className={styles.backButton}>
                ← Back
                </button>
                <p className="page-subtitle">Showing books in</p>
                <h1 className="page-title">{genreName}</h1>
            </div>
            <section className="mt-12">
                <div className="results-grid">
                    {isLoading && <p className="loading-text col-span-full">Loading books...</p>}
                    {error && <p className="error-text col-span-full">{error}</p>}
                    {!isLoading && !error && books.length > 0 && (
                        books.map((book) => <BookCard key={book.id} book={book} />) // ✅ Use BookCard
                    )}
                    {!isLoading && !error && books.length === 0 && (
                        <p className="loading-text col-span-full">No books found in this genre.</p>
                    )}
                </div>

                {/* --- NEW: Pagination buttons --- */}
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

// --- This is the main page component that will be rendered ---
export default function GenrePage() {
    return (
        <div>
            <Suspense fallback={<div className="container page-content loading-text">Loading page...</div>}>
                <GenrePageContent />
            </Suspense>
        </div>
    );
}
