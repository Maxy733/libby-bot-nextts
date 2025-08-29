"use client";
import { SignUp, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, setActive } = useSignUp();

  // Redirect when signup is complete
React.useEffect(() => {
  if (signUp && signUp.status === "complete" && signUp.createdSessionId) {
    setActive({ session: signUp.createdSessionId }).then(() => {
      router.push("/onboarding/interests"); // redirect after signup
    });
  }
}, [signUp, signUp?.createdSessionId, setActive, router]);


  return (
    <div className="auth-page">
      {/* Left image panel */}
      <div
        className="auth-image-panel"
        style={{ backgroundImage: "url('/Musuem-2_1195x794.webp')" }}
      ></div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {/* Uncomment if you want logo/text */}
          {/*
          <div className="auth-logo">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Start exploring our library system</p>
          </div>
          */}
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "auth-button",
              },
            }}
            signInUrl="/sign-in" // link to sign-in page
          />
          <div className="auth-footer-link">
            Already have an account?{" "}
            <Link href="/sign-in">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
