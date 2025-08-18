//home page
'use client'; 
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Reusable BookCard Component ---
interface Book {
  id: number;
  title: string;
  author: string;
  coverurl: string | null; 
}

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


// --- Main Home Page Component ---
export default function Home() {
    const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // NEW: Create a ref to hold a reference to the carousel's DOM element
    const trendingCarouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        setIsLoading(true);
        setError(null);

        fetch(`${apiUrl}/api/recommendations/globally-trending`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTrendingBooks(data);
                } else if (data && Array.isArray(data.books)) {
                    setTrendingBooks(data.books);
                } else {
                    throw new Error("Invalid data format received from API.");
                }
            })
            .catch(error => {
                console.error("Error fetching trending books:", error);
                setError(error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []); 

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    
                    entry.target.classList.add('is-visible');
                    (entry.target as HTMLElement).style.transitionDelay = `${index * 50}ms`;
                }
            });
        }, { threshold: 0.1 });

        const elementsToAnimate = document.querySelectorAll('.animated-element, .book-card');
        elementsToAnimate.forEach(el => observer.observe(el));

        return () => elementsToAnimate.forEach(el => observer.unobserve(el));
    }, [trendingBooks]);

    const handleSearch = () => {
        const input = document.getElementById('hero-search-input') as HTMLInputElement;
        const query = input?.value.trim();
        if (query) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    };
    const handleCarouselScroll = (direction: 'left' | 'right') => {
        if (trendingCarouselRef.current) {
            const scrollAmount = 300;
            const currentScroll = trendingCarouselRef.current.scrollLeft;
            
            if (direction === 'left') {
                trendingCarouselRef.current.scrollTo({ left: currentScroll - scrollAmount, behavior: 'smooth' });
            } else {
                trendingCarouselRef.current.scrollTo({ left: currentScroll + scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div>
            <main className="container page-content">
            
                {/* Hero Section */}
                <div className="hero-wrapper">
                    <section className="hero-bg">
                        <div className="container hero-content">
                            <h1 className="animated-element">Find Your Next Great Read Today</h1>
                            <p className="animated-element">Explore our vast collection, discover hidden gems, and find exactly what you need for your next academic breakthrough.</p>
                            <div className="search-bar animated-element">
                                <input id="hero-search-input" type="text" placeholder="Search for any book..." onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                <button onClick={handleSearch}>Search</button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Discover Section */}
                <section id="discover" className="discover-section">
                    <div className="container">
                        <div id="trending">
                            <h2 className="section-title animated-element">Trending This Week</h2>
                            <div className="carousel-wrapper">
                                <div ref={trendingCarouselRef} className="carousel-container">
                                    {isLoading && <p className="loading-text">Loading trending books...</p>}
                                    {error && <p className="error-text">{error}</p>}
                                    {!isLoading && !error && trendingBooks.map((book, index) => (
                                        <BookCard key={book.id || index} book={book} />
                                    ))}
                                </div>
                                {/* NEW: Scroll Buttons */}
                                <button onClick={() => handleCarouselScroll('left')} className="carousel-button prev" aria-label="Scroll left">‹</button>
                                <button onClick={() => handleCarouselScroll('right')} className="carousel-button next" aria-label="Scroll right">›</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about" className="about-section">
                    <div className="container about-content">
                        <div className="about-title animated-element">
                            <h2 className="section-title">A Smarter Library Experience</h2>
                        </div>
                        <div className="about-text animated-element">
                            <p>LIBBY BOT is a project designed to modernize how our community interacts with the university library. By leveraging smart recommendations and real-time data, we help you find the resources you need faster than ever before.</p>
                        </div>
                    </div>
                </section>

                {/* Join Us Section */}
                <section className="join-us-section">
                    <div className="container">
                        <div className="join-us-card animated-element">
                            <h2>Unlock Personalized Recommendations</h2>
                            <p>Create a free account to get recommendations based on your courses, interests, and reading history. Find your next favorite book today.</p>
                            <Link href="/signup" className="join-us-btn">Join Us</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
