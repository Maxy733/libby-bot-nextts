// src/app/about/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
// --- FIX 1: Import the Next.js Image component ---
import Image from 'next/image';
import Header from '../components/Header';

// --- Type Definitions (no changes needed) ---
interface TeamMemberCardProps {
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  delay: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// --- Helper Components ---
const TeamMemberCard = ({ name, role, imageUrl, bio, delay, socialLinks }: TeamMemberCardProps) => (
  <div className="member-card animated-element" style={{ transitionDelay: delay }}>
    {/* --- FIX 2: Replaced <img> with the Next.js <Image> component --- */}
    <Image 
        src={imageUrl} 
        alt={`Photo of ${name}, ${role}`} 
        className="member-image" 
        width={128} // Required for Next.js Image
        height={128} // Required for Next.js Image
    />
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
  // useEffect hook remains the same
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

  // Team member data remains the same
  const teamMembers: TeamMemberCardProps[] = [
    {
      name: 'Maxy',
      role: 'Project Lead & Full-Stack Architect',
      imageUrl: '/Kyaw.jpeg',
      bio: 'A passionate problem-solver who loves bringing ideas to life. Maxy’s favorite part of this project was designing the seamless user journey from discovery to checkout.',
      delay: '0ms',
      socialLinks: { github: 'https://github.com/Maxy733', linkedin: '#' }
    },
    {
      name: 'Kyi',
      role: 'Backend & Data Wizard',
      imageUrl: '/Kyi.jpeg',
      bio: 'The mastermind behind our recommendation engine. Kyi enjoys turning messy data into smart suggestions. Favorite Book Genre: Sci-Fi.',
      delay: '100ms',
      socialLinks: { github: 'https://github.com/kyisinn', linkedin: '#' }
    },
    {
      name: 'Degan',
      role: 'Lead UI/UX Designer',
      imageUrl: '/IMG_3849.jpeg',
      bio: 'With a keen eye for aesthetics and usability, Degan crafted the look and feel of LIBBY BOT. Believes good design is invisible. Currently obsessed with brutalist web design.',
      delay: '200ms',
      socialLinks: { github: 'https://github.com/Norman7781', twitter: '#' }
    },
  ];

  return (
    <div>
      <Header />
      
      <main className="container page-content">
        <div className="space-y-24">
            <div className="text-center animated-element">
              {/* --- FIX 3: Replaced ' with &apos; --- */}
              <h1 className="page-title">We&apos;re on a Mission to Make the Library Magical.</h1>
              <p className="page-subtitle max-w-3xl mx-auto">LIBBY BOT is more than just a search bar; it&apos;s a new front door to the incredible world of books waiting on our university&apos;s shelves.</p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animated-element">
              <div className="order-2 md:order-1">
                <h2 className="section-title mb-4">Our Story</h2>
                <div className="space-y-4 text-lg text-brand-muted-grey leading-relaxed">
                  {/* --- FIX 4: Replaced " and ' with &quot; and &apos; --- */}
                  <p>It all started with a simple question: &quot;Why do I spend more time looking for a book than actually reading it?&quot; As students, we felt a disconnect. On one hand, we had access to a treasure trove of physical books. On the other, we lived in a world of instant, personalized digital content.</p>
                  <p>We imagined a world where the library knew us. Where it could suggest that perfect, obscure philosophy text for our essay or a thrilling novel for a rainy weekend. That vision became LIBBY BOT—our effort to blend the timeless value of the library with the power of modern technology.</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                  {/* --- FIX 5: Replaced <img> with <Image> component --- */}
                  <Image 
                    src="/ai-photo.jpg" 
                    alt="A sketch of a modern library interface" 
                    className="rounded-lg shadow-lg aspect-video object-cover"
                    width={600} // Example width
                    height={338} // Example height to maintain aspect ratio
                  />
              </div>
            </section>

            <section className="text-center animated-element">
                <h2 className="section-title">Built for Discovery</h2>
                <p className="page-subtitle mt-2 max-w-3xl mx-auto">We chose our technology not just because it&apos;s modern, but because it creates a better experience for you.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
                  <div className="tech-card"><h3 className="tech-card-title">A Lightning-Fast Interface</h3><p className="tech-card-body">Using <span className="font-semibold text-brand-charcoal">Next.js & React</span>, we built a buttery-smooth interface that feels responsive and alive. No more clunky page reloads—just seamless Browse.</p></div>
                  <div className="tech-card"><h3 className="tech-card-title">Intelligent Recommendations</h3><p className="tech-card-body">Our <span className="font-semibold text-brand-charcoal">Python & Flask</span> backend is the brain of the operation, running the logic that finds books tailored to your interests and needs.</p></div>
                  <div className="tech-card"><h3 className="tech-card-title">Smart Data Processing</h3><p className="tech-card-body">We use the <span className="font-semibold text-brand-charcoal">Pandas</span> library to wrangle the library&apos;s vast catalog, ensuring the data is clean, accurate, and ready for our recommendation engine.</p></div>
                </div>
            </section>

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