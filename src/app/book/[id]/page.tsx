// src/app/book/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Hook to get URL parameters
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import styles from "./Book.module.css";
import WishlistButton from "@/app/components/WishlistButton";
import { Book } from "../../../types/book";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

type UserRating = {
  rating_id: number;
  user_id: number;
  book_id: number;
  rating: number;
  review_text: string | null;
  create_at: string; // Note: backend uses create_at (not created_at)
  updated_at?: string;
  clerk_user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_verified?: boolean;
};

type RatingStats = {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    [key: string]: number;
  };
};

// --- Main Book Details Page Component ---
export default function BookDetailsPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Clerk authentication
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  // Rating state
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>("");
  const [existingRating, setExistingRating] = useState<UserRating | null>(null);
  const [savingRating, setSavingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // All ratings state
  const [allRatings, setAllRatings] = useState<UserRating[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loadingRatings, setLoadingRatings] = useState(false);

  const params = useParams(); // Get the dynamic parameters from the URL
  const { id } = params; // Extract the 'id' part

  // Helper function to ensure HTTPS URLs
  const toHttps = (url: string | null): string | null => {
    if (!url) return null;
    return url.replace(/^http:\/\//i, "https://");
  };

  // Fetch book details
  useEffect(() => {
    if (id) {
      fetch(`${API_BASE}/api/books/books/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Book not found");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Book data received:", data);
          console.log("Cover image URL:", data.cover_image_url);

          const normalized: Book = {
            id: Number(data.book_id),
            title: data.title,
            author: data.author,
            genre: data.genre,
            description: data.description,
            coverurl: toHttps(data.cover_image_url || data.coverurl || null),
            rating: data.rating !== null ? Number(data.rating) : null,
            publication_date: data.publication_date,
            pages: data.pages,
            language: data.language,
            isbn: data.isbn,
          };

          console.log("Normalized book:", normalized);
          console.log("Final cover URL:", normalized.coverurl);

          setBook(normalized);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching book details:", err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  // Fetch all ratings for this book
  useEffect(() => {
    if (id) {
      fetchAllRatings();
      fetchRatingStats();
    }
  }, [id]);

  // Fetch user's existing rating
  useEffect(() => {
    if (id && user?.id && userLoaded) {
      fetchUserRating();
    }
  }, [id, user?.id, userLoaded]);

  const fetchAllRatings = async () => {
    if (!id) return;

    setLoadingRatings(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/books/ratings/${id}?limit=50`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("=== RATINGS API DEBUG ===");
        console.log("Full API Response:", JSON.stringify(data, null, 2));
        if (data.success && data.ratings) {
          console.log(
            "First rating object:",
            JSON.stringify(data.ratings[0], null, 2)
          );
          console.log("first_name:", data.ratings[0]?.first_name);
          console.log("last_name:", data.ratings[0]?.last_name);
          console.log("Email:", data.ratings[0]?.email);
          console.log("create_at value:", data.ratings[0]?.create_at);
          console.log("create_at type:", typeof data.ratings[0]?.create_at);
          setAllRatings(data.ratings);
        }
      }
    } catch (error) {
      console.error("Error fetching all ratings:", error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const fetchRatingStats = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE}/api/books/ratings/${id}/stats`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setRatingStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error);
    }
  };

  const fetchUserRating = async () => {
    if (!user?.id || !id) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `${API_BASE}/api/books/ratings/user/${user.id}/book/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.has_rating && data.rating) {
          setExistingRating(data.rating);
          setUserRating(data.rating.rating);
          setUserReview(data.rating.review_text || "");
        }
      }
    } catch (error) {
      console.error("Error fetching user rating:", error);
    }
  };

  const handleSubmitRating = async () => {
    if (!user?.id || !id) {
      setRatingMessage("Please sign in to rate this book");
      return;
    }

    if (userRating === 0) {
      setRatingMessage("Please select a rating");
      return;
    }

    setSavingRating(true);
    setRatingMessage(null);

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/api/books/ratings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerk_user_id: user.id,
          book_id: Number(id),
          rating: userRating,
          review_text: userReview.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExistingRating(data.rating);
        setRatingMessage(
          existingRating
            ? "Rating updated successfully!"
            : "Rating submitted successfully!"
        );
        setShowRatingForm(false);

        await fetchAllRatings();
        await fetchRatingStats();

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json();
        setRatingMessage(errorData.error || "Failed to save rating");
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      setRatingMessage("Failed to save rating. Please try again.");
    } finally {
      setSavingRating(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!user?.id || !id || !existingRating) return;

    if (!confirm("Are you sure you want to delete your rating?")) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `${API_BASE}/api/books/ratings/user/${user.id}/book/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setExistingRating(null);
        setUserRating(0);
        setUserReview("");
        setRatingMessage("Rating deleted successfully");

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setRatingMessage("Failed to delete rating");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      setRatingMessage("Failed to delete rating");
    }
  };

  return (
    <>
      <main className="container page-content">
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>

        {loading && <p className="loading-text">Loading book details...</p>}
        {error && <p className="error-text">Error: {error}</p>}

        {book && (
          <>
            <div className={styles.bookDetailsGrid}>
              <div className={styles.bookLeftColumn}>
                <div className="book-details-cover">
                  <img
                    src={
                      book.coverurl ||
                      `https://placehold.co/600x900/2F2F2F/FFFFFF?text=${encodeURIComponent(
                        book.title
                      )}`
                    }
                    alt={book.title}
                    onError={(e) => {
                      console.error("Image failed to load:", book.coverurl);
                      e.currentTarget.src = `https://placehold.co/600x900/2F2F2F/FFFFFF?text=${encodeURIComponent(
                        book.title
                      )}`;
                    }}
                  />
                </div>

                <div className="book-details-section">
                  <h2>Details</h2>
                  <ul>
                    <li>
                      <strong>ISBN:</strong> {book.isbn || "N/A"}
                    </li>
                    <li>
                      <strong>Language:</strong> {book.language || "N/A"}
                    </li>
                    <li>
                      <strong>Pages:</strong> {book.pages || "N/A"}
                    </li>
                    <li>
                      <strong>Publication Date:</strong>{" "}
                      {book.publication_date
                        ? new Date(book.publication_date).toLocaleDateString()
                        : "N/A"}
                    </li>
                    <li>
                      <strong>Rating:</strong>{" "}
                      {book.rating !== null ? book.rating.toFixed(1) : "N/A"}
                    </li>
                  </ul>
                </div>
              </div>

              <div className={styles.bookRightColumn}>
                <div className={styles.titleRow}>
                  <h1 className="book-details-title">{book.title}</h1>
                  <WishlistButton
                    book={{
                      id: book.id,
                      title: book.title,
                      author: book.author,
                      coverurl: book.coverurl || null,
                    }}
                    showText={false}
                    className={styles.cardWishlistBtn}
                  />
                </div>
                <p className="book-details-author">
                  by {book.author || "Unknown Author"}
                </p>
                {book.genre && (
                  <span className="book-details-genre">{book.genre}</span>
                )}

                <div className="book-details-section">
                  <h2>Summary</h2>
                  <p>{book.description || "No summary available."}</p>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            {userLoaded && (
              <div className={styles.ratingSection}>
                <h3>Rate This Book</h3>

                {!user ? (
                  <p className={styles.signInPrompt}>
                    Please <a href="/sign-in">sign in</a> to rate this book
                  </p>
                ) : existingRating && !showRatingForm ? (
                  <div className={styles.existingRating}>
                    <div className={styles.ratingDisplay}>
                      <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= existingRating.rating
                                ? styles.starFilled
                                : styles.starEmpty
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className={styles.ratingValue}>
                        {Number(existingRating.rating).toFixed(1)}
                      </span>
                    </div>
                    {existingRating.review_text && (
                      <div className={styles.reviewText}>
                        <strong>Your Review:</strong>
                        <p>{existingRating.review_text}</p>
                      </div>
                    )}
                    <div className={styles.ratingActions}>
                      <button
                        onClick={() => setShowRatingForm(true)}
                        className={styles.editButton}
                      >
                        Edit Rating
                      </button>
                      <button
                        onClick={handleDeleteRating}
                        className={styles.deleteButton}
                      >
                        Delete Rating
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.ratingForm}>
                    <div className={styles.starRating}>
                      <label>Your Rating:</label>
                      <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className={
                              star <= userRating
                                ? styles.starFilled
                                : styles.starEmpty
                            }
                            disabled={savingRating}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <span className={styles.ratingValue}>
                        {userRating > 0 ? `${userRating}.0` : "Select rating"}
                      </span>
                    </div>

                    <div className={styles.reviewInput}>
                      <label htmlFor="review">Your Review (optional):</label>
                      <textarea
                        id="review"
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                        placeholder="Share your thoughts about this book..."
                        rows={4}
                        maxLength={1000}
                        disabled={savingRating}
                        className={styles.textarea}
                      />
                      <span className={styles.charCount}>
                        {userReview.length}/1000
                      </span>
                    </div>

                    <div className={styles.formActions}>
                      <button
                        onClick={handleSubmitRating}
                        disabled={savingRating || userRating === 0}
                        className={styles.submitButton}
                      >
                        {savingRating
                          ? "Saving..."
                          : existingRating
                          ? "Update Rating"
                          : "Submit Rating"}
                      </button>
                      {existingRating && (
                        <button
                          onClick={() => {
                            setShowRatingForm(false);
                            setUserRating(existingRating.rating);
                            setUserReview(existingRating.review_text || "");
                          }}
                          className={styles.cancelButton}
                          disabled={savingRating}
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {ratingMessage && (
                      <div
                        className={
                          ratingMessage.includes("success")
                            ? styles.successMessage
                            : styles.errorMessage
                        }
                      >
                        {ratingMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* All Ratings & Reviews Section */}
            <div className={styles.allRatingsSection}>
              <div className={styles.ratingsHeader}>
                <h3>Ratings & Reviews</h3>
                {ratingStats && (
                  <div className={styles.statsOverview}>
                    <div className={styles.averageRating}>
                      <span className={styles.bigRating}>
                        {ratingStats.average_rating.toFixed(1)}
                      </span>
                      <div className={styles.starsSmall}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={
                              star <= Math.round(ratingStats.average_rating)
                                ? styles.starFilledSmall
                                : styles.starEmptySmall
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className={styles.totalCount}>
                        {ratingStats.total_ratings} rating
                        {ratingStats.total_ratings !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {loadingRatings && (
                <p className={styles.loadingText}>Loading reviews...</p>
              )}

              {!loadingRatings && allRatings.length === 0 && (
                <p className={styles.noReviews}>
                  No reviews yet. Be the first to review this book!
                </p>
              )}

              {!loadingRatings && allRatings.length > 0 && (
                <div className={styles.ratingsList}>
                  {allRatings.map((rating) => {
                    // Format date with error handling
                    const formatDate = (dateString: string) => {
                      try {
                        if (!dateString) return "Date unavailable";

                        // Handle different date formats
                        let date: Date;

                        // Try parsing as ISO string first
                        date = new Date(dateString);

                        // If invalid, try treating as timestamp string
                        if (isNaN(date.getTime())) {
                          const timestamp = Date.parse(dateString);
                          if (!isNaN(timestamp)) {
                            date = new Date(timestamp);
                          }
                        }

                        if (isNaN(date.getTime())) {
                          console.error("Invalid date:", dateString);
                          return "Date unavailable";
                        }

                        return date.toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      } catch (error) {
                        console.error(
                          "Date formatting error:",
                          error,
                          dateString
                        );
                        return "Date unavailable";
                      }
                    };

                    // Get user display name
                    const getUserDisplay = () => {
                      // Use first_name and last_name from backend
                      if (rating.first_name && rating.last_name) {
                        return `${rating.first_name} ${rating.last_name}`;
                      }
                      if (rating.first_name) return rating.first_name;
                      if (rating.last_name) return rating.last_name;
                      if (rating.email) return rating.email.split("@")[0];

                      // Fallback: if this is the current user's review
                      if (user && rating.clerk_user_id === user.id) {
                        // Show current user's name from Clerk
                        if (user.firstName && user.lastName) {
                          return `${user.firstName} ${user.lastName}`;
                        }
                        if (user.firstName) return user.firstName;
                        if (user.username) return user.username;
                        if (user.primaryEmailAddress?.emailAddress) {
                          return user.primaryEmailAddress.emailAddress.split(
                            "@"
                          )[0];
                        }
                      }

                      // Last resort: show "User" with short ID
                      if (rating.clerk_user_id) {
                        const shortId = rating.clerk_user_id.substring(
                          rating.clerk_user_id.length - 6
                        );
                        return `User ${shortId}`;
                      }

                      return "Anonymous User";
                    };
                    return (
                      <div key={rating.rating_id} className={styles.ratingItem}>
                        <div className={styles.ratingItemHeader}>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>
                              {getUserDisplay()}
                            </span>
                            <div className={styles.ratingItemStars}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= rating.rating
                                      ? styles.starFilledSmall
                                      : styles.starEmptySmall
                                  }
                                >
                                  ★
                                </span>
                              ))}
                              <span className={styles.ratingNumber}>
                                {Number(rating.rating).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <span className={styles.ratingDate}>
                            {formatDate(rating.create_at)}
                          </span>
                        </div>
                        {rating.review_text && (
                          <p className={styles.ratingItemReview}>
                            {rating.review_text}
                          </p>
                        )}
                        {existingRating &&
                          rating.rating_id === existingRating.rating_id && (
                            <span className={styles.yourReviewBadge}>
                              Your Review
                            </span>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.availabilitySection}>
              <h3>Availability</h3>
              <p>
                This book is available in the library. Please check the shelf or
                ask a librarian. To purchase, please kindly check the other
                links below.
              </p>
              <div className={styles.purchaseLinks}>
                <a
                  href="mailto:library@au.edu"
                  className={styles.bookStoreCard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.bookCardWrapper}>
                    <img
                      src="/gmail_icon.png"
                      alt="icon"
                      className={styles.bookCardImage}
                    />
                    <div className={styles.bookCardInfo}>
                      <h4>Library</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a
                  href="https://line.me/R/ti/p/@ist4769e"
                  className={styles.bookStoreCard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.bookCardWrapper}>
                    <img
                      src="/LINE_logo.svg.webp"
                      alt="icon"
                      className={styles.bookCardImage}
                    />
                    <div className={styles.bookCardInfo}>
                      <h4>LINE</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a
                  href={`https://www.amazon.com/s?k=${encodeURIComponent(
                    book.title
                  )}`}
                  className={styles.bookStoreCard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.bookCardWrapper}>
                    <img
                      src="/amazon-tile.svg"
                      alt="icon"
                      className={styles.bookCardImage}
                    />
                    <div className={styles.bookCardInfo}>
                      <h4>Amazon</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a
                  href={`https://www.bookdepository.com/search?searchTerm=${encodeURIComponent(
                    book.title
                  )}`}
                  className={styles.bookStoreCard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.bookCardWrapper}>
                    <img
                      src="https://placehold.co/100x150?text=Book"
                      alt="icon"
                      className={styles.bookCardImage}
                    />
                    <div className={styles.bookCardInfo}>
                      <h4>Book Depository</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
                <a
                  href={`https://books.google.com/books?vid=ISBN:${
                    book.isbn || ""
                  }`}
                  className={styles.bookStoreCard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.bookCardWrapper}>
                    <img
                      src="/google_bookslogo.webp"
                      alt="icon"
                      className={styles.bookCardImage}
                    />
                    <div className={styles.bookCardInfo}>
                      <h4>Google Books</h4>
                      <p>Check availability</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
