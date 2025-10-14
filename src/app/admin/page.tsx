import AdminClient from "./adminClient";
import styles from "./Admin.module.css";

export default async function AdminPage() {
  const res = await fetch("/api/admin/overview", { cache: "no-store" });
  const data = await res.json();

  const userStats = {
    totalUsers: data.total_users,
    newSignupsWeek: data.new_signups_week,
    recommendationsCount: data.active_recommendations,
  };

  return (
    <div className={styles.pageWrapper}>
      <AdminClient userStats={userStats} />
    </div>
  );
}