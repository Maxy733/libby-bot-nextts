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
    "dashboard" | "books" | "analytics" | "settings"
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
    const validTabs = ["dashboard", "books", "analytics", "settings"];
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
            {["dashboard", "books", "analytics", "settings"].map(
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
                  <div className={styles.overviewRow}>
                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>Recent Activity Log</div>
                      <ul className={styles.recentActivityList}>
                        <li className={styles.recentActivityItem}>User John added a new book to the library.</li>
                        <li className={styles.recentActivityItem}>Recommendation engine refreshed at 12:30 PM.</li>
                        <li className={styles.recentActivityItem}>New user Sarah signed up.</li>
                        <li className={styles.recentActivityItem}>Database backup completed successfully.</li>
                      </ul>
                    </div>

                    <div className={styles.overviewItem}>
                      <div className={styles.overviewLabel}>System Status</div>
                      <ul className={styles.recentActivityList}>
                        <li className={styles.recentActivityItem}>
                          
                          Database
                          <span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                        </li>
                        <li className={styles.recentActivityItem}>
                          
                          API Services
                          <span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                        </li>
                        <li className={styles.recentActivityItem}>
                          
                          Server Load
                          <span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                        </li>
                        <li className={styles.recentActivityItem}>
                          
                          Cache
                          <span style={{ backgroundColor: 'limegreen', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '8px' }}></span>
                        </li>
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

  <div className={styles.overviewRow}>
    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Search Books</div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN"
          className={styles.searchBar}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ height: "30px", flex: 1 }}
        />
        <button className={styles.saveBtn}>Search</button>
      </div>
    </div>

    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Book Summary</div>
      <div>Total Books: 118,801</div>
      <div>Missing Metadata: 1,203</div>
    </div>
  </div>

  <div className={styles.overviewItem}>
    <div className={styles.overviewLabel}>Books Table</div>
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
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
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
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div className={styles.overviewItem}>
    <div className={styles.overviewLabel}>Add New Book</div>
    <form>
      <div className={styles.addBookContainer}>
        <input type="text" placeholder="Title" required style={{ height: "30px", flex: 1 }} />
        <input type="text" placeholder="Author" required style={{ height: "30px", flex: 1 }} />
        <input type="text" placeholder="ISBN" style={{ height: "30px", flex: 1 }} />
        <button type="submit" className={styles.saveBtn}>Add Book</button>
      </div>
    </form>
  </div>
</div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.tabContent}>
  <h2 className={styles.sectionTitle}>Analytics Dashboard</h2>

  <div className={styles.overviewRow}>
    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>User Growth (Last 6 Months)</div>
      <img src="/chart-users.png" alt="User growth chart" width="100%" />
    </div>

    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Recommendation Activity</div>
      <img src="/chart-recommendations.png" alt="Recommendations chart" width="100%" />
    </div>
  </div>

  <div className={styles.overviewRow}>
    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Most Popular Genres</div>
      <img src="/chart-genres.png" alt="Genre chart" width="100%" />
    </div>

    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Active Users (30 Days)</div>
      <img src="/chart-active-users.png" alt="Active users chart" width="100%" />
    </div>
  </div>
</div>
          )}

          {activeTab === "settings" && (
            <div className={styles.tabContent}>
  <h2 className={styles.sectionTitle}>System Settings</h2>

  <div className={styles.overviewItem}>
    <div className={styles.overviewLabel}>Configuration</div>
    <form className={styles.settingsForm}>
      <div className={styles.formGroup}>
        <label>Recommendation Weights:  </label>
        <input type="number" placeholder="Content-based (35%)" style={{ height: "24px" }} />
        <input type="number" placeholder="Collaborative (25%)" style={{ height: "24px" }} />
        <input type="number" placeholder="Trending (20%)" style={{ height: "24px" }} />
        <input type="number" placeholder="Author (15%)" style={{ height: "24px" }} />
        <input type="number" placeholder="Diversity (5%)" style={{ height: "24px" }} />
      </div>

      <div style={{ gap: "12px", marginBottom: "12px" }}>
        <label>Cache Refresh Interval (minutes):</label>
        <input type="number" placeholder="60" style={{ height: "24px", flex: 1, marginLeft:"24px"}} />
      </div>

      <div >
        <label>Maintenance Mode:</label>
        <select style={{ height: "24px", flex: 1, marginLeft:"24px" }}>
          <option>Off</option>
          <option>On</option>
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
        <button className={styles.saveBtn}>Save Settings</button>
      </div>
    </form>
  </div>

  <div className={styles.overviewItem}>
    <div className={styles.overviewLabel}>Danger Zone</div>
    <p>Reset all caches and refresh metadata. This may take several minutes.</p>
    <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
        <button className={styles.clearWishlistBtn}>Run System Reset</button>
    </div>
  </div>
</div>
          )}
        </div>
      </div>
    </div>
  );
}
