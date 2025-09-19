// src/app/book/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook to get URL parameters
import { useRouter } from 'next/navigation';
import styles from "./Book.module.css";
import WishlistButton from '@/app/components/WishlistButton';
import {Book} from "../../../types/book";

// --- Main Book Details Page Component ---
export default function BookDetailsPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const params = useParams(); // Get the dynamic parameters from the URL
  const { id } = params; // Extract the 'id' part

  useEffect(() => {
    if (id) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

      fetch(`${apiUrl}/api/books/books/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Book not found');
          }
          return response.json();
        })
        .then((data) => {
          const normalized: Book = {
            id: Number(data.book_id),
            title: data.title,
            author: data.author,
            genre: data.genre,
            description: data.description,
            coverurl: data.cover_image_url,
            rating: data.rating !== null ? Number(data.rating) : null,
            publication_date: data.publication_date,
            pages: data.pages,
            language: data.language,
            isbn: data.isbn,
          };
          setBook(normalized);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching book details:", err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  return (
    <>
      <main className="container page-content">
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>

        {loading && <p className="loading-text">Loading book details...</p>}
        {error && <p className="error-text">Error: {error}</p>}

        {book && (
          <>
            <div className={styles.bookDetailsGrid}>
              <div className={styles.bookLeftColumn}>
                <div className="book-details-cover">
                  <img
                    src={book.coverurl || `https://placehold.co/600x900/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`}
                    alt={book.title}
                  />
                </div>

                <div className="book-details-section">
                  <h2>Details</h2>
                  <ul>
                    <li><strong>ISBN:</strong> {book.isbn || 'N/A'}</li>
                    <li><strong>Language:</strong> {book.language || 'N/A'}</li>
                    <li><strong>Pages:</strong> {book.pages || 'N/A'}</li>
                    <li><strong>Publication Date:</strong> {book.publication_date ? new Date(book.publication_date).toLocaleDateString() : 'N/A'}</li>
                    <li><strong>Rating:</strong> {book.rating !== null ? book.rating.toFixed(1) : 'N/A'}</li>
                  </ul>
                </div>
              </div>

              <div className={styles.bookRightColumn}>
                <div className={styles.titleRow}>
                  <h1 className="book-details-title">{book.title}</h1>
                  <WishlistButton
                    book={{
                      id: book.id,
                      title: book.title,
                      author: book.author,
                      coverurl: book.coverurl || null
                    }}
                    showText={false}
                    className={styles.cardWishlistBtn}
                  />
                </div>
                <p className="book-details-author">by {book.author || 'Unknown Author'}</p>
                {book.genre && <span className="book-details-genre">{book.genre}</span>}

                <div className="book-details-section">
                  <h2>Summary</h2>
                  <p>{book.description || 'No summary available.'}</p>
                </div>
              </div>
            </div>

            <div className={styles.availabilitySection}>
              <h3>Availability</h3>
              <p>This book is available in the library. Please check the shelf or ask a librarian. To purchase, please kindly check the other links below.</p>
              <div className={styles.purchaseLinks}>
                <a href="mailto:library@au.edu" className={styles.bookStoreCard} target="_blank" rel="noopener noreferrer">
                  <div className={styles.bookCardWrapper}>
                    <img src="/gmail_icon.png" alt="icon" className={styles.bookCardImage} />
                    <div className={styles.bookCardInfo}>
                      <h4>Library</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a href="https://line.me/R/ti/p/@ist4769e" className={styles.bookStoreCard} target="_blank" rel="noopener noreferrer">
                  <div className={styles.bookCardWrapper}>
                    <img src="/LINE_logo.svg.webp" alt="icon" className={styles.bookCardImage} />
                    <div className={styles.bookCardInfo}>
                      <h4>LINE</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a href={`https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`} className={styles.bookStoreCard} target="_blank" rel="noopener noreferrer">
                  <div className={styles.bookCardWrapper}>
                    <img src="/amazon-tile.svg" alt="icon" className={styles.bookCardImage} />
                    <div className={styles.bookCardInfo}>
                      <h4>Amazon</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a href={`https://www.bookdepository.com/search?searchTerm=${encodeURIComponent(book.title)}`} className={styles.bookStoreCard} target="_blank" rel="noopener noreferrer">
                  <div className={styles.bookCardWrapper}>
                    <img src="https://placehold.co/100x150?text=Book" alt="icon" className={styles.bookCardImage} />
                    <div className={styles.bookCardInfo}>
                      <h4>Book Depository</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a href={`https://books.google.com/books?vid=ISBN:${book.isbn || ''}`} className={styles.bookStoreCard} target="_blank" rel="noopener noreferrer">
                  <div className={styles.bookCardWrapper}>
                    <img src="/google_bookslogo.webp" alt="icon" className={styles.bookCardImage} />
                    <div className={styles.bookCardInfo}>
                      <h4>Google Books</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}