// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';

// A simple component for each footer link
const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <li>
    <Link href={href} className="footer-link">
      {children}
    </Link>
  </li>
);

// The main Footer component
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
              <FooterLink href="#">Our Mission</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Press</FooterLink>
            </ul>
          </div>

          {/* Column 2: Community */}
          <div className="footer-col">
            <h3 className="footer-col-title">Community</h3>
            <ul>
              <FooterLink href="#">For Students</FooterLink>
              <FooterLink href="#">For Faculty</FooterLink>
              <FooterLink href="#">Partners</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
            </ul>
          </div>

          {/* Column 3: More */}
          <div className="footer-col">
            <h3 className="footer-col-title">More</h3>
            <ul>
              <FooterLink href="#">Help</FooterLink>
              <FooterLink href="#">Accessibility</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
              <FooterLink href="#">Terms</FooterLink>
              <FooterLink href="#">Privacy</FooterLink>
            </ul>
          </div>

          {/* Column 4: Social & App Store (Placeholder) */}
          <div className="footer-col">
            {/* In a real app, these would be real App Store buttons */}
            <div className="app-store-button">App Store</div>
            <div className="app-store-button">Google Play</div>
          </div>
        </div>

        {/* Bottom section with copyright and social icons */}
        <div className="footer-bottom">
          <p className="copyright">&copy; 2025 LIBBY BOT Inc. All rights reserved.</p>
          <div className="social-icons">
            {/* These are placeholder icons. You can replace them with real SVG icons. */}
            <a href="#" className="social-icon">FB</a>
            <a href="#" className="social-icon">TW</a>
            <a href="#" className="social-icon">IG</a>
            <a href="#" className="social-icon">LI</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
