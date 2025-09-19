"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser, useAuth } from "@clerk/nextjs";
import styles from "./Recommendations.module.css";

// Import the interaction tracking utilities
import {
  trackUserInteraction,
  getPersonalizedRecommendations,
  getUserInteractionHistory,
  getUserGenrePreferences,
} from "../utils/interactionTracker";

type Book = {
  id: number;
  title: string;
  author: string;
  coverurl?: string | null;
  cover_image_url?: string | null;
  rating?: number | null;
  genre?: string | null;
  recommendation_type?: string; // Track how this book was recommended
};

type ApiTrendingResp = {
  books: Book[];
  total_books: number;
  page: number;
  per_page: number;
};

type PersonalizedRecommendationResp = {
  success: boolean;
  books: Book[];
  algorithm_used?: string;
  algorithm?: string;
  algorithm_breakdown?: {
    collaborative: number;
    content_based: number;
    trending: number;
  };
  confidence_score?: number;
  confidence?: number;
  reasons?: string[];
  generated_at?: string;
  total_count?: number;
  user_interactions_count?: number;
};

type Tab = "personalized" | "trending" | "major";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const TRENDING_PERIODS = [
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "3months", label: "Last 3 Months" },
  { value: "6months", label: "Last 6 Months" },
  { value: "1year", label: "Last Year" },
  { value: "5years", label: "All-Time" },
];

const DEFAULT_MAJOR = "Computer Science";
const MAJORS = [
  "Computer Science",
  "Business",
  "Economics",
  "Engineering",
  "Psychology",
  "Biology",
  "History",
  "Literature",
  "Art & Design",
  "Mathematics",
];

const toHttps = (u?: string | null) => {
  if (!u) return u;
  try {
    const url = new URL(u);
    if (url.protocol === "http:") url.protocol = "https:";
    return url.toString();
  } catch {
    return u;
  }
};

const placeholder = (t: string) =>
  `https://placehold.co/320x480/2d2d2d/ffffff?text=${encodeURIComponent(
    t
  )}&font=roboto`;

function CardCover({ title, src }: { title: string; src?: string | null }) {
  const safeSrc = src || placeholder(title);
  return (
    <img
      src={safeSrc}
      alt={title}
      referrerPolicy="no-referrer"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = placeholder(title);
      }}
      className="w-full h-[240px] md:h-[280px] object-cover rounded-xl bg-[#1e1f22]"
      loading="lazy"
    />
  );
}

