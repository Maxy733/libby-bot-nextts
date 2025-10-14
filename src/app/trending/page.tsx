// src/app/trending/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import Link from "next/link";
import BookCard from "../components/BookCard";
import { Book } from "../../types/book";

type Period = "weekly" | "monthly" | "yearly";

// --- Reusable BookCarousel ---
const BookCarousel = ({
  title,
  books,
  isLoading,
  error,
  seeMoreLink,
}: {
  title: string;
  books: Book[];
  isLoading: boolean;
  error: string | null;
  seeMoreLink: string;
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleCarouselScroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const currentScroll = carouselRef.current.scrollLeft;
      carouselRef.current.scrollTo({
        left:
          direction === "left"
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link href={seeMoreLink} className="see-more-link">
          See More &rarr;
        </Link>
      </div>
      <div className="carousel-wrapper">
        <div ref={carouselRef} className="carousel-container">
          {isLoading && <p className="loading-text">Loading...</p>}
          {error && <p className="error-text">{error}</p>}
          {!isLoading &&
            !error &&
            books.length > 0 &&
            books.map((book) => (
              <BookCard key={book.id} book={book} showWishlist={true} />
            )) // ✅ Reused
          }
          {!isLoading && !error && books.length === 0 && (
            <p className="loading-text">No books found for this period.</p>
          )}
        </div>
        <button
          onClick={() => handleCarouselScroll("left")}
          className="carousel-button prev"
          aria-label="Scroll left"
        >
          ‹
        </button>
        <button
          onClick={() => handleCarouselScroll("right")}
          className="carousel-button next"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
};

// --- Main Page Component ---
export default function TrendingPage() {
  const [weeklyBooks, setWeeklyBooks] = useState<Book[]>([]);
  const [monthlyBooks, setMonthlyBooks] = useState<Book[]>([]);
  const [yearlyBooks, setYearlyBooks] = useState<Book[]>([]);

  type ErrorState = {
    weekly: string | null;
    monthly: string | null;
    yearly: string | null;
  };
  const [loading, setLoading] = useState({
    weekly: true,
    monthly: true,
    yearly: true,
  });
  const [error, setError] = useState<ErrorState>({
    weekly: null,
    monthly: null,
    yearly: null,
  });

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

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    const fetchData = (
      period: Period,
      setData: Dispatch<SetStateAction<Book[]>>,
      setLoadingState: (isLoading: boolean) => void,
      setErrorState: (error: string | null) => void
    ) => {
      fetch(
        `${apiUrl}/api/books/recommendations/globally-trending?period=${period}&page=1&per_page=10`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.books)) {
            const normalizedBooks = data.books.map(normalizeBook);
            setData(normalizedBooks);
          } else {
            throw new Error("Invalid data format");
          }
        })
        .catch((err) => setErrorState(err.message))
        .finally(() => setLoadingState(false));
    };

    fetchData(
      "weekly",
      setWeeklyBooks,
      (isLoading) => setLoading((prev) => ({ ...prev, weekly: isLoading })),
      (err) => setError((prev) => ({ ...prev, weekly: err }))
    );
    fetchData(
      "monthly",
      setMonthlyBooks,
      (isLoading) => setLoading((prev) => ({ ...prev, monthly: isLoading })),
      (err) => setError((prev) => ({ ...prev, monthly: err }))
    );
    fetchData(
      "yearly",
      setYearlyBooks,
      (isLoading) => setLoading((prev) => ({ ...prev, yearly: isLoading })),
      (err) => setError((prev) => ({ ...prev, yearly: err }))
    );
  }, []);

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

    const elements = document.querySelectorAll(".book-card");
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, [weeklyBooks, monthlyBooks, yearlyBooks]);

  return (
    <div>
      <main className="container page-content">
        <div>
          <h1 className="page-title">Trending Books</h1>
          <p className="page-subtitle">
            Discover the most popular books by time period.
          </p>
        </div>

        <div className="space-y-16 mt-12">
          <BookCarousel
            title="Trending This Week"
            books={weeklyBooks}
            isLoading={loading.weekly}
            error={error.weekly}
            seeMoreLink="/trending/weekly"
          />
          <BookCarousel
            title="Trending This Month"
            books={monthlyBooks}
            isLoading={loading.monthly}
            error={error.monthly}
            seeMoreLink="/trending/monthly"
          />
          <BookCarousel
            title="Trending This Year"
            books={yearlyBooks}
            isLoading={loading.yearly}
            error={error.yearly}
            seeMoreLink="/trending/yearly"
          />
        </div>
      </main>
    </div>
  );
}
