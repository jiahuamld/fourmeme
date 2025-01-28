'use client';

import Link from 'next/link';
import { FaGithub, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
  const links = [
    { label: '', href: '#' },
    // { label: 'About us', href: '#' },
    // { label: 'Brand assets', href: '#' },
    // { label: 'Code of conduct', href: '#' },
    // { label: 'Jobs', href: '#' },
    // { label: 'Privacy policy', href: '#' },
    // { label: 'Terms of use', href: '#' },
    // { label: 'Cookie policy', href: '#' },
    // { label: 'Press Contact', href: '#', isExternal: true },
  ];

  const socialLinks = [
    { icon: <FaGithub className="w-6 h-6" />, href: 'https://github.com/unifai-network', label: 'GitHub' },
    { icon: <FaXTwitter className="w-6 h-6" />, href: '#', label: 'X' },
    // { icon: <FaDiscord className="w-6 h-6" />, href: '#', label: 'Discord' },
  ];

  return (
    <footer className="w-full border-t border-gray-100/10 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            {socialLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label={link.label}
              >
                {link.icon}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-200 whitespace-nowrap flex items-center gap-1"
              >
                {link.label}
                {link.isExternal && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-2.69l8.22 8.22a.75.75 0 0 1-1.06 1.06L3.5 4.56V7.25a.75.75 0 0 1-1.5 0v-3.5A1.75 1.75 0 0 1 3.75 2Z" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}; 
