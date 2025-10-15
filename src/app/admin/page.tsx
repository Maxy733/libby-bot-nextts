import AdminClient from "./adminClient";
import styles from "./Admin.module.css";
import { clerkClient } from "@clerk/nextjs/server";

export default async function AdminPage() {
  // const res = await fetch("/api/admin/overview", { cache: "no-store" });
  // const data = await res.json();
  const client = await clerkClient();
  const users = await client.users.getUserList({ limit: 500 });
  const totalUsers = users.totalCount ?? users.data.length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newSignupsWeek = users.data.filter(
    (u) => new Date(u.createdAt) >= weekAgo
  ).length;

  const userStats = {
    totalUsers,
    newSignupsWeek,
    recommendationsCount: 101,
  };

  return (
    <div className={styles.pageWrapper}>
      <AdminClient userStats={userStats} />
    </div>
  );
}