export default function RecommendationsPage() {
  const router = useRouter();

  // Clerk hooks
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // User interaction data
  const [userInteractionCount, setUserInteractionCount] = useState<number>(0);
  const [userGenrePrefs, setUserGenrePrefs] = useState<any[]>([]);

  // Save userId and token after Clerk login
  useEffect(() => {
    const saveUserId = async () => {
      if (user) {
        localStorage.setItem("userId", user.id);
        const token = await getToken();
        if (token) {
          localStorage.setItem("token", token);
        }
      }
    };
    saveUserId();
  }, [user, getToken]);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUserId =
        localStorage.getItem("userId") || localStorage.getItem("user_id");
      setIsLoggedIn(!!token);
      setUserId(storedUserId);
    } catch {
      setIsLoggedIn(false);
      setUserId(null);
    }
  }, []);

  // Load user interaction data
  useEffect(() => {
    if (userId && isLoggedIn) {
      loadUserInteractionData();
    }
  }, [userId, isLoggedIn]);

  const loadUserInteractionData = async () => {
    if (!userId) return;

    try {
      // Get interaction history to show count
      const historyResult = await getUserInteractionHistory(userId, 5);
      if (historyResult.success) {
        setUserInteractionCount(historyResult.interactions.length);
      }

      // Get genre preferences
      const genreResult = await getUserGenrePreferences(userId);
      if (genreResult.success) {
        setUserGenrePrefs(genreResult.genre_preferences);
      }
    } catch (error) {
      console.error("Error loading user interaction data:", error);
    }
  };

  // Handle book clicks with interaction tracking
  const handleBookClick = async (book: Book) => {
    if (!userId || !isLoggedIn) return;

    try {
      await trackUserInteraction({
        user_id: userId,
        book_id: book.id,
        type: "click",
      });

      // Update interaction count
      setUserInteractionCount((prev) => prev + 1);

      console.log(`Tracked click on book: ${book.title} (ID: ${book.id})`);
    } catch (error) {
      console.error("Error tracking book click:", error);
    }
  };

  const [activeTab, setActiveTab] = useState<Tab>("personalized");

  // Personalized state
  const [loadingP, setLoadingP] = useState(false);
  const [errorP, setErrorP] = useState<string | null>(null);
  const [dataP, setDataP] = useState<PersonalizedRecommendationResp | null>(
    null
  );

  // Trending state
  const [period, setPeriod] = useState("5years");
  const [pageT, setPageT] = useState(1);
  const [loadingT, setLoadingT] = useState(false);
  const [errorT, setErrorT] = useState<string | null>(null);
  const [dataT, setDataT] = useState<ApiTrendingResp | null>(null);

  // Major state
  const [major, setMajor] = useState(DEFAULT_MAJOR);
  const [pageM, setPageM] = useState(1);
  const [loadingM, setLoadingM] = useState(false);
  const [errorM, setErrorM] = useState<string | null>(null);
  const [dataM, setDataM] = useState<ApiTrendingResp | null>(null);

  // Fetch personalized recommendations
  useEffect(() => {
    if (isLoggedIn === null || activeTab !== "personalized") return;

    // If user is not logged in or userId is missing, show error
    if (!isLoggedIn || !userId) {
      setLoadingP(false);
      setErrorP("Please log in to see personalized recommendations.");
      setDataP({
        success: false,
        books: [],
        algorithm_used: "Error",
        confidence_score: 0,
        reasons: ["User not logged in or userId missing"],
        total_count: 0,
      });
      return;
    }

    let cancelled = false;

    const fetchPersonalized = async () => {
      setLoadingP(true);
      setErrorP(null);

      try {
        console.log(
          `Fetching personalized recommendations for user: ${userId}`
        );
        const result = await getPersonalizedRecommendations(userId, 20);

        if (!cancelled) {
          if (result.success && result.books && result.books.length > 0) {
            setDataP({
              success: true,
              books: result.books,
              algorithm_used:
                result.algorithm_used || result.algorithm || "Personalized",
              algorithm_breakdown: result.algorithm_breakdown,
              confidence_score:
                result.confidence_score || result.confidence || 0.8,
              reasons: result.reasons || [
                "Based on your interactions and preferences",
              ],
              total_count: result.books.length,
              user_interactions_count:
                result.user_interactions_count || userInteractionCount,
            });
            console.log(
              `Loaded ${result.books.length} personalized books using: ${
                result.algorithm_used || result.algorithm
              }`
            );
            if (result.algorithm_breakdown) {
              console.log("Algorithm breakdown:", result.algorithm_breakdown);
            }
          } else {
            setErrorP(
              result.error || "No personalized recommendations available"
            );
            setDataP({
              success: false,
              books: [],
              algorithm_used: "Error",
              confidence_score: 0,
              reasons: [result.error || "No recommendations found"],
              total_count: 0,
            });
          }
        }
      } catch (error) {
        // Fallback to original API if interaction tracker fails
        console.warn(
          "Enhanced recommendations failed, falling back to original API:",
          error
        );

        const endpoints = [
          {
            url: `${API_BASE}/api/recommendations/${userId}/enhanced?limit=20`,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            type: "personalized",
          },
        ];

        for (const endpoint of endpoints) {
          if (cancelled) break;

          try {
            console.log(`Trying fallback endpoint: ${endpoint.url}`);
            const res = await fetch(endpoint.url, {
              headers: {
                "Content-Type": "application/json",
                ...endpoint.headers,
              } as HeadersInit,
            });

            if (!res.ok) {
              console.warn(`Endpoint ${endpoint.url} returned ${res.status}`);
              continue;
            }

            const json = await res.json();
            const rawBooks = Array.isArray(json?.books) ? json.books : [];

            if (rawBooks.length === 0) {
              console.warn(`Endpoint ${endpoint.url} returned no books`);
              continue;
            }

            const books = rawBooks
              .map((b: any) => ({
                id: Number(b.id ?? b.book_id),
                title: b.title ?? "",
                author: b.author ?? b.authors ?? "",
                rating: b.rating ?? null,
                genre: b.genre ?? null,
                coverurl: toHttps(
                  b.coverurl ||
                    b.cover_image_url ||
                    b.image_url ||
                    b.thumbnail ||
                    null
                ),
              }))
              .filter((b: any) => Number.isFinite(b.id) && b.title.trim());

            if (books.length === 0) {
              console.warn(
                `Endpoint ${endpoint.url} had no valid books after normalization`
              );
              continue;
            }

            console.log(
              `Successfully loaded ${books.length} books from fallback ${endpoint.url}`
            );
            if (!cancelled) {
              setDataP({
                success: true,
                books: books,
                algorithm_used: "Fallback API",
                confidence_score: 0.7,
                reasons: [`Loaded from ${endpoint.type} endpoint`],
                total_count: books.length,
              });
              setLoadingP(false);
              return;
            }
          } catch (err) {
            console.warn(`Fallback endpoint ${endpoint.url} failed:`, err);
            continue;
          }
        }

        // If both enhanced and fallback fail
        if (!cancelled) {
          console.error("All recommendation endpoints failed");
          setErrorP("Unable to load recommendations. Please try again later.");
          setDataP({
            success: false,
            books: [],
            algorithm_used: "Error",
            confidence_score: 0,
            reasons: ["All endpoints failed"],
            total_count: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingP(false);
        }
      }
    };

    fetchPersonalized();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userId, activeTab, userInteractionCount]);

  // Fetch trending books
  useEffect(() => {
    if (activeTab !== "trending") return;

    const fetchTrending = async () => {
      setLoadingT(true);
      setErrorT(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/books/recommendations/globally-trending?period=${period}&page=${pageT}&per_page=20`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawBooks = data.books || [];

        if (rawBooks.length === 0) {
          throw new Error("No trending books returned");
        }

        // Normalize the books data
        const normalizedBooks = rawBooks
          .map((b: any) => ({
            id: Number(b.id ?? b.book_id),
            title: b.title ?? "",
            author: b.author ?? b.authors ?? "",
            genre: b.genre ?? null,
            rating: b.rating ?? null,
            coverurl: toHttps(
              b.coverurl ||
                b.cover_image_url ||
                b.image_url ||
                b.thumbnail ||
                null
            ),
          }))
          .filter((b: any) => Number.isFinite(b.id));

        setDataT({
          ...data,
          books: normalizedBooks,
        });
      } catch (error) {
        console.warn("Primary trending endpoint failed:", error);

        // Try fallback endpoint
        try {
          const fallbackResponse = await fetch(
            `${API_BASE}/api/recommendations/mixed?limit=20`
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.success && fallbackData.books?.length > 0) {
              setDataT({
                books: fallbackData.books,
                total_books: fallbackData.books.length,
                page: 1,
                per_page: 20,
              });
              setErrorT(null);
              return;
            }
          }
          throw new Error("Fallback also failed");
        } catch (fallbackError) {
          console.error("All trending endpoints failed:", fallbackError);
          setErrorT("Failed to load trending books. Please try again later.");
        }
      } finally {
        setLoadingT(false);
      }
    };

    fetchTrending();
  }, [activeTab, period, pageT]);

  // Fetch books by major
  useEffect(() => {
    if (activeTab !== "major") return;

    const fetchByMajor = async () => {
      setLoadingM(true);
      setErrorM(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/books/recommendations/by-major?major=${encodeURIComponent(
            major
          )}&page=${pageM}&per_page=20`
        );

        if (response.ok) {
          const data = await response.json();

          // Normalize the books data
          const rawBooks = data.books || [];
          const normalizedBooks = rawBooks
            .map((b: any) => ({
              id: Number(b.id ?? b.book_id),
              title: b.title ?? "",
              author: b.author ?? b.authors ?? "",
              genre: b.genre ?? null,
              rating: b.rating ?? null,
              coverurl: toHttps(
                b.coverurl ||
                  b.cover_image_url ||
                  b.image_url ||
                  b.thumbnail ||
                  null
              ),
            }))
            .filter((b: any) => Number.isFinite(b.id));

          setDataM({
            ...data,
            books: normalizedBooks,
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching books by major:", error);
        setErrorM("Failed to load books for this major.");
        // Try fallback with genre-based recommendations
        try {
          const fallbackResponse = await fetch(
            `${API_BASE}/api/recommendations/by-genre?genres=${encodeURIComponent(
              major
            )}&limit=20`
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.success && fallbackData.books) {
              setDataM({
                books: fallbackData.books,
                total_books: fallbackData.books.length,
                page: 1,
                per_page: 20,
              });
              setErrorM(null);
            }
          }
        } catch (fallbackError) {
          console.error("Major fallback failed:", fallbackError);
        }
      } finally {
        setLoadingM(false);
      }
    };

    fetchByMajor();
  }, [activeTab, major, pageM]);

  const totalPagesT = useMemo(() => {
    if (!dataT) return 1;
    return Math.max(1, Math.ceil(dataT.total_books / (dataT.per_page || 20)));
  }, [dataT]);

  const totalPagesM = useMemo(() => {
    if (!dataM) return 1;
    return Math.max(1, Math.ceil(dataM.total_books / (dataM.per_page || 20)));
  }, [dataM]);

  const getActiveData = () => {
    switch (activeTab) {
      case "personalized":
        return {
          books: dataP?.books ?? [],
          loading: loadingP,
          error: errorP,
        };
      case "trending":
        return {
          books: dataT?.books ?? [],
          loading: loadingT,
          error: errorT,
        };
      case "major":
        return {
          books: dataM?.books ?? [],
          loading: loadingM,
          error: errorM,
        };
      default:
        return { books: [], loading: false, error: null };
    }
  };

  const { books, loading, error } = getActiveData();

  return (
    <main className="page-content">
      <div className="container">
        <header className="section-header">
          <h1 className="section-title">
            {isLoggedIn ? "Your Recommendations" : "Recommended Books"}
          </h1>
          {isLoggedIn && userId && (
            <div
              className="user-stats"
              style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}
            >
              <p>
                Interactions: {userInteractionCount} | Algorithm:{" "}
                {dataP?.algorithm_used || dataP?.algorithm || "Loading..."}
              </p>
              {dataP?.algorithm_breakdown && (
                <p style={{ fontSize: "0.8rem" }}>
                  Collaborative: {dataP.algorithm_breakdown.collaborative},
                  Content-based: {dataP.algorithm_breakdown.content_based},
                  Trending: {dataP.algorithm_breakdown.trending}
                </p>
              )}
              {userGenrePrefs.length > 0 && (
                <p style={{ fontSize: "0.8rem" }}>
                  Top genres:{" "}
                  {userGenrePrefs
                    .slice(0, 3)
                    .map((g) => g.genre)
                    .join(", ")}
                </p>
              )}
            </div>
          )}
        </header>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "personalized" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("personalized")}
          >
            {isLoggedIn ? "For You" : "Recommended"}
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "trending" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("trending")}
          >
            Trending
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "major" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("major")}
          >
            By Major
          </button>
        </div>

        {/* Tab Controls */}
        {activeTab === "trending" && (
          <div className={styles.controls}>
            <label className={styles.label}>Period:</label>
            <select
              className={styles.select}
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
        )}

        {activeTab === "major" && (
          <div className={styles.controls}>
            <label className={styles.label}>Major:</label>
            <select
              className={styles.select}
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
            <div className={styles.loading}>
              <p>Loading recommendations...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No books found.</p>
              {activeTab === "personalized" && !isLoggedIn && (
                <p>
                  Please log in to see personalized recommendations based on
                  your reading history.
                </p>
              )}
              {activeTab === "personalized" && isLoggedIn && !userId && (
                <p>
                  User ID is missing. Please log out and log back in to refresh
                  your session.
                </p>
              )}
              {activeTab === "personalized" &&
                isLoggedIn &&
                userId &&
                userInteractionCount === 0 && (
                  <p>
                    Start clicking on books you're interested in to get
                    personalized recommendations! The more you interact, the
                    better our suggestions become.
                  </p>
                )}
              {activeTab === "personalized" &&
                isLoggedIn &&
                userId &&
                userInteractionCount > 0 && (
                  <p>
                    Try selecting your interests in your profile to get
                    personalized recommendations.
                  </p>
                )}
            </div>
          ) : (
            <>
              <div className="results-grid">
                {books.map((b: Book) => (
                  <Link
                    key={b.id}
                    href={`/book/${b.id}`}
                    className="book-card is-visible"
                    onClick={() => handleBookClick(b)}
                  >
                    <img
                      src={toHttps(b.coverurl) || placeholder(b.title)}
                      alt={b.title}
                      className="book-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = placeholder(
                          b.title
                        );
                      }}
                    />
                    <p className="book-title">{b.title}</p>
                    <p className="book-author">{b.author}</p>
                    {b.rating && !isNaN(Number(b.rating)) && (
                      <p className="book-rating">
                        ⭐ {Number(b.rating).toFixed(1)}
                      </p>
                    )}
                    {b.recommendation_type && (
                      <p
                        className="recommendation-type"
                        style={{
                          fontSize: "0.75rem",
                          color: "#888",
                          marginTop: "4px",
                        }}
                      >
                        {b.recommendation_type === "collaborative" &&
                          "👥 Similar users liked"}
                        {b.recommendation_type === "content_based" &&
                          "🎯 Based on your interests"}
                        {b.recommendation_type === "trending" &&
                          "🔥 Trending now"}
                        {![
                          "collaborative",
                          "content_based",
                          "trending",
                        ].includes(b.recommendation_type) &&
                          `📚 ${b.recommendation_type}`}
                      </p>
                    )}
                  </Link>
                ))}
              </div>

              {/* Pagination for trending and major tabs */}
              {(activeTab === "trending" || activeTab === "major") && (
                <div className={styles.pagination}>
                  <button
                    disabled={
                      activeTab === "trending" ? pageT <= 1 : pageM <= 1
                    }
                    onClick={() => {
                      if (activeTab === "trending") {
                        setPageT(Math.max(1, pageT - 1));
                      } else {
                        setPageM(Math.max(1, pageM - 1));
                      }
                    }}
                  >
                    Previous
                  </button>

                  <span>
                    Page {activeTab === "trending" ? pageT : pageM} of{" "}
                    {activeTab === "trending" ? totalPagesT : totalPagesM}
                  </span>

                  <button
                    disabled={
                      activeTab === "trending"
                        ? pageT >= totalPagesT
                        : pageM >= totalPagesM
                    }
                    onClick={() => {
                      if (activeTab === "trending") {
                        setPageT(Math.min(totalPagesT, pageT + 1));
                      } else {
                        setPageM(Math.min(totalPagesM, pageM + 1));
                      }
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
