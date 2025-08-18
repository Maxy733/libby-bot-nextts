
"use client";

import React, { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

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
    <form onSubmit={handleSubscribe}>
      <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
      <button type="submit" disabled={status==="loading"||status==="success"}>
        {status==="loading" ? "Subscribing…" : status==="success" ? "Subscribed" : "Subscribe"}
      </button>
      {status==="error" && <p>Please enter a valid email.</p>}
      {status==="success" && <p>Thanks! Check your inbox.</p>}
    </form>
  );
}