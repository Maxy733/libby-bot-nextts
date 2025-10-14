"use client";

import React, { useRef } from "react";
import BookCard from "./BookCard";
import styles from "./BookCarousel.module.css";
import type { Book } from "../../types/book";



interface BookCarouselProps {
  title: string;
  books: Book[];
}

/**
 * BookCarousel Component
 * ----------------------
 * Displays a horizontally scrollable carousel of BookCard components.
 * Designed to match existing BookCard and Book page visual style.
 */
export default function BookCarousel({ title, books }: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.carouselSection}>
      <div className={styles.carouselHeader}>
        <h2 className={styles.carouselTitle}>{title}</h2>
        <div className={styles.carouselHeaderRight}>
          <button
            className={styles.button}
            onClick={() => (window.location.href = '/books')}
          >
            See More
          </button>
        </div>
      </div>

      <div ref={scrollRef} className={styles.carouselContainer}>
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              className={styles.carouselBookCard}
            />
          ))
        ) : (
          <p className={styles.emptyText}>No books to display</p>
        )}
      </div>

      <div className={styles.scrollButtons}>
        <button
          onClick={() => scroll("left")}
          className={styles.scrollBtn}
          aria-label="Scroll left"
        >
          {"<"}
        </button>
        <button
          onClick={() => scroll("right")}
          className={styles.scrollBtn}
          aria-label="Scroll right"
        >
          {">"}
        </button>
      </div>
    </section>
  );
}