"use client";

import React, { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import InterestsOverlay from "@/app/components/InterestsOverlay";

type UserMetadata = {
  interestsCompleted?: boolean;
};

export default function OnboardingGate() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Determine if user needs onboarding
  const needsOnboarding = useMemo(() => {
    if (!isLoaded) return false;
    if (!isSignedIn || !user) return false;

    // Check metadata with proper typing
    return (user.unsafeMetadata as UserMetadata)?.interestsCompleted !== true;
  }, [isLoaded, isSignedIn, user]);

  if (!needsOnboarding) return null;

  return <InterestsOverlay />;
}
