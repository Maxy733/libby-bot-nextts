"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Settings.module.css";

type MeResponse = {
  user_id: number;
  email: string;
  full_name?: string | null;
  created_at?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

export default function SettingsPage() {
  const router = useRouter();
  const token = useMemo(
    () =>
      typeof window === "undefined" ? null : localStorage.getItem("token"),
    []
  );
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) router.push("/login?next=/settings");
  }, [router, token]);

  // Load current user
  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load user");
        const data: MeResponse = await res.json();
        setMe(data);
        setForm({ full_name: data.full_name || "" });
      } catch {
        setErr("Unable to load your account. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, full_name: e.target.value }));
  };

  // ---- Save profile (stub endpoint; implement in backend as needed) ----
  const saveProfile = async () => {
    if (!token) return;
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: form.full_name }),
      });
      if (!res.ok) throw new Error("Bad response");
      setMsg("Profile updated.");
      // Optional: update cached "user" in localStorage if you store it
      const stored = localStorage.getItem("user");
      if (stored) {
        const next = { ...JSON.parse(stored), full_name: form.full_name };
        localStorage.setItem("user", JSON.stringify(next));
      }
      // Notify header
      window.dispatchEvent(new Event("libby:auth"));
    } catch {
      setErr("Failed to update profile.");
    }
  };

  // ---- Change password (stub endpoint; implement in backend) ----
  const changePassword = async () => {
    setMsg(null);
    setErr(null);
    if (!pw.current || !pw.next)
      return setErr("Please fill current and new password.");
    if (pw.next !== pw.confirm) return setErr("New passwords do not match.");
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: pw.current,
          new_password: pw.next,
        }),
      });
      if (!res.ok) throw new Error("Bad response");
      setMsg("Password changed.");
      setPw({ current: "", next: "", confirm: "" });
    } catch {
      setErr("Failed to change password.");
    }
  };

  // ---- Delete account (stub endpoint; implement in backend) ----
  const deleteAccount = async () => {
    if (!confirm("This will permanently delete your account. Continue?"))
      return;
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Bad response");
      // Clear client state and go home
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("libby:auth"));
      router.push("/");
    } catch {
      setErr("Could not delete account. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("libby:auth"));
    router.push("/");
  };

  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account and preferences</p>
        </header>

        <section className={styles.grid}>
          {/* Account card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Account</h2>
            {loading ? (
              <div className={styles.muted}>Loading…</div>
            ) : me ? (
              <div className={styles.stack}>
                <div>
                  <label className={styles.label}>Email</label>
                  <div className={styles.mutedBox}>{me.email}</div>
                </div>
                <div>
                  <label className={styles.label} htmlFor="full_name">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    className={styles.input}
                    value={form.full_name}
                    onChange={onChangeName}
                    placeholder="Your name"
                  />
                </div>
                <div className={styles.row}>
                  <button className={styles.primary} onClick={saveProfile}>
                    Save Changes
                  </button>
                  <button className={styles.ghost} onClick={logout}>
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.error}>Not logged in.</div>
            )}
          </div>

          {/* Password card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Password</h2>
            <div className={styles.stack}>
              <div>
                <label className={styles.label} htmlFor="pw_current">
                  Current password
                </label>
                <input
                  id="pw_current"
                  type="password"
                  className={styles.input}
                  value={pw.current}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPw((s) => ({ ...s, current: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={styles.label} htmlFor="pw_next">
                  New password
                </label>
                <input
                  id="pw_next"
                  type="password"
                  className={styles.input}
                  value={pw.next}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPw((s) => ({ ...s, next: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={styles.label} htmlFor="pw_confirm">
                  Confirm new password
                </label>
                <input
                  id="pw_confirm"
                  type="password"
                  className={styles.input}
                  value={pw.confirm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPw((s) => ({ ...s, confirm: e.target.value }))
                  }
                />
              </div>
              <div>
                <button className={styles.primary} onClick={changePassword}>
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className={styles.cardDanger}>
            <h2 className={styles.cardTitle}>Danger Zone</h2>
            <p className={styles.muted}>
              Deleting your account is permanent and cannot be undone.
            </p>
            <button className={styles.danger} onClick={deleteAccount}>
              Delete Account
            </button>
          </div>
        </section>

        {(msg || err) && (
          <div className={styles.footerBanner} role="status" aria-live="polite">
            {msg && <div className={styles.ok}>{msg}</div>}
            {err && <div className={styles.error}>{err}</div>}
          </div>
        )}
      </div>
    </main>
  );
}
