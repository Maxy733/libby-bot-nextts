// src/app/dashboard/page.tsx (personalized for logged-in users)
// src/app/dashboard/page.tsx (personalized for logged-in users)
"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HomeContent from "../components/HomeContent";

// Optional: Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load, then check if user is signed in
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in"); // Redirect to sign-in page
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while auth is loading
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  // If not signed in, show nothing (redirect will happen)
  if (!isSignedIn) {
    return null;
  }

  // User is authenticated, show the dashboard
  return <HomeContent showJoinUs={false} personalized={true} />;
}
