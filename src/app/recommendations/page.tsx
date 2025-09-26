"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import styles from "./Recommendations.module.css";
import BookCard from "../components/BookCard";
import { Book } from "../../types/book";

type RecommendedBook = Book & {
  recommendation_type?: string;
};

// Import the interaction tracking utilities
import {
  trackUserInteraction,
  getPersonalizedRecommendations,
  getUserInteractionHistory,
  getUserGenrePreferences,
} from "../utils/interactionTracker";

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

const normalizeBooks = (raw: any[]): Book[] =>
  raw
    .map((b: any) => ({
      id: Number(b.id ?? b.book_id),
      title: b.title ?? "",
      author: b.author ?? b.authors ?? "",
      rating: b.rating ?? null,
      genre: b.genre ?? null,
      year: b.year
        ?? (b.publication_date ? new Date(b.publication_date).getFullYear().toString() : null)
        ?? "Unknown",
      coverurl: toHttps(
        b.coverurl ||
          b.cover_image_url ||
          b.image_url ||
          b.thumbnail ||
          null
      )as string || null,
      description: b.description ?? "",
      publication_date: b.publication_date ?? null,
      pages: b.pages ?? null,
      language: b.language ?? null,
      isbn: b.isbn ?? null,
    }))
    .filter((b: Book) => Number.isFinite(b.id) && b.title.trim());

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Initialize state from query params (with fallback defaults)
  function getTabFromQuery() {
    const tab = searchParams?.get("tab");
    if (tab === "trending" || tab === "major" || tab === "personalized") return tab as Tab;
    return "personalized";
  }
  function getPeriodFromQuery() {
    const p = searchParams?.get("period");
    return TRENDING_PERIODS.some((tp) => tp.value === p) ? p! : "5years";
  }
  function getMajorFromQuery() {
    const m = searchParams?.get("major");
    return MAJORS.includes(m || "") ? m! : DEFAULT_MAJOR;
  }
  function getPageFromQuery(param: string, fallback: number) {
    const v = Number(searchParams?.get(param));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  }

  const [activeTab, setActiveTab] = useState<Tab>(getTabFromQuery());
  // Personalized state
  const [loadingP, setLoadingP] = useState(false);
  const [errorP, setErrorP] = useState<string | null>(null);
  const [dataP, setDataP] = useState<PersonalizedRecommendationResp | null>(null);

  // Trending state
  const [period, setPeriod] = useState(getPeriodFromQuery());
  const [pageT, setPageT] = useState(getPageFromQuery("pageT", 1));
  const [loadingT, setLoadingT] = useState(false);
  const [errorT, setErrorT] = useState<string | null>(null);
  const [dataT, setDataT] = useState<ApiTrendingResp | null>(null);

  // Major state
  const [major, setMajor] = useState(getMajorFromQuery());
  const [pageM, setPageM] = useState(getPageFromQuery("pageM", 1));
  const [loadingM, setLoadingM] = useState(false);
  const [errorM, setErrorM] = useState<string | null>(null);
  const [dataM, setDataM] = useState<ApiTrendingResp | null>(null);

  // Sync state with query params on navigation (popstate, etc.)
  useEffect(() => {
    // Only update state if query params changed (avoiding loops)
    const tabQ = getTabFromQuery();
    if (tabQ !== activeTab) setActiveTab(tabQ);
    const periodQ = getPeriodFromQuery();
    if (periodQ !== period) setPeriod(periodQ);
    const majorQ = getMajorFromQuery();
    if (majorQ !== major) setMajor(majorQ);
    const pageTQ = getPageFromQuery("pageT", 1);
    if (pageTQ !== pageT) setPageT(pageTQ);
    const pageMQ = getPageFromQuery("pageM", 1);
    if (pageMQ !== pageM) setPageM(pageMQ);
    // eslint-disable-next-line
    // We intentionally want to run on searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    const ac = new AbortController();

    const fetchPersonalized = async () => {
      // avoid calling the endpoint with a null/undefined userId
      if (!userId) return;
      setLoadingP(true);
      setErrorP(null);

      try {
        console.log(
          `Fetching personalized recommendations (improve) for user: ${userId}`
        );
        const url = `${API_BASE}/api/recommendations/${encodeURIComponent(
          userId!
        )}/improve?limit=20`;

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          cache: "no-store",
          signal: ac.signal,
        });

        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json?.books)
            ? json.books
            : Array.isArray(json?.recommendations)
            ? json.recommendations
            : [];

          const books = normalizeBooks(items);

          if (books.length > 0) {
            // Prefer counts from the API response
            const ic = Number(
              json?.interaction_count ??
                json?.interactionCount ??
                userInteractionCount
            );

            setUserInteractionCount(ic);
            setDataP({
              success: true,
              books: books as Book[],
              algorithm_used:
                json?.algorithm_used ?? json?.algorithmUsed ?? "Personalized",
              algorithm_breakdown: undefined, // /improve doesn’t return contributions by default
              confidence_score: json?.confidence_score ?? 0.8,
              reasons: json?.reasons ?? [
                "Based on your interactions and preferences",
              ],
              total_count: books.length,
              user_interactions_count: ic,
            });

            console.log(
              `Loaded ${books.length} personalized books using: ${
                json?.algorithm_used ?? json?.algorithmUsed
              }`
            );
            return;
          }
        }

        // If /improve returned non-200 or no books, fall back to your existing util
        throw new Error(
          `Improve endpoint returned ${res.status} with ${await res
            .text()
            .catch(() => "<no body>")}`
        );
      } catch (error) {
        // If the request was aborted, silently stop
        if ((error as any)?.name === "AbortError") return;
        console.warn(
          "Improve endpoint failed; falling back to getPersonalizedRecommendations:",
          error
        );
        try {
          const result = await getPersonalizedRecommendations(userId!, 30);
          if (result?.success && result?.books?.length) {
            const legacyBooks = normalizeBooks(result.books) as Book[];
            setDataP({
              success: true,
              books: legacyBooks,
              algorithm_used:
                result.algorithm_used ??
                (result as any).algorithm ??
                (result as any).algorithmUsed ??
                "Personalized (Legacy)",
              algorithm_breakdown: result.algorithm_breakdown,
              confidence_score:
                result.confidence_score ?? (result as any).confidence ?? 0.7,
              reasons: result.reasons || ["Legacy personalized endpoint"],
              total_count: legacyBooks.length,
              user_interactions_count:
                result.user_interactions_count ?? userInteractionCount,
            });
            return;
          }
          throw new Error("Legacy util returned no books");
        } catch (err2) {
          console.error("All personalized endpoints failed:", err2);
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
        setLoadingP(false);
      }
    };

    fetchPersonalized();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [userId, activeTab]);

  // Fetch trending books
  useEffect(() => {
    if (activeTab !== "trending") return;

    const fetchTrending = async () => {
      setLoadingT(true);
      setErrorT(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/books/recommendations/globally-trending?period=${period}&page=${pageT}&per_page=30`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawBooks = data.books || [];

        if (rawBooks.length === 0) {
          throw new Error("No trending books returned");
        }

        const normalizedBooks = normalizeBooks(rawBooks);

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
          const rawBooks = data.books || [];

          const normalizedBooks = normalizeBooks(rawBooks);

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
              const normalizedBooks = normalizeBooks(fallbackData.books); // ✅ normalize here
              setDataM({
                books: normalizedBooks,
                total_books: normalizedBooks.length,
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

  // Helper: update the URL query string with relevant params
  function updateQueryString(params: Record<string, any>) {
    const url = new URL(window.location.href);
    // Remove all params, then add only relevant ones
    url.search = "";
    if (params.tab) url.searchParams.set("tab", params.tab);
    if (params.tab === "trending") {
      url.searchParams.set("period", params.period || period);
      url.searchParams.set("pageT", String(params.pageT || 1));
    }
    if (params.tab === "major") {
      url.searchParams.set("major", params.major || major);
      url.searchParams.set("pageM", String(params.pageM || 1));
    }
    router.push(url.pathname + url.search);
  }

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
            onClick={() => {
              setActiveTab("personalized");
              updateQueryString({ tab: "personalized" });
            }}
          >
            {isLoggedIn ? "For You" : "Recommended"}
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "trending" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveTab("trending");
              // When switching to trending, preserve period, reset pageT
              updateQueryString({ tab: "trending", period, pageT: 1 });
            }}
          >
            Trending
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "major" ? styles.active : ""
            }`}
            onClick={() => {
              setActiveTab("major");
              updateQueryString({ tab: "major", major, pageM: 1 });
            }}
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
                updateQueryString({ tab: "trending", period: e.target.value, pageT: 1 });
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
                updateQueryString({ tab: "major", major: e.target.value, pageM: 1 });
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
            <div
              className={styles.loading}
              style={{
                minHeight: 200,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="https://i.pinimg.com/originals/73/69/6e/73696e022df7cd5cb3d999c6875361dd.gif"
                alt="Loading recommendations"
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 9999,
                  width: 200,
                  height: 200,
                  objectFit: "contain",
                  background: "transparent",
                  boxShadow: "none",
                  border: "none",
                }}
              />
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
                {books.map((b: RecommendedBook) => (
                  <div key={b.id} className="book-card is-visible">
                    <BookCard
                      book={{
                        ...b,
                        coverurl: toHttps(b.coverurl) ?? null, // normalize
                      }}
                      showWishlist={true}
                    />
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
                  </div>
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
                        const newPage = Math.max(1, pageT - 1);
                        setPageT(newPage);
                        updateQueryString({ tab: "trending", period, pageT: newPage });
                      } else {
                        const newPage = Math.max(1, pageM - 1);
                        setPageM(newPage);
                        updateQueryString({ tab: "major", major, pageM: newPage });
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
                        const newPage = Math.min(totalPagesT, pageT + 1);
                        setPageT(newPage);
                        updateQueryString({ tab: "trending", period, pageT: newPage });
                      } else {
                        const newPage = Math.min(totalPagesM, pageM + 1);
                        setPageM(newPage);
                        updateQueryString({ tab: "major", major, pageM: newPage });
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

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<div>Loading recommendations...</div>}>
      <RecommendationsContent />
    </Suspense>
  );
}
import { Suspense } from "react";