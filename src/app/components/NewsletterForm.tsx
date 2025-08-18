// src/app/components/NewsletterForm.tsx
"use client";
import React, { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setStatus("error"); return; }
    try {
      setStatus("loading");
      await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setStatus("success");
      setEmail("");
    } catch { setStatus("error"); }
  }

  return (
    <form onSubmit={handleSubscribe} className="newsletter-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="newsletter-input"
        aria-invalid={status === "error"}
      />
      <button type="submit" className="newsletter-button" disabled={status === "loading" || status === "success"}>
        {status === "loading" ? "Subscribing…" : status === "success" ? "Subscribed" : "Subscribe"}
      </button>
      {status === "error" && <p className="newsletter-message error">Please enter a valid email.</p>}
      {status === "success" && <p className="newsletter-message success">Thanks! Check your inbox.</p>}
    </form>
  );
}