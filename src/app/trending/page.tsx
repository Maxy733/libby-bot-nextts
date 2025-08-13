// src/app/trending/page.tsx
'use client';

import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

// --- Type Definitions ---
interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null;
}

type Period = 'weekly' | 'monthly' | 'yearly';

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

// --- UPDATED: Reusable BookCarousel now includes a "See More" link ---
const BookCarousel = ({ title, books, isLoading, error, seeMoreLink }: { title: string, books: Book[], isLoading: boolean, error: string | null, seeMoreLink: string }) => {
    const carouselRef = useRef<HTMLDivElement>(null);

    const handleCarouselScroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            const currentScroll = carouselRef.current.scrollLeft;
            carouselRef.current.scrollTo({ 
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    return (
        <section>
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                {/* --- NEW: "See More" button is now a Link --- */}
                <Link href={seeMoreLink} className="see-more-link">See More &rarr;</Link>
            </div>
            <div className="carousel-wrapper">
                <div ref={carouselRef} className="carousel-container">
                    {isLoading && <p className="loading-text">Loading...</p>}
                    {error && <p className="error-text">{error}</p>}
                    {!isLoading && !error && books.length > 0 && (
                        books.map((book) => <BookCard key={book.id} book={book} />)
                    )}
                    {!isLoading && !error && books.length === 0 && (
                        <p className="loading-text">No books found for this period.</p>
                    )}
                </div>
                <button onClick={() => handleCarouselScroll('left')} className="carousel-button prev" aria-label="Scroll left">‹</button>
                <button onClick={() => handleCarouselScroll('right')} className="carousel-button next" aria-label="Scroll right">›</button>
            </div>
        </section>
    );
};


// --- Main Page Component ---
export default function TrendingPage() {
    // State definitions remain the same
    const [weeklyBooks, setWeeklyBooks] = useState<Book[]>([]);
    const [monthlyBooks, setMonthlyBooks] = useState<Book[]>([]);
    const [yearlyBooks, setYearlyBooks] = useState<Book[]>([]);
    
    type ErrorState = { weekly: string | null, monthly: string | null, yearly: string | null };
    const [loading, setLoading] = useState({ weekly: true, monthly: true, yearly: true });
    const [error, setError] = useState<ErrorState>({ weekly: null, monthly: null, yearly: null });

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

        const fetchData = (
            period: Period, 
            setData: Dispatch<SetStateAction<Book[]>>, 
            setLoadingState: (isLoading: boolean) => void, 
            setErrorState: (error: string | null) => void
        ) => {
            // Limiting the fetch to 10 books for the preview carousel
            fetch(`${apiUrl}/api/recommendations/globally-trending?period=${period}&page=1&per_page=10`)
                .then(res => res.json())
                .then(data => {
                    if (data && Array.isArray(data.books)) {
                        setData(data.books);
                    } else {
                        throw new Error("Invalid data format");
                    }
                })
                .catch(err => setErrorState(err.message))
                .finally(() => setLoadingState(false));
        };

        fetchData('weekly', setWeeklyBooks, (isLoading) => setLoading(prev => ({...prev, weekly: isLoading})), (err) => setError(prev => ({...prev, weekly: err})));
        fetchData('monthly', setMonthlyBooks, (isLoading) => setLoading(prev => ({...prev, monthly: isLoading})), (err) => setError(prev => ({...prev, monthly: err})));
        fetchData('yearly', setYearlyBooks, (isLoading) => setLoading(prev => ({...prev, yearly: isLoading})), (err) => setError(prev => ({...prev, yearly: err})));
    }, []);

    // Animation effect remains the same
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.book-card');
        elements.forEach(el => observer.observe(el));
        return () => elements.forEach(el => observer.unobserve(el));
    }, [weeklyBooks, monthlyBooks, yearlyBooks]);


    return (
        <div>
            {Header/}
            <main className="container page-content">
                <div>
                    <h1 className="page-title">Trending Books</h1>
                    <p className="page-subtitle">Discover the most popular books by time period.</p>
                </div>

                <div className="space-y-16 mt-12">
                    {/* --- UPDATED: Passing the seeMoreLink to each carousel --- */}
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