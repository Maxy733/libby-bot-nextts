// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OnboardingGate from "@/app/components/OnboardingGate";

export const metadata: Metadata = {
  title: "Libby - Your Personal Library Assistant",
  description:
    "Discover your next great read with personalized book recommendations tailored to your interests and academic needs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen flex flex-col bg-[var(--brand-bg)] text-[var(--brand-charcoal)]">
          {/* Main application structure */}
          <Header />

          <main className="flex-1" role="main">
            {children}
          </main>

          <Footer />

          {/* 
            Onboarding overlay - renders as full-screen takeover when needed
            This checks user state and shows the interests selection if required
          */}
          <OnboardingGate />
        </body>
      </html>
    </ClerkProvider>
  );
}
