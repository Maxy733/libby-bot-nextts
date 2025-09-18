// src/app/dashboard/page.tsx (personalized for logged-in users)
import {auth} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomeContent from "../components/HomeContent";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) { 
    redirect("/sign-in");
  }
  return <HomeContent showJoinUs={false} personalized={true} />;
}