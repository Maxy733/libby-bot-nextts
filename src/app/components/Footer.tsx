// src/app/components/Footer.tsx (server component)
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="footer-link">
      {children}
    </Link>
  </li>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Top section with link columns */}
        <div className="footer-main">
          {/* Column 1: LIBBY BOT */}
          <div className="footer-col">
            <h3 className="footer-col-title">LIBBY BOT</h3>
            <ul>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/how-it-works">How It Works</FooterLink>
              <FooterLink href="/mission">Our Mission</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/press">Press</FooterLink>
            </ul>
          </div>

          {/* Column 2: Community */}
          <div className="footer-col">
            <h3 className="footer-col-title">Community</h3>
            <ul>
              <FooterLink href="/readers">For Readers</FooterLink>
              <FooterLink href="/authors">For Authors</FooterLink>
              <FooterLink href="/publishers">For Publishers</FooterLink>
              <FooterLink href="/partners">Partnerships</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="footer-col">
            <h3 className="footer-col-title">Support</h3>
            <ul>
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
              <FooterLink href="/accessibility">Accessibility</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </ul>
          </div>

          {/* Column 4: Stay Connected (Newsletter + placeholders) */}
          <div className="footer-col">
            <h3 className="footer-col-title">Stay Connected</h3>
            <p className="copyright">Get weekly book picks, reading lists, and feature releases.</p>
            <NewsletterForm />
            <div className="app-store-button">App Store</div>
            <div className="app-store-button">Google Play</div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="footer-bottom">
          <p className="copyright">&copy; 2025 LIBBY BOT Inc. All rights reserved.</p>
          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Facebook">FB</a>
            <a href="#" className="social-icon" aria-label="Twitter/X">TW</a>
            <a href="#" className="social-icon" aria-label="Instagram">IG</a>
            <a href="#" className="social-icon" aria-label="LinkedIn">LI</a>
          </div>
        </div>
      </div>
    </footer>
  );
}