"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Favorites.module.css";
import Link from "next/link";

type Book = {
  id: number;
  title: string;
  author?: string | null;
  coverurl?: string | null;
  rating?: number | null;
};
type ApiBook = {
  book_id?: number;
  id?: number;
  title: string;
  author?: string | null;
  cover_image_url?: string | null;
  coverurl?: string | null;
  rating?: number | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  // Redirect if not logged-in
  useEffect(() => {
    if (!token) {
      router.push("/login?next=/favorites");
    }
  }, [router, token]);

  useEffect(() => {
    if (!token) return;

    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);

      // 1) Try backend endpoint
      try {
        const res = await fetch(`${API_BASE}/api/user/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data: Book[] = await res.json();
          setBooks(data || []);
          setLoading(false);
          return;
        }
      } catch {
        /* fall back to localStorage */
      }

      // 2) Fallback: pull fav IDs from localStorage and hydrate via /api/books/:id
      try {
        const raw = localStorage.getItem("favorites") || "[]";
        const ids: number[] = JSON.parse(raw);
        if (!ids.length) {
          setBooks([]);
          setLoading(false);
          return;
        }

        const chunks = ids.map((id) =>
          fetch(`${API_BASE}/api/books/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).then((r) => (r.ok ? r.json() : null))
        );
        const results = await Promise.all(chunks);
        const cleaned: Book[] = results
          .filter((b: ApiBook | null) => b && (b.book_id ?? b.id) !== undefined)
          .map((b: ApiBook) => ({
            id: (b.book_id ?? b.id) as number,
            title: b.title,
            author: b.author ?? null,
            coverurl: b.cover_image_url ?? b.coverurl ?? null,
            rating: b.rating ?? null,
          }));
        setBooks(cleaned);
      } catch {
        setError("Failed to load favorites. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  //const openBook = (id: number) => router.push(`/book/${id}`);

  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.headerRow}>
          <h1 className={styles.title}>Your Favorites</h1>
          <p className={styles.subtitle}>Books you’ve saved for later</p>
        </header>

        <section className={styles.section}>
          {loading && <div className={styles.loading}>Loading…</div>}
          {error && <div className={styles.error}>{error}</div>}

          {!loading && !error && books.length === 0 && (
            <div className={styles.empty}>
              You haven’t added any favorites yet.
              <br />
              <a className="see-more-link" href="/discover">
                Browse books →
              </a>
            </div>
          )}

          {!loading && !error && books.length > 0 && (
            <div className="results-grid">
              {books.map((b) => (
                <Link
                  key={b.id}
                  href={`/book/${b.id}`}
                  className="book-card is-visible"
                  aria-label={`Open ${b.title}`}
                >
                  <img
                    className="book-cover"
                    src={b.coverurl || "/placeholder-cover.png"}
                    alt={b.title}
                  />
                  <div className="book-title">{b.title}</div>
                  <div className="book-author">{b.author || "Unknown"}</div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
