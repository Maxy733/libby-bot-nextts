// src/app/genre/[genreName]/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BookCard from '../../components/BookCard'; // ✅ Reuse BookCard
import { Book } from "../../../types/book";
import styles from "../[genreName]/Genre.module.css"; // create or reuse CSS module

function GenreContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const params = useParams();
  const router = useRouter();
  const genre = params.genreName as string;

  useEffect(() => {
    if (genre) {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

      fetch(`${apiUrl}/api/recommendations/by-genre?genres=${encodeURIComponent(genre)}&page=${currentPage}&per_page=20`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.books)) {
            // ✅ Pass raw backend books directly; they already have year/publication_date
            setBooks(
              data.books.map((b: any) => ({
                ...b,
                year: b.year ?? b.publication_date?.split("-")[0] ?? "Unknown",
              }))
            );
            setTotalPages(Math.ceil(data.total_books / data.per_page));
          } else {
            throw new Error("Invalid data format from API");
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [genre, currentPage]);

  // Scroll animation
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
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <main className="container page-content">
      <div>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>
        <h1 className="page-title">Books in {genre}</h1>
      </div>

      <section className="mt-12">
        <div className="results-grid">
          {isLoading && <p className="loading-text col-span-full">Loading books...</p>}
          {error && <p className="error-text col-span-full">{error}</p>}
          {!isLoading && !error && books.length > 0 && (
            books.map((book) => (
              <BookCard key={book.id} book={book} showWishlist={true} />
            ))
          )}
          {!isLoading && !error && books.length === 0 && (
            <p className="loading-text col-span-full">No books found for this genre.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="pagination mt-12 flex justify-center items-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="pagination-arrow disabled:opacity-50"
            >
              &larr;
            </button>
            <span className="pagination-number font-semibold">
              Page {currentPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination-arrow disabled:opacity-50"
            >
              &rarr;
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function GenrePage() {
  return (
    <div>
      <Suspense fallback={<div className="container page-content loading-text">Loading page...</div>}>
        <GenreContent />
      </Suspense>
    </div>
  );
}