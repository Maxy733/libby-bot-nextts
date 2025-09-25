// prefer NEXT_PUBLIC_API_BASE for clarity, fall back to older NEXT_PUBLIC_API_URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

export interface InteractionData {
  user_id: string;
  book_id: number;
  type: "click" | "view" | "wishlist_add" | "like" | "rate";
  rating?: number;
}

export const trackUserInteraction = async (interaction: InteractionData) => {
  try {
    const token = localStorage.getItem("token");

    // normalize fields and send to the unified interactions endpoint
    const { user_id, book_id, type, rating } = interaction;

    const response = await fetch(
      `${API_BASE}/api/recommendations/interactions/click`,
      {
        method: "POST",
        // avoid sending cookies (simplest for CORS) while still allowing
        // Authorization via token if present in localStorage
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          clerk_user_id: user_id, // renamed per API contract
          book_id,
          interaction_type: type, // renamed per API contract
          ...(rating !== undefined && { rating }),
        }),
      }
    );

    // return parsed response when available
    if (
      response &&
      response.headers.get("content-type")?.includes("application/json")
    ) {
      const result = await response.json();
      if (result && result.success) {
        console.log("Interaction tracked:", result.message ?? result);
        return result;
      }
      // if API returns non-success, still return the parsed body for callers to inspect
      return result;
    }

    return null;
  } catch (error) {
    console.error("Error tracking interaction:", error);
    return null;
  }
};

// Enhanced recommendation fetching with interaction-based algorithms
export const getPersonalizedRecommendations = async (
  userId: string,
  limit: number = 20
) => {
  try {
    const token = localStorage.getItem("token");

    // Primary: improved recommendations (DB-driven, labeled for UI)
    const primaryUrl = `${API_BASE}/api/recommendations/${userId}/improve?limit=${limit}`;
    try {
      const response = await fetch(primaryUrl, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const json = await response.json();
        const rawBooks = Array.isArray(json?.books) ? json.books : [];

        return {
          success: true,
          books: rawBooks.map((b: any) => ({
            id: Number(b.id ?? b.book_id),
            title: b.title ?? "",
            author: b.author ?? b.authors ?? "",
            rating: b.rating ?? null,
            genre: b.genre ?? null,
            coverurl:
              b.coverurl ||
              b.cover_image_url ||
              b.image_url ||
              b.thumbnail ||
              null,
          })),
          algorithm_used:
            json.algorithm_used ||
            json.algorithm ||
            json.algorithmUsed ||
            "Enhanced",
          algorithm_breakdown: json.algorithm_breakdown,
          confidence_score: json.confidence_score ?? json.confidence ?? 0,
          reasons: json.reasons || [],
          total_count: json.total_count ?? rawBooks.length,
          user_interactions_count:
            json.interaction_count ?? json.interactionCount ?? undefined,
        };
      }
    } catch (err) {
      console.warn(
        "Enhanced recommendations endpoint failed, falling back:",
        err
      );
    }

    // Fallbacks: improved, hybrid, then generic enhanced URL
    const fallbacks = [
      `${API_BASE}/api/recommendations/${userId}/improve?limit=${limit}`,
      `${API_BASE}/api/recommendations/${userId}/hybrid?limit=${limit}`,
      `${API_BASE}/api/recommendations/${userId}/enhanced?limit=${limit}`,
    ];

    for (const url of fallbacks) {
      try {
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          } as HeadersInit,
        });
        if (!res.ok) continue;
        const json = await res.json();
        const rawBooks = Array.isArray(json?.books) ? json.books : [];
        return {
          success: true,
          books: rawBooks.map((b: any) => ({
            id: Number(b.id ?? b.book_id),
            title: b.title ?? "",
            author: b.author ?? b.authors ?? "",
            rating: b.rating ?? null,
            genre: b.genre ?? null,
            coverurl:
              b.coverurl ||
              b.cover_image_url ||
              b.image_url ||
              b.thumbnail ||
              null,
          })),
          algorithm_used:
            json.algorithm_used ||
            json.algorithm ||
            json.algorithmUsed ||
            "Fallback",
          algorithm_breakdown: json.algorithm_breakdown,
          confidence_score: json.confidence_score ?? json.confidence ?? 0,
          reasons: json.reasons || [],
          total_count: json.total_count ?? rawBooks.length,
        };
      } catch (err) {
        console.warn(`Fallback ${url} failed:`, err);
        continue;
      }
    }

    throw new Error("All recommendation endpoints failed");
  } catch (error) {
    console.error("Error fetching personalized recommendations:", error);
    return {
      success: false,
      books: [],
      error: getErrorMessage(error),
    };
  }
};

// Get user's interaction history
export const getUserInteractionHistory = async (
  userId: string,
  limit: number = 50
) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/recommendations/${userId}/history?limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (response.ok) {
      return await response.json();
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error("Error fetching interaction history:", error);
    return {
      success: false,
      interactions: [],
      error: getErrorMessage(error),
    };
  }
};

// Get user's genre preferences based on interactions
export const getUserGenrePreferences = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/recommendations/${userId}/genre-preferences`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (response.ok) {
      return await response.json();
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error("Error fetching genre preferences:", error);
    return {
      success: false,
      genre_preferences: [],
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Rate a book
export const rateBook = async (
  userId: string,
  bookId: number,
  rating: number
) => {
  return await trackUserInteraction({
    user_id: userId,
    book_id: bookId,
    type: "rate",
    rating: rating,
  });
};

// Add to wishlist with tracking
export const addToWishlistWithTracking = async (
  userId: string,
  bookId: number
) => {
  return await trackUserInteraction({
    user_id: userId,
    book_id: bookId,
    type: "wishlist_add",
  });
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}
