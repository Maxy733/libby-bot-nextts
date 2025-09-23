"use client";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  
  // Redirect when signin is complete
  React.useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard'); // redirect after signin
    }
  }, [isSignedIn, router]);

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
