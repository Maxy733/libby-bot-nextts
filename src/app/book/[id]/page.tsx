import React from 'react';
import { notFound } from 'next/navigation';

interface Author {
  author_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
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

async function getBook(id: string): Promise<Book | null> {
  const apiUrl = process.env.API_URL || 'http://127.0.0.1:5000';
  const res = await fetch(`${apiUrl}/api/books/${id}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function BookDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const book = await getBook(params.id);

  if (!book) {
    notFound();
  }

  const authorFullName = book.author
    ? `${book.author.first_name || ''} ${book.author.last_name || ''}`.trim()
    : 'Unknown Author';

  return (
    <main className="container page-content">
      <a
        href="/discover"
        className="back-button"
        style={{ marginBottom: '20px', display: 'inline-block' }}
      >
        &larr; Back to Discover
      </a>

      <div className="book-details-layout">
        <div className="book-details-cover">
          <img
            src={
              book.cover_image_url ||
              `https://placehold.co/600x900/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`
            }
            alt={book.title}
          />
        </div>

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
              <li>
                <strong>ISBN:</strong> {book.isbn || 'N/A'}
              </li>
              <li>
                <strong>Pages:</strong> {book.pages || 'N/A'}
              </li>
              <li>
                <strong>Language:</strong> {book.language || 'N/A'}
              </li>
              <li>
                <strong>Published:</strong> {book.publication_date || 'N/A'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
