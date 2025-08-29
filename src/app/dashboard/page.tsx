// src/app/dashboard/page.tsx (personalized for logged-in users)
"use client";
import HomeContent from "../components/HomeContent";

export default function DashboardPage() {
  return <HomeContent showJoinUs={false} personalized={true} />;
}