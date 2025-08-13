// src/app/about/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

// --- NEW: Define a specific type for the component's props ---
interface TeamMemberCardProps {
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  delay: string;
  socialLinks?: { // The '?' makes this whole object optional
    github?: string;   // The '?' makes individual links optional
    linkedin?: string;
    twitter?: string;
  };
}

// --- Helper Components ---

// UPDATED: Use the new interface instead of 'any'
const TeamMemberCard = ({ name, role, imageUrl, bio, delay, socialLinks }: TeamMemberCardProps) => (
  <div className="member-card animated-element" style={{ transitionDelay: delay }}>
    <img src={imageUrl} alt={`Photo of ${name}, ${role}`} className="member-image" />
    <h3 className="member-name">{name}</h3>
    <p className="member-role">{role}</p>
    <p className="member-bio">{bio}</p>
    {socialLinks && (
      <div className="member-socials">
        {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"><FiGithub /></a>}
        {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FiLinkedin /></a>}
        {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FiTwitter /></a>}
      </div>
    )}
  </div>
);

// The main component for the About Us page
export default function AboutPage() {
  // useEffect hook for animations (no changes needed here)
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.animated-element');
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  // Data for team members (no changes needed here)
  const teamMembers: TeamMemberCardProps[] = [
    {
      name: 'Maxy',
      role: 'Project Lead & Full-Stack Architect',
      imageUrl: '/Kyaw.jpeg',
      bio: 'A passionate problem-solver who loves bringing ideas to life. Maxy’s favorite part of this project was designing the seamless user journey from discovery to checkout.',
      delay: '0ms',
      socialLinks: { github: '#', linkedin: '#' }
    },
    {
      name: 'Kyi',
      role: 'Backend & Data Wizard',
      imageUrl: '/Kyi.jpeg',
      bio: 'The mastermind behind our recommendation engine. Kyi enjoys turning messy data into smart suggestions. Favorite Book Genre: Sci-Fi.',
      delay: '100ms',
      socialLinks: { github: '#', linkedin: '#' }
    },
    {
      name: 'Degan',
      role: 'Lead UI/UX Designer',
      imageUrl: '/IMG_3849.jpeg',
      bio: 'With a keen eye for aesthetics and usability, Degan crafted the look and feel of LIBBY BOT. Believes good design is invisible. Currently obsessed with brutalist web design.',
      delay: '200ms',
      socialLinks: { github: '#', twitter: '#' }
    },
  ];

  return (
    <div>
      {/* Header (No changes) */}
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 45C20 39.4772 24.4772 35 30 35H62C63.1046 35 64 35.8954 64 37V27C64 25.8954 63.1046 25 62 25H58C56.8954 25 56 25.8954 56 27V35H70C75.5228 35 80 39.4772 80 45V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V45Z" fill="#2F2F2F"/><path d="M35 52.5C35 48.3579 38.3579 45 42.5 45H45V65H42.5C38.3579 65 35 61.6421 35 57.5V52.5Z" fill="#A18A68"/><path d="M65 52.5C65 48.3579 61.6421 45 57.5 45H55V65H57.5C61.6421 65 65 61.6421 65 57.5V52.5Z" fill="#A18A68"/><rect x="45" y="45" width="10" height="20" fill="#F8F7F5"/></svg>
            <span>LIBBY BOT</span>
          </Link>
          <nav className="main-nav"><Link href="/discover">Discover</Link><Link href="/about" className="text-brand-charcoal">About Us</Link><Link href="/trending">Trending</Link></nav>
          <div className="header-actions"><Link href="/login" className="login-btn">Log In</Link><Link href="/signup" className="signup-btn">Sign Up</Link></div>
        </div>
      </header>
      
      {/* Main Content (No changes) */}
      <main className="container page-content">
        <div className="space-y-24">
            {/* ... rest of your JSX from the previous step ... */}
            {/* Page Header */}
            <div className="text-center animated-element">
              <h1 className="page-title">We're on a Mission to Make the Library Magical.</h1>
              <p className="page-subtitle max-w-3xl mx-auto">LIBBY BOT is more than just a search bar; it's a new front door to the incredible world of books waiting on our university's shelves.</p>
            </div>

            {/* Our Story Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animated-element">
              <div className="order-2 md:order-1">
                <h2 className="section-title mb-4">Our Story</h2>
                <div className="space-y-4 text-lg text-brand-muted-grey leading-relaxed">
                  <p>It all started with a simple question: "Why do I spend more time looking for a book than actually reading it?" As students, we felt a disconnect. On one hand, we had access to a treasure trove of physical books. On the other, we lived in a world of instant, personalized digital content.</p>
                  <p>We imagined a world where the library knew us. Where it could suggest that perfect, obscure philosophy text for our essay or a thrilling novel for a rainy weekend. That vision became LIBBY BOT—our effort to blend the timeless value of the library with the power of modern technology.</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                  <img src="/library-sketch.jpg" alt="A sketch of a modern library interface" className="rounded-lg shadow-lg aspect-video object-cover"/>
              </div>
            </section>

            {/* The Technology Section */}
            <section className="text-center animated-element">
                <h2 className="section-title">Built for Discovery</h2>
                <p className="page-subtitle mt-2 max-w-3xl mx-auto">We chose our technology not just because it's modern, but because it creates a better experience for you.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
                  <div className="tech-card"><h3 className="tech-card-title">A Lightning-Fast Interface</h3><p className="tech-card-body">Using <span className="font-semibold text-brand-charcoal">Next.js & React</span>, we built a buttery-smooth interface that feels responsive and alive. No more clunky page reloads—just seamless Browse.</p></div>
                  <div className="tech-card"><h3 className="tech-card-title">Intelligent Recommendations</h3><p className="tech-card-body">Our <span className="font-semibold text-brand-charcoal">Python & Flask</span> backend is the brain of the operation, running the logic that finds books tailored to your interests and needs.</p></div>
                  <div className="tech-card"><h3 className="tech-card-title">Smart Data Processing</h3><p className="tech-card-body">We use the <span className="font-semibold text-brand-charcoal">Pandas</span> library to wrangle the library's vast catalog, ensuring the data is clean, accurate, and ready for our recommendation engine.</p></div>
                </div>
            </section>

            {/* Meet the Team Section */}
            <section>
              <div className="text-center animated-element">
                  <h2 className="section-title">Meet the Team</h2>
                  <p className="page-subtitle mt-2">The curious minds behind the code.</p>
              </div>
              <div className="team-grid mt-12">
                {teamMembers.map(member => (
                  <TeamMemberCard key={member.name} {...member} />
                ))}
              </div>
            </section>

            {/* Call to Action Section */}
            <section className="text-center bg-brand-beige p-12 rounded-lg animated-element">
              <h2 className="text-3xl font-bold text-brand-charcoal">Ready to Find Your Next Favorite Book?</h2>
              <p className="mt-4 mb-8 text-lg text-brand-muted-grey max-w-2xl mx-auto">Our digital shelves are open. Start your journey of discovery and see what the library has in store for you.</p>
              <Link href="/discover" className="cta-button">
                Start Discovering
              </Link>
            </section>
        </div>
      </main>
    </div>
  );
}