// Server component (no "use client" here)
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold">LIBBY BOT</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/mission">Our Mission</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/press">Press</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/readers">For Readers</Link></li>
              <li><Link href="/authors">For Authors</Link></li>
              <li><Link href="/publishers">For Publishers</Link></li>
              <li><Link href="/partners">Partnerships</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/accessibility">Accessibility</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Stay Connected (NEWSLETTER HERE) */}
          <div>
            <h3 className="text-sm font-semibold">Stay Connected</h3>
            <p className="mt-4 text-sm">Get weekly book picks, reading lists, and feature releases.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t py-6 text-sm text-center">
          &copy; 2025 LIBBY BOT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}