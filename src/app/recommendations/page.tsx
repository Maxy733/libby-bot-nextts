'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Recommendations.module.css';

// =====================
// Types
// =====================

type Book = {
  id: number;
  title: string;
  author: string;
  coverurl?: string | null;
  rating?: number | null;
};

type ApiTrendingResp = {
  books: Book[];
  total_books: number;
  page: number;
  per_page: number;
};

type ApiByMajorResp = ApiTrendingResp;

type Tab = 'trending' | 'major';

// =====================
// Constants
// =====================

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API ??
  'http://localhost:5000';

const TRENDING_PERIODS = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last Year' },
  { value: '5years', label: 'All-Time' },
];

const DEFAULT_MAJOR = 'Computer Science';
const MAJORS = [
  'Computer Science',
  'Business',
  'Economics',
  'Engineering',
  'Psychology',
  'Biology',
  'History',
  'Literature',
  'Art & Design',
  'Mathematics',
];

// =====================
// Component
// =====================

export default function RecommendationsPage() {
  const router = useRouter();

  // 🔒 Auth gate state (keep hooks at the top)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  // Tabs and data states — declared BEFORE any early return
  const [activeTab, setActiveTab] = useState<Tab>('trending');

  // Trending state
  const [period, setPeriod] = useState('5years');
  const [pageT, setPageT] = useState(1);
  const [loadingT, setLoadingT] = useState(false);
  const [errorT, setErrorT] = useState<string | null>(null);
  const [dataT, setDataT] = useState<ApiTrendingResp | null>(null);

  // By Major state
  const [major, setMajor] = useState(DEFAULT_MAJOR);
  const [pageM, setPageM] = useState(1);
  const [loadingM, setLoadingM] = useState(false);
  const [errorM, setErrorM] = useState<string | null>(null);
  const [dataM, setDataM] = useState<ApiByMajorResp | null>(null);

  // Fetch Trending (guarded by auth + tab)
  useEffect(() => {
    if (isLoggedIn !== true) return;
    if (activeTab !== 'trending') return;
    let cancelled = false;

    const fetchTrending = async () => {
      setLoadingT(true);
      setErrorT(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/recommendations/globally-trending?period=${encodeURIComponent(
            period
          )}&page=${pageT}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = (await res.json()) as ApiTrendingResp;
        if (!cancelled) setDataT(json);
      } catch {
        if (!cancelled) setErrorT('Failed to load trending books.');
      } finally {
        if (!cancelled) setLoadingT(false);
      }
    };

    fetchTrending();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, activeTab, period, pageT]);

  // Fetch By Major (guarded by auth + tab)
  useEffect(() => {
    if (isLoggedIn !== true) return;
    if (activeTab !== 'major') return;
    let cancelled = false;

    const fetchByMajor = async () => {
      setLoadingM(true);
      setErrorM(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/recommendations/by-major?major=${encodeURIComponent(
            major
          )}&page=${pageM}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = (await res.json()) as ApiByMajorResp;
        if (!cancelled) setDataM(json);
      } catch {
        if (!cancelled) setErrorM('Failed to load books for this major.');
      } finally {
        if (!cancelled) setLoadingM(false);
      }
    };

    fetchByMajor();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, activeTab, major, pageM]);

  // Helpers
  const totalPagesT = useMemo(() => {
    if (!dataT) return 1;
    return Math.max(1, Math.ceil(dataT.total_books / dataT.per_page));
  }, [dataT]);

  const totalPagesM = useMemo(() => {
    if (!dataM) return 1;
    return Math.max(1, Math.ceil(dataM.total_books / dataM.per_page));
  }, [dataM]);

  const books = activeTab === 'trending' ? dataT?.books ?? [] : dataM?.books ?? [];
  const loading = activeTab === 'trending' ? loadingT : loadingM;
  const error = activeTab === 'trending' ? errorT : errorM;

  // =====================
  // Render
  // =====================

  if (isLoggedIn === null) {
    return <p className="loading-text">Checking login...</p>;
  }

  if (!isLoggedIn) {
    return (
      <main className="page-content flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Sign in required</h2>
        <p className="mb-4">Please log in to see your personalized recommendations.</p>
        <button
          onClick={() => router.push('/login?redirect=/recommendations')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go to Login
        </button>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className="container">
        <header className="section-header">
          <h1 className="section-title">Recommendations</h1>
        </header>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className="btn"
            onClick={() => setActiveTab('trending')}
            aria-pressed={activeTab === 'trending'}
          >
            Trending
          </button>
          <button
            className="btn"
            onClick={() => setActiveTab('major')}
            aria-pressed={activeTab === 'major'}
          >
            By Major
          </button>
        </div>

        {/* Controls */}
        {activeTab === 'trending' ? (
          <div className={styles.controls}>
            <label className={styles.label}>Period</label>
            <select
              className="major-select"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setPageT(1);
              }}
            >
              {TRENDING_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className={styles.controls}>
            <label className={styles.label}>Major</label>
            <select
              className="major-select"
              value={major}
              onChange={(e) => {
                setMajor(e.target.value);
                setPageM(1);
              }}
            >
              {MAJORS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        <section className={styles.section}>
          {loading ? (
            <p className="loading-text">Loading…</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : books.length === 0 ? (
            <p className="loading-text">No books found.</p>
          ) : (
            <div className="results-grid">
              {books.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/book/${b.id}`)}
                  className="book-card is-visible"
                  aria-label={`Open ${b.title}`}
                >
                  <img
                    className="book-cover"
                    src={b.coverurl || '/placeholder-cover.png'}
                    alt={b.title}
                    loading="lazy"
                  />
                  <div className="book-title">{b.title}</div>
                  <div className="book-author">{b.author}</div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {books.length > 0 && (
            <nav className="pagination" aria-label="Pagination">
              {activeTab === 'trending' ? (
                <>
                  <button
                    className="pagination-arrow"
                    disabled={pageT <= 1}
                    onClick={() => setPageT((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPagesT }).slice(0, 7).map((_, i) => {
                    const num = i + 1;
                    return (
                      <button
                        key={num}
                        className={`pagination-number ${pageT === num ? 'active' : ''}`}
                        onClick={() => setPageT(num)}
                        aria-current={pageT === num ? 'page' : undefined}
                      >
                        {num}
                      </button>
                    );
                  })}
                  <button
                    className="pagination-arrow"
                    disabled={pageT >= totalPagesT}
                    onClick={() => setPageT((p) => Math.min(totalPagesT, p + 1))}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="pagination-arrow"
                    disabled={pageM <= 1}
                    onClick={() => setPageM((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPagesM }).slice(0, 7).map((_, i) => {
                    const num = i + 1;
                    return (
                      <button
                        key={num}
                        className={`pagination-number ${pageM === num ? 'active' : ''}`}
                        onClick={() => setPageM(num)}
                        aria-current={pageM === num ? 'page' : undefined}
                      >
                        {num}
                      </button>
                    );
                  })}
                  <button
                    className="pagination-arrow"
                    disabled={pageM >= totalPagesM}
                    onClick={() => setPageM((p) => Math.min(totalPagesM, p + 1))}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </>
              )}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}