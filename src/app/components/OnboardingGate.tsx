"use client";

import React, { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import InterestsOverlay from "@/app/components/InterestsOverlay";

export default function OnboardingGate() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Determine if user needs onboarding
  const needsOnboarding = useMemo(() => {
    // Don't show anything while loading
    if (!isLoaded) return false;

    // Don't show for unsigned users
    if (!isSignedIn || !user) return false;

    // Show onboarding if user hasn't completed interests selection
    return (user.unsafeMetadata as any)?.interestsCompleted !== true;
  }, [isLoaded, isSignedIn, user]);

  // Don't render anything if onboarding isn't needed
  if (!needsOnboarding) return null;

  // Render the full-screen Spotify-style overlay
  return <InterestsOverlay />;
}
