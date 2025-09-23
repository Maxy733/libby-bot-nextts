"use client";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isSignedIn, isLoaded, router]);

  // Don't render anything while checking auth or if already signed in
  if (!isLoaded) return <div>Loading...</div>;
  if (isSignedIn) return <div>Redirecting...</div>;

  return (
    <div className="auth-page">
      <div className="auth-image-panel" style={{ backgroundImage: "url('/stack-of-library-books.webp')" }} />
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <SignIn afterSignInUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}