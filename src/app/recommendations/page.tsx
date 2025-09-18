// src/app/recommendations/page.tsx
'use client';

import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import BookCard from '../components/BookCard';
import { Book } from '../../types/book';
import { useUser } from '@clerk/nextjs';
import styles from './Recommendations.module.css';

// --- Genres / Categories Data ---
const genres = [
    { name: 'Science', imageUrl: 'https://placehold.co/400x300/2F2F2F/FFFFFF?text=Science' },
    { name: 'Technology', imageUrl: 'https://placehold.co/400x300/858585/FFFFFF?text=Technology' },
    { name: 'Politics', imageUrl: 'https://placehold.co/400x300/A18A68/FFFFFF?text=Politics' },
    { name: 'Art', imageUrl: 'https://placehold.co/400x300/2F2F2F/FFFFFF?text=Art' },
    { name: 'Fiction', imageUrl: 'https://placehold.co/400x300/858585/FFFFFF?text=Fiction' },
    { name: 'History', imageUrl: 'https://placehold.co/400x300/A18A68/FFFFFF?text=History' },
    { name: 'Philosophy', imageUrl: 'https://placehold.co/400x300/2F2F2F/FFFFFF?text=Philosophy' },
    { name: 'Self-Help', imageUrl: 'https://placehold.co/400x300/858585/FFFFFF?text=Self-Help' },
    { name: 'Biography', imageUrl: 'https://placehold.co/400x300/A18A68/FFFFFF?text=Biography' },
    { name: 'Literature', imageUrl: 'https://placehold.co/400x300/2F2F2F/FFFFFF?text=Literature' },
];

// --- Reusable BookCarousel ---
const BookCarousel = ({ 
    title, 
    books, 
    isLoading, 
    error, 
    seeMoreLink 
}: { 
    title: string, 
    books: Book[], 
    isLoading: boolean, 
    error: string | null, 
    seeMoreLink: string 
}) => {
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
        <section className={styles.section}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>{title}</h2>
                <Link href={seeMoreLink} className={styles.seeMoreLink}>See More &rarr;</Link>
            </div>
            <div className={styles.carouselWrapper}>
                <div ref={carouselRef} className={styles.carouselContainer}>
                    {isLoading && <p className={styles.loading}>Loading...</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    {!isLoading && !error && books.length > 0 && (
                        books.map((book) => <BookCard key={book.id} book={book} showWishlist />)
                    )}
                    {!isLoading && !error && books.length === 0 && (
                        <p className={styles.empty}>No books found.</p>
                    )}
                </div>
                <button onClick={() => handleCarouselScroll('left')} className={styles.prev} aria-label="Scroll left">‹</button>
                <button onClick={() => handleCarouselScroll('right')} className={styles.next} aria-label="Scroll right">›</button>
            </div>
        </section>
    );
};

// --- Main Recommendations Page ---
export default function RecommendationsPage() {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded || !isSignedIn) {
        return <p className={`${styles.loading} text-center mt-16`}>Please sign in to view your recommendations.</p>;
    }

    // State for carousels
    const [personalizedBooks, setPersonalizedBooks] = useState<Book[]>([]);
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const [staffBooks, setStaffBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<{ personalized: boolean; trending: boolean; staff: boolean }>({ personalized: true, trending: true, staff: true });
    const [error, setError] = useState<{ personalized: string | null; trending: string | null; staff: string | null }>({ personalized: null, trending: null, staff: null });

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

        fetch(`${apiUrl}/api/books/recommendations/personalized?per_page=10`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.books)) setPersonalizedBooks(data.books);
                else throw new Error('Invalid data format');
            })
            .catch(err => setError(prev => ({ ...prev, personalized: err.message })))
            .finally(() => setLoading(prev => ({ ...prev, personalized: false })));

        fetch(`${apiUrl}/api/books/recommendations/globally-trending?period=weekly&per_page=10`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.books)) setTrendingBooks(data.books);
                else throw new Error('Invalid data format');
            })
            .catch(err => setError(prev => ({ ...prev, trending: err.message })))
            .finally(() => setLoading(prev => ({ ...prev, trending: false })));

        fetch(`${apiUrl}/api/books/recommendations/staff-picks?per_page=10`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.books)) setStaffBooks(data.books);
                else throw new Error('Invalid data format');
            })
            .catch(err => setError(prev => ({ ...prev, staff: err.message })))
            .finally(() => setLoading(prev => ({ ...prev, staff: false })));
    }, []);

    return (
        <main className={styles.page}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Recommendations</h1>
                <p className={styles.label}>Books picked for you based on your interests and reading history.</p>
            </div>

            <div className="space-y-16 mt-12">
                {/* Personalized Picks */}
                <BookCarousel 
                    title="Recommended For You"
                    books={personalizedBooks}
                    isLoading={loading.personalized}
                    error={error.personalized}
                    seeMoreLink="/recommendations/personalized"
                />

                {/* Trending This Week */}
                <BookCarousel
                    title="Trending This Week"
                    books={trendingBooks}
                    isLoading={loading.trending}
                    error={error.trending}
                    seeMoreLink="/trending/weekly"
                />

                {/* Genres / Categories Grid */}
                <section className={styles.section}>
                    <h2 className={styles.title}>Browse by Genre</h2>
                    <div className={styles.grid}>
                        {genres.map((genre) => (
                            <Link key={genre.name} href={`/genre/${encodeURIComponent(genre.name)}`} className={styles.card}>
                                <div 
                                    className={styles.cover} 
                                    style={{ backgroundImage: `url(${genre.imageUrl})` }}
                                ></div>
                                <p className={styles.titleSm}>{genre.name}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recently Added / Staff Picks */}
                <BookCarousel 
                    title="Recently Added / Staff Picks"
                    books={staffBooks}
                    isLoading={loading.staff}
                    error={error.staff}
                    seeMoreLink="/recommendations/staff-picks"
                />
            </div>
        </main>
    );
}
