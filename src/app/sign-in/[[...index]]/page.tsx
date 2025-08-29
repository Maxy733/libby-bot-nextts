"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-image-panel" style={{ backgroundImage: "url('/stack-of-library-books.webp')" }} />
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
