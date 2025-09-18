// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomeContent from "../components/HomeContent";

export default async function DashboardPage() {
  // `auth()` returns synchronously, no need for await
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in"); // send unauthenticated users to login
  }

  return <HomeContent showJoinUs={false} personalized={true} />;
}
