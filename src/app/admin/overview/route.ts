// src/app/api/admin/overview/route.ts
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get total users from Clerk
    const client = await clerkClient();
    const { totalCount } = await client.users.getUserList({ limit: 1 });

    // Calculate signups this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data } = await client.users.getUserList({ limit: 100 });
    const newSignupsWeek = data.filter(
      (u) => new Date(u.createdAt) > oneWeekAgo
    ).length;

    return NextResponse.json({
      total_users: totalCount,
      new_signups_week: newSignupsWeek,
    });
  } catch (error) {
    console.error("Error in admin overview:", error);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}