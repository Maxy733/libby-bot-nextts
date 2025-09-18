// src/app/recommendations/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BookCard from '../components/BookCard';
import { Book } from '../../types/book';
import { useUser } from '@clerk/nextjs';

// --- All possible genres ---
const allGenres = [
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

// --- BookCarousel Component ---
const BookCarousel = ({ 
    title, 
    books, 
    isLoading, 
    error, 
    seeMoreLink 
}: { 
    title: string; 
    books: Book[]; 
    isLoading: boolean; 
    error: string | null; 
    seeMoreLink: string; 
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
        <section style={{ opacity: 1 }}>
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                <Link href={seeMoreLink} className="see-more-link">See More &rarr;</Link>
            </div>
            <div className="carousel-wrapper">
                <div ref={carouselRef} className="carousel-container">
                    {isLoading && <p className="loading-text">Loading...</p>}
                    {error && <p className="error-text">{error}</p>}
                    {!isLoading && !error && books.length > 0 && (
                        books.map((book) => <BookCard key={book.id} book={book} showWishlist />)
                    )}
                    {!isLoading && !error && books.length === 0 && (
                        <p className="loading-text">No books found.</p>
                    )}
                </div>
                <button 
                    onClick={() => handleCarouselScroll('left')} 
                    className="carousel-button prev" 
                    aria-label="Scroll left"
                >
                    ‹
                </button>
                <button 
                    onClick={() => handleCarouselScroll('right')} 
                    className="carousel-button next" 
                    aria-label="Scroll right"
                >
                    ›
                </button>
            </div>
        </section>
    );
};

// --- Main Recommendations Page ---
export default function RecommendationsPage() {
    const { isSignedIn, isLoaded, user } = useUser();

    // State for carousels
    const [personalizedBooks, setPersonalizedBooks] = useState<Book[]>([]);
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const [staffBooks, setStaffBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<{ 
        personalized: boolean; 
        trending: boolean; 
        staff: boolean; 
    }>({ 
        personalized: true, 
        trending: true, 
        staff: true 
    });
    const [error, setError] = useState<{ 
        personalized: string | null; 
        trending: string | null; 
        staff: string | null; 
    }>({ 
        personalized: null, 
        trending: null, 
        staff: null 
    });
    const [userGenres, setUserGenres] = useState<typeof allGenres>([]);

    // Show loading or redirect if not authenticated
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="container page-content text-center mt-16">
                <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                <p className="text-gray-600 mb-6">Please sign in to view your personalized recommendations.</p>
                <Link href="/sign-in" className="signup-btn">
                    Sign In
                </Link>
            </div>
        );
    }

    // Get user interests from metadata
    const userInterests = (user?.publicMetadata as { interests?: string[] })?.interests || [];

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

        // Fetch personalized books
        const fetchPersonalized = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/books/recommendations/personalized?per_page=10`);
                const data = await response.json();
                if (data && Array.isArray(data.books)) {
                    setPersonalizedBooks(data.books);
                }
            } catch (err) {
                setError(prev => ({ 
                    ...prev, 
                    personalized: err instanceof Error ? err.message : 'Failed to load personalized books' 
                }));
            } finally {
                setLoading(prev => ({ ...prev, personalized: false }));
            }
        };

        // Fetch trending books
        const fetchTrending = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/books/recommendations/globally-trending?period=weekly&per_page=10`);
                const data = await response.json();
                if (data && Array.isArray(data.books)) {
                    setTrendingBooks(data.books);
                }
            } catch (err) {
                setError(prev => ({ 
                    ...prev, 
                    trending: err instanceof Error ? err.message : 'Failed to load trending books' 
                }));
            } finally {
                setLoading(prev => ({ ...prev, trending: false }));
            }
        };

        // Fetch staff picks
        const fetchStaffPicks = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/books/recommendations/staff-picks?per_page=10`);
                const data = await response.json();
                if (data && Array.isArray(data.books)) {
                    setStaffBooks(data.books);
                }
            } catch (err) {
                setError(prev => ({ 
                    ...prev, 
                    staff: err instanceof Error ? err.message : 'Failed to load staff picks' 
                }));
            } finally {
                setLoading(prev => ({ ...prev, staff: false }));
            }
        };

        // Execute all fetches
        fetchPersonalized();
        fetchTrending();
        fetchStaffPicks();

        // Set user genres based on interests
        if (userInterests && Array.isArray(userInterests)) {
            setUserGenres(allGenres.filter(genre => userInterests.includes(genre.name)));
        } else {
            setUserGenres([]); // fallback
        }
    }, [user, userInterests]);

    return (
        <main className="container page-content">
            <div>
                <h1 className="page-title">Recommendations</h1>
                <p className="page-subtitle">
                    Books picked for you based on your interests and reading history.
                </p>
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
                {userGenres.length > 0 && (
                    <section className="genre-grid-section">
                        <h2 className="section-title">Browse by Your Interests</h2>
                        <div className="genre-grid">
                            {userGenres.map((genre) => (
                                <Link 
                                    key={genre.name} 
                                    href={`/genre/${encodeURIComponent(genre.name)}`} 
                                    className="genre-card"
                                >
                                    <div 
                                        className="genre-card-bg" 
                                        style={{ 
                                            backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${genre.imageUrl})` 
                                        }}
                                    />
                                    <h3 className="genre-card-title">{genre.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

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