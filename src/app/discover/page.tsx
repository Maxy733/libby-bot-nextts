// src/app/discover/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Type Definitions ---
interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
}

// --- Data for Genres ---
const genres = [
    { name: "Science", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Science" },
    { name: "Technology", imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Technology" },
    { name: "Politics", imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=Politics" },
    { name: "Art", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Art" },
    { name: "Fiction", imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Fiction" },
    { name: "History", imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=History" },
    { name: "Philosophy", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Philosophy" },
    { name: "Self-Help", imageUrl: "https://placehold.co/400x300/858585/FFFFFF?text=Self-Help" },
    { name: "Biography", imageUrl: "https://placehold.co/400x300/A18A68/FFFFFF?text=Biography" },
    { name: "Literature", imageUrl: "https://placehold.co/400x300/2F2F2F/FFFFFF?text=Literature" },
];


// --- Reusable Components ---
const BookCard = ({ book }: { book: Book }) => (
    <Link href={`/book/${book.id}`} className="book-card">
        <img 
            src={book.coverurl || `https://placehold.co/300x450/2F2F2F/FFFFFF?text=${encodeURIComponent(book.title)}`} 
            alt={book.title} 
            className="book-cover"
        />
        <p className="book-title">{book.title || 'No Title'}</p>
        <p className="book-author">{book.author || 'Unknown Author'}</p>
    </Link>
);

const GenreCard = ({ title, imageUrl }: { title: string, imageUrl: string }) => (
    <Link href={`/genre/${encodeURIComponent(title)}`} className="genre-card">
        <div className="genre-card-bg" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${imageUrl})` }}></div>
        <h3 className="genre-card-title">{title}</h3>
    </Link>
);


// --- Main Discover Page Component ---
export default function DiscoverPage() {
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const trendingCarouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/books/recommendations/globally-trending`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.books)) {
                    setTrendingBooks(data.books);
                }
            })
            .catch(err => console.error("Failed to fetch trending books:", err));
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const elementsToAnimate = document.querySelectorAll('.animated-element, .book-card, .genre-card');
        elementsToAnimate.forEach(el => observer.observe(el));

        return () => elementsToAnimate.forEach(el => observer.unobserve(el));
    }, [trendingBooks]);
    
    const handleCarouselScroll = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
            const scrollAmount = 300;
            const currentScroll = ref.current.scrollLeft;
            
            if (direction === 'left') {
                ref.current.scrollTo({ left: currentScroll - scrollAmount, behavior: 'smooth' });
            } else {
                ref.current.scrollTo({ left: currentScroll + scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div>
            <main className="container page-content">
                <div className="space-y-16">
                    <div>
                        <h1 className="page-title">Discover</h1>
                        <p className="page-subtitle">Browse genres, find trending books, and explore curated collections.</p>
                    </div>

                    <section id="trending">
                        <div className="section-header">
                            <h2 className="section-title">Trending This Week</h2>
                            <Link href="/trending" className="see-more-link">See More &rarr;</Link>
                        </div>
                        <div className="carousel-wrapper">
                            <div ref={trendingCarouselRef} className="carousel-container">
                                {trendingBooks.map((book) => <BookCard key={book.id} book={book} />)}
                            </div>
                            <button onClick={() => handleCarouselScroll('left', trendingCarouselRef)} className="carousel-button prev" aria-label="Scroll left">‹</button>
                            <button onClick={() => handleCarouselScroll('right', trendingCarouselRef)} className="carousel-button next" aria-label="Scroll right">›</button>
                        </div>
                    </section>

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
