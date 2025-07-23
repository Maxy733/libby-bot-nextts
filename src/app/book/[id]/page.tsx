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
      fetch(`http://127.0.0.1:5000/api/books/${id}`)
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
