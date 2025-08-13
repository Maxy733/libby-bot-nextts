// src/app/book/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Hook to get URL parameters

// --- Type Definition for a single book ---
interface Book {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  description: string | null;
  coverurl: string | null;
  // Add other fields from your database as needed
  edition: string | null;
  imprint: string | null;
  callno: string | null;
}

// --- Main Book Details Page Component ---
export default function BookDetailsPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams(); // Get the dynamic parameters from the URL
  const { id } = params; // Extract the 'id' part

  useEffect(() => {
    // Fetch the book details only if the ID is available
    if (id) {
      // FIXED: Use the environment variable for the API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

      fetch(`${apiUrl}/api/books/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Book not found');
          }
          return response.json();
        })
        .then((data: Book) => {
          setBook(data);
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
        {loading && <p className="loading-text">Loading book details...</p>}
        {error && <p className="error-text">Error: {error}</p>}
        {book && (
          <div className="book-details-layout">
            {/* Left side: Cover Image */}
            <div className="book-details-cover">
              <img 
                src={book.coverurl || `https://placehold.co/600x900/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`} 
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
                  <li><strong>ISBN/Item No:</strong> {book.id}</li>
                  <li><strong>Edition:</strong> {book.edition || 'N/A'}</li>
                  <li><strong>Imprint:</strong> {book.imprint || 'N/A'}</li>
                  <li><strong>Call Number:</strong> {book.callno || 'N/A'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
