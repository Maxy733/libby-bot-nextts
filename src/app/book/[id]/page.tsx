// src/app/book/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook to get URL parameters
import { useRouter } from 'next/navigation';
import styles from "./Book.module.css";

interface Book {
  book_id: number;
  title: string;
  author: string;
  genre: string | null;
  description: string | null;
  cover_image_url: string | null;
  rating: number | null;
  publication_date: string | null;
  pages: number | null;
  language: string | null;
  isbn: string | null;
}

// --- Main Book Details Page Component ---
export default function BookDetailsPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const params = useParams(); // Get the dynamic parameters from the URL
  const { id } = params; // Extract the 'id' part

  useEffect(() => {
    // Fetch the book details only if the ID is available
    if (id) {
      // FIXED: Use the environment variable for the API URL
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
            ...data,
            rating: data.rating !== null ? Number(data.rating) : null, // ensure number
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
  }, [id]); // This effect re-runs whenever the 'id' from the URL changes

  return (
    <div>

      <main className="container page-content">
  <button
    onClick={() => router.back()}
    className="px-4 py-2 mb-4 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
  >
    ← Back
  </button>

  {loading && <p className="loading-text">Loading book details...</p>}
  {error && <p className="error-text">Error: {error}</p>}
  {book && (
    <div className="book-details-layout">
            {/* Left side: Cover Image */}
            <div className="book-details-cover">
              <img 
                src={book.cover_image_url || `https://placehold.co/600x900/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`} 
                alt={book.title}
              />
            </div>

            {/* Right side: Information */}
            <div className="book-details-info">
              <h1 className="book-details-title">{book.title}</h1>
              <p className="book-details-author">by {book.author || 'Unknown Author'}</p>
              
              {book.genre && <span className="book-details-genre">{book.genre}</span>}

              <div className="book-details-section">
                <h2>Summary</h2>
                <p>{book.description || 'No summary available.'}</p>
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
          </div>
        )}
      </main>
    </div>
  );
}
