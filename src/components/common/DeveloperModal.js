'use client';

import { useEffect } from 'react';
import {
  FiX,
  FiPhone,
  FiGlobe,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiCode,
} from 'react-icons/fi';

/** Developer information — update these values */
const DEV = {
  name: 'Md. Aulad Hossen',
  title: 'Full Stack Web Developer',
  company: 'IDEA Project (2nd Phase)',
  email: 'auladinfo@gmail.com',
  phone: '+880 1302608955',
  website: 'https://auladhossen.com',
  github: 'https://github.com/auladwd',
  linkedin: 'https://www.linkedin.com/in/auladwd',
  photo: '/developer.jpg', // place your photo as public/developer.jpg
  skills: [
    'Next.js',
    'React',
    'Node.js',
    'MongoDB',
    'Tailwind CSS',
    'Firebase',
  ],
  bio: 'Passionate full-stack developer with expertise in building modern web applications. Focused on clean code, great UX, and scalable architecture.',
};

export default function DeveloperModal({ isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-base-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 btn btn-ghost btn-circle btn-sm z-10"
          aria-label="Close"
        >
          <FiX className="w-8 h-8 text-white pt-2" />
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-br from-primary to-primary/70 px-6 pt-8 pb-16 text-primary-content text-center">
          <div className="flex items-center justify-center gap-2 mb-1 opacity-80">
            <FiCode className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Developer Info
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">{DEV.name}</h2>
          <p className="text-sm opacity-80 mt-1">{DEV.title}</p>
          <p className="text-xs opacity-60 mt-0.5">{DEV.company}</p>
        </div>

        {/* Avatar — overlaps banner */}
        <div className="flex justify-center -mt-12 mb-3 px-6">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full ring-4 ring-base-100 shadow-xl overflow-hidden bg-base-300">
              <img
                src={DEV.photo}
                alt={DEV.name}
                className="w-full h-full object-cover"
                onError={e => {
                  // Fallback: show initials if image missing
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.classList.add(
                    'flex',
                    'items-center',
                    'justify-center',
                  );
                  e.currentTarget.parentElement.innerHTML = `<span class="text-3xl font-bold text-primary">${DEV.name.charAt(0)}</span>`;
                }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {/* Bio */}
          <p className="text-xs sm:text-sm text-base-content/70 text-center leading-relaxed">
            {DEV.bio}
          </p>

          <div className="divider my-1"></div>

          {/* Contact Info */}
          <div className="space-y-2.5">
            <ContactRow
              icon={FiPhone}
              label="Phone"
              value={DEV.phone}
              href={`tel:${DEV.phone}`}
            />
            <ContactRow
              icon={FiMail}
              label="Email"
              value={DEV.email}
              href={`mailto:${DEV.email}`}
            />
            <ContactRow
              icon={FiGlobe}
              label="Website"
              value={DEV.website.replace('https://', '')}
              href={DEV.website}
              external
            />
            <ContactRow
              icon={FiGithub}
              label="GitHub"
              value={DEV.github.replace('https://github.com/', '@')}
              href={DEV.github}
              external
            />
            <ContactRow
              icon={FiLinkedin}
              label="LinkedIn"
              value={DEV.linkedin.replace('https://linkedin.com/in/', 'in/')}
              href={DEV.linkedin}
              external
            />
          </div>

          <div className="divider my-1"></div>

          {/* Skills */}
          <div>
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DEV.skills.map(skill => (
                <span
                  key={skill}
                  className="badge badge-primary badge-outline badge-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a
            href={DEV.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm w-full mt-2 gap-2"
          >
            <FiGlobe className="w-4 h-4" />
            Visit Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}

/** Single contact row */
function ContactRow({ icon: Icon, label, value, href, external = false }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 group hover:bg-base-200 rounded-lg px-2 py-1.5 transition-colors"
    >
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-base-content/40 uppercase tracking-wider leading-none mb-0.5">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-medium truncate group-hover:text-primary transition-colors">
          {value}
        </p>
      </div>
    </a>
  );
}
