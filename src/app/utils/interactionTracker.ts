import { get } from "http";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export interface InteractionData {
  user_id: string;
  book_id: number;
  type: "click" | "view" | "wishlist_add" | "like" | "rate";
  rating?: number;
}

export const trackUserInteraction = async (interaction: InteractionData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/recommendations/interactions/click`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(interaction),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("Interaction tracked:", result.message);
      return result;
    } else {
      console.warn("Failed to track interaction:", result.error);
      return null;
    }
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

    // Try the improved recommendations endpoint first
    const response = await fetch(
      `${API_BASE}/api/recommendations/${userId}/improved?limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.books && result.books.length > 0) {
        return result;
      }
    }

    // Fallback to hybrid approach
    const hybridResponse = await fetch(
      `${API_BASE}/api/recommendations/${userId}/hybrid?limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (hybridResponse.ok) {
      const hybridResult = await hybridResponse.json();
      if (
        hybridResult.success &&
        hybridResult.books &&
        hybridResult.books.length > 0
      ) {
        return hybridResult;
      }
    }

    // Final fallback to enhanced recommendations
    const enhancedResponse = await fetch(
      `${API_BASE}/api/recommendations/${userId}/enhanced?limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (enhancedResponse.ok) {
      const enhancedResult = await enhancedResponse.json();
      return enhancedResult;
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
