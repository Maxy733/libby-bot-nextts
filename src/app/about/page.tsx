// src/app/about/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

// The main component for the About Us page
export default function AboutPage() {
  // A simple effect to add the 'is-visible' class for animations on scroll
  // In a real app, you might use a more robust library like Framer Motion
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animated-element').forEach(el => observer.observe(el));
  }, []);

  return (
    <div>
      
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z" fill="#2F2F2F"/>
              <path d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z" fill="#A18A68"/>
              <path d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z" fill="#A18A68"/>
              <rect x="45" y="45" width="10" height="20" fill="#F8F7F5"/>
            </svg>
            <span>LIBBY BOT</span>
          </Link>
          <nav className="main-nav">
            <Link href="/discover">Discover</Link>
            <Link href="/about" className="text-brand-charcoal">About Us</Link>
            <Link href="/trending">Trending</Link>
          </nav>
          <div className="header-actions">
            <Link href="/login" className="login-btn">Log In</Link>
            <Link href="/signup" className="signup-btn">Sign Up</Link>
          </div>
        </div>
      </header>

      <main className="container page-content">
        <div className="space-y-16">
          
          {/* Page Header */}
          <div className="animated-element">
            <h1 className="page-title">About LIBBY BOT</h1>
            <p className="page-subtitle">Modernizing the library experience through technology.</p>
          </div>

          {/* Our Mission Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 items-center">
            <div className="md:col-span-1 animated-element">
              <h2 className="section-title">Our Mission</h2>
            </div>
            <div className="md:col-span-2 animated-element" style={{transitionDelay: '100ms'}}>
              <p className="text-lg text-brand-muted-grey leading-relaxed">
                Our mission is to bridge the gap between the vast physical resources of our university library and the digital-first habits of today's students. We believe that finding the right book should be as easy and intuitive as discovering a new show on Netflix. LIBBY BOT aims to create a smarter, more personalized library experience that encourages exploration and supports academic success.
              </p>
            </div>
          </section>

          {/* The Technology Section */}
           <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 items-center">
            <div className="md:col-span-1 animated-element">
              <h2 className="section-title">The Technology</h2>
            </div>
            <div className="md:col-span-2 space-y-4 animated-element" style={{transitionDelay: '100ms'}}>
              <p className="text-lg text-brand-muted-grey leading-relaxed">
                This project is built using a modern web development stack, separating the front-end interface from the backend data processing for a robust and scalable application.
              </p>
              <ul className="list-disc list-inside text-brand-muted-grey space-y-2">
                <li><span className="font-semibold text-brand-charcoal">Front-End:</span> Built with <span className="font-semibold">Next.js</span>, a powerful React framework that enables a fast, single-page application experience.</li>
                <li><span className="font-semibold text-brand-charcoal">Back-End API:</span> Powered by <span className="font-semibold">Python</span> and the <span className="font-semibold">Flask</span> micro-framework, perfect for handling data and building recommendation logic.</li>
                <li><span className="font-semibold text-brand-charcoal">Data Handling:</span> The <span className="font-semibold">Pandas</span> library is used to read, clean, and process the library's catalog data from its original source file.</li>
              </ul>
            </div>
          </section>

          {/* NEW: Meet the Team Section */}
          <section>
            <div className="text-center animated-element">
                <h2 className="section-title">Meet the Team</h2>
                <p className="page-subtitle mt-2">The developers behind the project.</p>
            </div>
            <div className="team-grid mt-12">
                {/* Member 1 */}
                <div className="member-card animated-element">
                    <img src="https://placehold.co/200x200/A18A68/FFFFFF?text=M" alt="Team Member 1" className="member-image" />
                    <h3 className="member-name">Maxy</h3>
                    <p className="member-role">Project Lead & Full-Stack Developer</p>
                </div>
                {/* Member 2 */}
                <div className="member-card animated-element" style={{transitionDelay: '100ms'}}>
                    <img src="https://placehold.co/200x200/2F2F2F/FFFFFF?text=A" alt="Team Member 2" className="member-image" />
                    <h3 className="member-name">Alex</h3>
                    <p className="member-role">UI/UX Designer</p>
                </div>
                {/* Member 3 */}
                <div className="member-card animated-element" style={{transitionDelay: '200ms'}}>
                    <img src="https://placehold.co/200x200/858585/FFFFFF?text=J" alt="Team Member 3" className="member-image" />
                    <h3 className="member-name">Jordan</h3>
                    <p className="member-role">Backend & Database Specialist</p>
                </div>
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
}
