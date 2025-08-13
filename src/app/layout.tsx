import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { lora } from './fonts'


export const metadata: Metadata = {
  title: "LIBBY BOT | University Book Recommender",
  description: "A smart book recommender for your university library.",
  icons: {
    icon: '/logo.svg', // This points to public/logo.svg
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 2. Apply the font's className here
    <html lang="en" className={lora.className}> 
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
