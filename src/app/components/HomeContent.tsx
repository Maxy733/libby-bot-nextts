"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import BookCarousel from "./BookCarousel";
import { Book } from "../../types/book";

interface HomeContentProps {
  showJoinUs?: boolean;
  personalized?: boolean;
}

export default function HomeContent({
  showJoinUs = true,
  personalized = false,
}: HomeContentProps) {
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [personalizedBooks, setPersonalizedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const trendingCarouselRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const personalizedCarouselRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // Get Clerk user and id for personalized recommendations
  const { user } = useUser();
  const userId = user?.id ?? null;

  // Helper function to ensure HTTPS URLs
  const toHttps = (url: string | null | undefined): string | null => {
    if (!url) return null;
    return url.replace(/^http:\/\//i, "https://");
  };

  // Helper function to normalize book data
  const normalizeBook = (book: any): Book => {
    return {
      id: Number(book.id || book.book_id),
      title: book.title || "Untitled",
      author: book.author || book.authors || "Unknown Author",
      genre: book.genre || null,
      description: book.description || null,
      coverurl: toHttps(
        book.coverurl ||
          book.cover_image_url ||
          book.image_url ||
          book.thumbnail
      ),
      rating: book.rating !== null ? Number(book.rating) : null,
      publication_date: book.publication_date || null,
      pages: book.pages || null,
      language: book.language || null,
      isbn: book.isbn || null,
    };
  };

  // Fetch trending books
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    setIsLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/books/recommendations/globally-trending?limit=10`)
      .then((response) => response.json())
      .then((data) => {
        let books: any[] = [];
        if (Array.isArray(data)) {
          books = data;
        } else if (data && Array.isArray(data.books)) {
          books = data.books;
        } else {
          throw new Error("Invalid data format received from API.");
        }
        // Normalize all books to ensure coverurl is HTTPS
        setTrendingBooks(books.map(normalizeBook));
      })
      .catch((error) => {
        console.error("Error fetching trending books:", error);
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Fetch personalized books
  useEffect(() => {
    // Only fetch personalized recommendations when the component
    // is configured for personalized content and we have a Clerk user ID.
    if (!personalized) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    if (!userId) {
      // No signed-in user: clear recommendations and stop loading.
      setPersonalizedBooks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`${apiUrl}/api/recommendations/${userId}/improve?limit=10`)
      .then((response) => response.json())
      .then((data) => {
        let books: any[] = [];
        if (Array.isArray(data)) {
          books = data;
        } else if (data && Array.isArray(data.books)) {
          books = data.books;
        } else {
          throw new Error("Invalid data format received from API.");
        }
        // Normalize all books to ensure coverurl is HTTPS
        setPersonalizedBooks(books.map(normalizeBook));
      })
      .catch((error) => {
        console.error("Error fetching personalized books:", error);
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [personalized, userId]);

  // Animate cards when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            (entry.target as HTMLElement).style.transitionDelay = `${
              index * 50
            }ms`;
          }
        });
      },
      { threshold: 0.1 }
    );

    const elementsToAnimate = document.querySelectorAll(
      ".animated-element, .book-card"
    );
    elementsToAnimate.forEach((el) => observer.observe(el));

    return () => elementsToAnimate.forEach((el) => observer.unobserve(el));
  }, [trendingBooks]);

  // Search handler
  const handleSearch = () => {
    const input = document.getElementById(
      "hero-search-input"
    ) as HTMLInputElement;
    const query = input?.value.trim();
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Carousel scroll handler
  const handleCarouselScroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right"
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

  return (
    <main className="container page-content">
      {/* Hero Section */}
      <div className="hero-wrapper">
        <section className="hero-bg">
          <div className="container hero-content">
            <h1 className="animated-element">
              Find Your Next Great Read Today
            </h1>
            <p className="animated-element">
              Explore our vast collection, discover hidden gems, and find
              exactly what you need for your next academic breakthrough.
            </p>
            <div className="search-bar animated-element">
              <input
                id="hero-search-input"
                type="text"
                placeholder="Search for any book..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
          </div>
        </section>
      </div>

      {/* Trending Section */}
      <section id="discover" className="discover-section" style={{ marginBottom: "1.5rem" }}>
        <div className="container">
          <BookCarousel title="Trending This Week" books={trendingBooks} seeMoreLink="/trending/weekly"/>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      {personalized && (
        <section id="personalized" className="discover-section" style={{ marginTop: "0.5rem" }}>
          <div className="container">
            <BookCarousel title="You might also like..." books={personalizedBooks} seeMoreLink="/recommendations" />
          </div>
        </section>
      )}

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="container about-content">
          <div className="about-title animated-element">
            <h2 className="section-title">A Smarter Library Experience</h2>
          </div>
          <div className="about-text animated-element">
            <p>
              LIBBY BOT is a project designed to modernize how our community
              interacts with the university library. By leveraging smart
              recommendations and real-time data, we help you find the resources
              you need faster than ever before.
            </p>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      {showJoinUs && (
        <section id="join-us" className="join-us-section">
          <div className="container">
            <div className="join-us-card animated-element">
              <h2>Unlock Personalized Recommendations</h2>
              <p>
                Create a free account to get recommendations based on your
                courses, interests, and reading history. Find your next favorite
                book today.
              </p>
              <Link href="/sign-up" className="join-us-btn">
                Join Us
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
