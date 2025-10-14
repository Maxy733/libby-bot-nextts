"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import styles from "./Admin.module.css";
import BookCard from "../components/BookCard";
import { Book } from "../../types/book";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

interface UserStats {
  recommendationsCount: number;
  totalUsers?: number;
  newSignupsWeek?: number;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "recommendations" | "books" | "analytics" | "settings"
  >("dashboard");

  const [userStats, setUserStats] = useState<UserStats>({
    recommendationsCount: 0,
    totalUsers: 0,
    newSignupsWeek: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const validTabs = ["dashboard", "users", "recommendations", "books", "analytics", "settings"];
    const hash = window.location.hash.replace("#", "");
    if (validTabs.includes(hash)) {
      setActiveTab(hash as typeof activeTab);
    }
  }, []);

  useEffect(() => {
    const loadAdminOverview = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/overview`);
        if (!res.ok) throw new Error('Failed to load admin overview');
        const data = await res.json();
        setUserStats(prev => ({
          ...prev,
          totalUsers: data.total_users ?? 0,
          newSignupsWeek: data.new_signups_week ?? 0
        }));
      } catch (err) {
        console.error('Error fetching admin overview:', err);
      }
    };
    loadAdminOverview();
  }, []);

  if (!isLoaded) return <div className="loading-container">Loading...</div>;

  if (!user) {
    return (
      <div className="container page-content">
        <div className="auth-required">
          <h1>Sign In Required</h1>
          <p>Please sign in to view your profile.</p>
          <Link href="/sign-in" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.threeColumnLayout}>
      {/* Left Sidebar */}
      <div className={styles.leftColumn}>
        <div className={styles.settingsMenu}>
          <ul>
            {["dashboard", "users", "recommendations", "books", "analytics", "settings"].map(
              (tab) => (
                <li key={tab}>
                  <button
                    className={styles.tabBtn}
                    onClick={() => {
                      setActiveTab(tab as typeof activeTab);
                      window.location.hash = tab;
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Middle Content (Profile) */}
      <div className={styles.middleColumn}>
        <div className={styles.profileContainer}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.profileInfo}>
              <Image
                src={user.imageUrl}
                alt="Profile avatar"
                width={80}
                height={80}
                className={styles.profileAvatar}
              />
              <div>
                <h1 className={styles.profileName}>
                  {user.firstName} {user.lastName}
                </h1>
                <p className={styles.profileEmail}>
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Dashboard</h2>

              {userStats ? (
                <>
                  <div className={styles.overviewRow}>
                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>Total Users</div>
                      <div className={styles.overviewValue}>
                        {userStats?.totalUsers ?? 0}
                      </div>
                    </div>

                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>Books in Library</div>
                      <div className={styles.overviewValue}>
                        118,801
                      </div>
                    </div>

                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>Active Recommendations</div>
                      <div className={styles.overviewValue}>
                        {userStats.recommendationsCount}
                      </div>
                    </div>

                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>New Sign-up This Week</div>
                      <div className={styles.overviewValue}>
                          {userStats?.newSignupsWeek ?? 0}
                      </div>
                    </div>
                  </div>
                  {/* Recent Activity Log and System Status cards */}
                  <div className={styles.overviewRowLarge}>
                    <div className={styles.overviewItemLarge}>
                      <div className={styles.overviewLabel}>Recent Activity Log</div>
                      <ul className={styles.activityList}>
                        <li>User John added a new book to the library.</li>
                        <li>Recommendation engine refreshed at 12:30 PM.</li>
                        <li>New user Sarah signed up.</li>
                        <li>Database backup completed successfully.</li>
                      </ul>
                    </div>

                    <div className={styles.overviewItemLarge}>
                      <div className={styles.overviewLabel}>System Status</div>
                      <ul className={styles.statusList}>
                        <li><span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>Database</li>
                        <li><span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>API Services</li>
                        <li><span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>Server Load</li>
                        <li><span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>Cache</li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <p>Loading overview...</p>
              )}
            </div>
          )}

          {activeTab === "books" && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Book Management</h2>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN"
                  className={styles.searchBar}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.summaryRow}>
                <div>Total Books: 118,801</div>
                <div>Missing Metadata: 1,203</div>
              </div>
              <table className={styles.bookTable}>
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Year</th>
                    <th>Genre</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
                    <td>The Great Gatsby</td>
                    <td>F. Scott Fitzgerald</td>
                    <td>1925</td>
                    <td>Fiction</td>
                    <td>4.3</td>
                    <td>
                      <button className={styles.smallBtn}>Edit</button>
                      <button className={styles.dangerSmall}>Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
                    <td>1984</td>
                    <td>George Orwell</td>
                    <td>1949</td>
                    <td>Dystopian</td>
                    <td>4.5</td>
                    <td>
                      <button className={styles.smallBtn}>Edit</button>
                      <button className={styles.dangerSmall}>Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className={styles.addBookForm}>
                <h3>Add New Book</h3>
                <form>
                  <input type="text" placeholder="Title" required />
                  <input type="text" placeholder="Author" required />
                  <input type="text" placeholder="ISBN" />
                  <button type="submit" className={styles.primary}>Add Book</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Analytics Dashboard</h2>

              <div className={styles.analyticsRow}>
                <div className={styles.analyticsCard}>
                  <h3>User Growth (Last 6 Months)</h3>
                  <img src="/chart-users.png" alt="User growth chart" width="100%" />
                </div>

                <div className={styles.analyticsCard}>
                  <h3>Recommendation Activity</h3>
                  <img src="/chart-recommendations.png" alt="Recommendations chart" width="100%" />
                </div>
              </div>

              <div className={styles.analyticsRow}>
                <div className={styles.analyticsCard}>
                  <h3>Most Popular Genres</h3>
                  <img src="/chart-genres.png" alt="Genre chart" width="100%" />
                </div>

                <div className={styles.analyticsCard}>
                  <h3>Active Users (30 Days)</h3>
                  <img src="/chart-active-users.png" alt="Active users chart" width="100%" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>System Settings</h2>

              <form className={styles.settingsForm}>
                <div className={styles.formGroup}>
                  <label>Recommendation Weights</label>
                  <input type="number" placeholder="Content-based (35%)" />
                  <input type="number" placeholder="Collaborative (25%)" />
                  <input type="number" placeholder="Trending (20%)" />
                  <input type="number" placeholder="Author (15%)" />
                  <input type="number" placeholder="Diversity (5%)" />
                </div>

                <div className={styles.formGroup}>
                  <label>Cache Refresh Interval (minutes)</label>
                  <input type="number" placeholder="60" />
                </div>

                <div className={styles.formGroup}>
                  <label>Maintenance Mode</label>
                  <select>
                    <option>Off</option>
                    <option>On</option>
                  </select>
                </div>

                <button className={styles.primary}>Save Settings</button>
              </form>

              <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <p>Reset all caches and refresh metadata. This may take several minutes.</p>
                <button className={styles.danger}>Run System Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
