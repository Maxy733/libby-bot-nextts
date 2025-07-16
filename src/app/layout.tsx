import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "LIBBY BOT | University Book Recommender",
  description: "A smart book recommender for your university library.",
  icons: {
    icon: '/logo.svg', // This points to public/logo.svg
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        {children}
        <Footer />
      </body>
    </html>
  );
}
