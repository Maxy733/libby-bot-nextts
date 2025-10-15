"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import styles from "./Admin.module.css";

interface UserStats {
  recommendationsCount: number;
  totalUsers?: number;
  newSignupsWeek?: number;
}

export default function AdminClient({ userStats }: { userStats: UserStats }) {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "books" | "analytics" | "settings"
  >("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["dashboard", "books", "analytics", "settings"].includes(hash)) {
      setActiveTab(hash as typeof activeTab);
    }
  }, []);

  if (!isLoaded)
    return <div className="loading-container">Loading...</div>;

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
      {/* Sidebar */}
      <div className={styles.leftColumn}>
        <div className={styles.settingsMenu}>
          <ul>
            {["dashboard", "books", "analytics", "settings"].map((tab) => (
              <li key={tab}>
                <button
                  className={`${styles.tabBtn} ${
                    activeTab === tab ? styles.active : ""
                  }`}
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab);
                    window.location.hash = tab;
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.middleColumn}>
        <div className={styles.profileHeader}>
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

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Dashboard</h2>
            <div className={styles.overviewRow}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>Total Users</div>
                <div className={styles.overviewValue}>
                  {userStats.totalUsers ?? 0}
                </div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>Books in Library</div>
                <div className={styles.overviewValue}>118,801</div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>Active Recommendations</div>
                <div className={styles.overviewValue}>
                  {userStats.recommendationsCount}
                </div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>
                  New Sign-ups This Week
                </div>
                <div className={styles.overviewValue}>
                  {userStats.newSignupsWeek ?? 0}
                </div>
              </div>
            </div>

            <div className={styles.overviewRow}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>Recent Activity Log</div>
                <ul className={styles.recentActivityList}>
                  <li>- User John added a new book to the library.</li>
                  <li>- Recommendation engine refreshed at 12:30 PM.</li>
                  <li>- New user Sarah signed up.</li>
                  <li>- Database backup completed successfully.</li>
                </ul>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewLabel}>System Status</div>
                <ul className={styles.recentActivityList}>
                  {["Database", "API Services", "Server Load", "Cache"].map(
                    (item) => (
                      <li key={item}>
                        {item}
                        <span
                          style={{
                            backgroundColor: "limegreen",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            display: "inline-block",
                            marginLeft: "8px",
                          }}
                        />
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
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
<div className={styles.overviewRow}>
  <div className={styles.overviewItem}>
    <div className={styles.overviewLabel}>Default Books Table</div>
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
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>To Kill a Mockingbird</td>
          <td>Harper Lee</td>
          <td>1960</td>
          <td>Classic</td>
          <td>4.8</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>Pride and Prejudice</td>
          <td>Jane Austen</td>
          <td>1813</td>
          <td>Romance</td>
          <td>4.7</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>The Catcher in the Rye</td>
          <td>J.D. Salinger</td>
          <td>1951</td>
          <td>Fiction</td>
          <td>4.0</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>The Hobbit</td>
          <td>J.R.R. Tolkien</td>
          <td>1937</td>
          <td>Fantasy</td>
          <td>4.8</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>The Lord of the Rings</td>
          <td>J.R.R. Tolkien</td>
          <td>1954</td>
          <td>Fantasy</td>
          <td>4.9</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>Brave New World</td>
          <td>Aldous Huxley</td>
          <td>1932</td>
          <td>Dystopian</td>
          <td>4.2</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>Moby-Dick</td>
          <td>Herman Melville</td>
          <td>1851</td>
          <td>Adventure</td>
          <td>4.1</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
        <tr>
          <td><img src="/placeholder-cover.png" width="40" alt="cover" /></td>
          <td>War and Peace</td>
          <td>Leo Tolstoy</td>
          <td>1869</td>
          <td>Historical</td>
          <td>4.6</td>
          <td>
            <button className={styles.saveBtn}>Edit</button>
            <button className={styles.clearWishlistBtn}>Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  </div>
<div className={styles.overviewRow}>
  <div className={styles.overviewItem}>
    <div className={styles.overviewLabel}>Add New Default Book</div>
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

<div className={styles.overviewRow}>
  <div className={styles.overviewItem}>
    <div className={styles.overviewLabel}>Add New Book to Database</div>
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
</div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.tabContent}>
  <h2 className={styles.sectionTitle}>Analytics Dashboard</h2>

  <div className={styles.overviewRow}>
    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>User Growth (Last 6 Months)</div>
      <img src="/deepfake-detection-min.webp" alt="User growth chart" width="100%" />
    </div>

    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Recommendation Activity</div>
      <img src="/undefined.webp" alt="Recommendations chart" width="100%" />
    </div>
  </div>

  <div className={styles.overviewRow}>
    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Most Popular Genres</div>
      <img src="/Screenshot 2025-10-15 at 5.03.29 AM.png" alt="Genre chart" width="100%" />
    </div>

    <div className={styles.overviewItem}>
      <div className={styles.overviewLabel}>Active Users (30 Days)</div>
      <img src="/Twitter.webp" alt="Active users chart" width="100%" />
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
  );
}
