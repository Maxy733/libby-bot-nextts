

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const completed = user.unsafeMetadata?.interestsCompleted;
      if (completed) router.push("/dashboard");
      else router.push("/onboarding/interests");
    }
  }, [isLoaded, user, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0f1a2a] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Libby 📚</h1>
        <p className="text-lg">Getting your reading journey started...</p>
      </div>
    </div>
  );
}