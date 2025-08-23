// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { lora } from './fonts';

import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "LIBBY BOT | University Book Recommender",
  description: "A smart book recommender for your university library.",
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={lora.className}>
        <body className="antialiased">
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}