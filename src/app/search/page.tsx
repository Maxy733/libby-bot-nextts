// src/app/search/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BookCard from '../components/BookCard';
import { Book } from '../../types/book';

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
            setIsLoading(true);
            setError(null);
            
            fetch(`${apiUrl}/api/books/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    // --- THIS IS THE FIX ---
                    // This logic is now more robust. It checks for both possible data formats.
                    if (Array.isArray(data)) {
                        // Handles the case where the API sends a simple list: [...]
                        setResults(data);
                    } else if (data && Array.isArray(data.books)) {
                        // Handles the case where the API sends an object: { "books": [...] }
                        setResults(data.books);
                    } else {
                        // If the data is not in a format we expect, we throw an error.
                        throw new Error("Invalid data format received from API.");
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
    }, [results]);

    return (
        <main className="container page-content">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <button
                onClick={() => window.history.back()}
                style={{
                  backgroundColor: "#9c6237",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                ← Back
              </button>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Search books..."
                  style={{
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    padding: "0 10px",
                    minWidth: "200px"
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      const newQuery = input.value.trim();
                      if (newQuery) {
                        window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(input.value.trim())}`;
                    }
                  }}
                  style={{
                    backgroundColor: "#9c6237",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: 500
                  }}
                >
                  Search
                </button>
              </div>
            </header>
            <div>
                <p className="page-subtitle">Search results for:</p>
                <h1 className="page-title">&quot;{query}&quot;</h1>
            </div>
            <section className="mt-12">
                <div className="results-grid">
                    {isLoading && <p className="loading-text col-span-full">Loading results...</p>}
                    {error && <p className="error-text col-span-full">{error}</p>}
                    {!isLoading && !error && results.length > 0 && (
                        results.map((book) => <BookCard key={book.id} book={book} showWishlist={true} />)
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
            
            <Suspense fallback={<div className="container page-content loading-text">Loading page...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}
