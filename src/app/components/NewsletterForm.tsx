"use client";

import React, { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      return;
    }
    try {
      setStatus("loading");
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border px-3 py-2 text-sm"
          aria-invalid={status === "error"}
        />
        <button
          type="submit"
          className="rounded-md px-3 py-2 text-sm font-medium text-white bg-black"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? "Subscribing…" : status === "success" ? "Subscribed" : "Subscribe"}
        </button>
      </form>
      {status === "error" && <p className="mt-2 text-xs text-red-600">Please enter a valid email.</p>}
      {status === "success" && <p className="mt-2 text-xs text-green-600">Thanks! Check your inbox.</p>}
    </div>
  );
}