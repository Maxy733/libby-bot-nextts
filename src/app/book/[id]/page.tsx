// src/app/book/[id]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';

// --- Interfaces for your final data structure ---
interface Author {
  author_id: number;
  first_name: string;
  last_name: string;
}

interface Book {
  book_id: number;
  title: string;
  description: string | null;
  author: Author; 
  isbn: string | null;
  genre: string | null;
  publication_date: string | null;
  pages: number | null;
  language: string | null;
  rating: number | null;
  cover_image_url: string | null;
}

// --- Data fetching function (runs on the server) ---
async function getBook(id: string): Promise<Book | null> {
  // Use the server-side environment variable (no NEXT_PUBLIC_ prefix needed)
  const apiUrl = process.env.API_URL || 'http://127.0.0.1:5000';
  
  const res = await fetch(`${apiUrl}/api/books/${id}`, {
    // This tells Next.js to cache the result for one hour
    next: { revalidate: 3600 }, 
  });

  if (!res.ok) {
    // If the API returns a 404 or other error, we'll treat it as not found
    return null;
  }
  return res.json();
}

// --- Main Page Component ---
// It's now an 'async' function that gets 'params' as a prop.
// We type 'params' inline, which avoids all 'PageProps' errors.
export default async function BookDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const book = await getBook(id);

  // If the book doesn't exist, render the not-found page
  if (!book) {
    notFound();
  }
  
  // Helper to safely construct the author's full name
  const authorFullName = book.author 
    ? `${book.author.first_name || ''} ${book.author.last_name || ''}`.trim() 
    : 'Unknown Author';

  return (
    <main className="container page-content">
      <a href="/discover" className="back-button" style={{ marginBottom: '20px', display: 'inline-block' }}>
        &larr; Back to Discover
      </a>

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
          <p className="book-details-author">by {authorFullName}</p>
          
          <div className="meta-tags">
            {book.genre && <span className="book-details-genre">{book.genre}</span>}
            {book.rating && <span className="book-details-rating">⭐ {book.rating} / 5</span>}
          </div>

          <div className="book-details-section">
            <h2>Summary</h2>
            <p>{book.description || 'No summary available.'}</p>
          </div>

          <div className="book-details-section">
            <h2>Details</h2>
            <ul>
              <li><strong>ISBN:</strong> {book.isbn || 'N/A'}</li>
              <li><strong>Pages:</strong> {book.pages || 'N/A'}</li>
              <li><strong>Language:</strong> {book.language || 'N/A'}</li>
              <li><strong>Published:</strong> {book.publication_date || 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}