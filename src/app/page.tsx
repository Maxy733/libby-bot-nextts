// src/app/page.tsx (generic homepage for visitors)
"use client";
import { useUser } from "@clerk/nextjs";
import HomeContent from "./components/HomeContent";

export default function PublicHomePage() {
  const { isSignedIn } = useUser();

  return <HomeContent showJoinUs={!isSignedIn} personalized={false} />;
}