// src/app/discover/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BookCard from "../components/BookCard";
import { Book } from "../../types/book";

// --- Data for Genres ---
const genres = [
  {
    name: "Science",
    imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Science",
  },
  {
    name: "Technology",
    imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Technology",
  },
  {
    name: "Politics",
    imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=Politics",
  },
  {
    name: "Art",
    imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Art",
  },
  {
    name: "Fiction",
    imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Fiction",
  },
  {
    name: "History",
    imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=History",
  },
  {
    name: "Philosophy",
    imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Philosophy",
  },
  {
    name: "Self-Help",
    imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Self-Help",
  },
  {
    name: "Biography",
    imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=Biography",
  },
  {
    name: "Literature",
    imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Literature",
  },
];

// --- Genre Card Component ---
const GenreCard = ({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string;
}) => (
  <Link href={`/genre/${encodeURIComponent(title)}`} className="genre-card">
    <div
      className="genre-card-bg"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${imageUrl})`,
      }}
    />
    <h3 className="genre-card-title">{title}</h3>
  </Link>
);

// --- Main Discover Page Component ---
export default function DiscoverPage() {
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const trendingCarouselRef = useRef<HTMLDivElement>(null);

  // Helper function to convert HTTP to HTTPS
  const toHttps = (url: string | undefined): string | undefined => {
    if (!url) return url;
    return url.replace(/^http:\/\//i, "https://");
  };

  // Normalize book data to ensure cover URL is available
  const normalizeBook = (book: any): Book => {
    const coverUrl =
      book.coverurl ||
      book.cover_image_url ||
      book.image_url ||
      book.thumbnail ||
      undefined;

    return {
      ...book,
      coverurl: toHttps(coverUrl),
    };
  };

  // Fetch trending books
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    fetch(`${apiUrl}/api/books/recommendations/globally-trending`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.books)) {
          const normalizedBooks = data.books.map(normalizeBook);
          setTrendingBooks(normalizedBooks);
        }
      })
      .catch((err) => console.error("Failed to fetch trending books:", err));
  }, []);

  // Animate elements on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elementsToAnimate = document.querySelectorAll(
      ".animated-element, .book-card, .genre-card"
    );
    elementsToAnimate.forEach((el) => observer.observe(el));

    return () => elementsToAnimate.forEach((el) => observer.unobserve(el));
  }, [trendingBooks]);

  // Carousel scroll handler
  const handleCarouselScroll = (
    direction: "left" | "right",
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    if (ref.current) {
      const scrollAmount = 300;
      const currentScroll = ref.current.scrollLeft;
      ref.current.scrollTo({
        left:
          direction === "left"
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  function handleBookClick(b: Book): void {
    // Optionally, navigate to the book detail page
    // For now, just log the book or implement navigation as needed
    // Example: router.push(`/book/${b.id}`);
    console.log("Book clicked:", b);
  }
  return (
    <div>
      <main className="container page-content">
        <div className="space-y-16">
          {/* Header */}
          <div>
            <h1 className="page-title">Discover</h1>
            <p className="page-subtitle">
              Browse genres, find trending books, and explore curated
              collections.
            </p>
          </div>

          {/* Trending Section */}
          <section id="trending">
            <div className="section-header">
              <h2 className="section-title">Trending This Week</h2>
              <Link href="/trending" className="see-more-link">
                See More &rarr;
              </Link>
            </div>
            <div className="carousel-wrapper">
              <div ref={trendingCarouselRef} className="carousel-container">
                {trendingBooks.map((book) => (
                  <div
                    key={book.id}
                    className="book-card is-visible"
                    onClick={() => handleBookClick(book)}
                  >
                    <BookCard key={book.id} book={book} showWishlist={true} />
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  handleCarouselScroll("left", trendingCarouselRef)
                }
                className="carousel-button prev"
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  handleCarouselScroll("right", trendingCarouselRef)
                }
                className="carousel-button next"
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </section>

          {/* Genres Section */}
          <section>
            <h2 className="section-title">Browse by Genre</h2>
            <div className="genre-grid">
              {genres.map((genre) => (
                <GenreCard
                  key={genre.name}
                  title={genre.name}
                  imageUrl={genre.imageUrl}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
