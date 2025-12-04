"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileMenu from "@/components/ui/MobileMenu";
import ScrollProgress from "@/components/ui/ScrollProgress";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface NavbarProps {
  navItems: NavItem[];
  locale: string;
}

/**
 * Navbar - Premium Cinematic with Scroll Direction Detection
 * 
 * Spec:
 * - Logo always visible (fixed)
 * - Thu gọn khi scroll >100px
 * - Hover: letter-spacing + glow trắng nhẹ
 * - Smooth animation with Framer Motion
 * - Backdrop blur
 * - SSR-safe, mobile-friendly
 */
export default function Navbar({ navItems, locale }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Update compact state only
          setIsScrolled(currentScrollY > 100);
          
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <ScrollProgress color="#D4AF37" height={3} />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "bg-white/90 py-6"
        }`}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)", // iOS Safari support
          borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
        }}
      >
      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
        <div className="flex items-center justify-between">
          {/* Logo - always visible */}
          <Link href={`/${locale}`} className="group flex items-center">
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isScrolled ? 0.9 : 1,
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Image
                src="/logo-goldenenergy.png"
                alt="Golden Energy - Clean Energy, Green Life, Golden Future"
                width={isScrolled ? 70 : 80}
                height={isScrolled ? 17.5 : 20}
                className="transition-all duration-300"
                priority
              />
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center space-x-6 lg:space-x-10">
            {navItems.map((item) => (
              <li key={item.href} className="relative group/nav">
                {item.children ? (
                  <>
                    <Link
                      href={item.href}
                      className="group relative text-black font-bold tracking-[0.05em] hover:tracking-[0.08em] transition-all duration-500 inline-flex items-center gap-1"
                      style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: isScrolled ? "0.875rem" : "0.9375rem",
                      }}
                    >
                      <span className="relative z-10">{item.label}</span>
                      <svg className="w-3 h-3 transition-transform group-hover/nav:rotate-180 duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      
                      {/* Glow effect on hover */}
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          filter: "blur(8px)",
                          background: "rgba(76, 175, 80, 0.1)",
                        }}
                      />
                    </Link>

                    {/* Dropdown */}
                    <ul className="absolute top-full left-0 mt-2 py-2 bg-white/98 backdrop-blur-md border border-gray-20 shadow-lg min-w-[160px] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2 text-black font-bold text-sm hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="group relative text-black font-bold tracking-[0.05em] hover:tracking-[0.08em] transition-all duration-500"
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: isScrolled ? "0.875rem" : "0.9375rem",
                    }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Glow effect on hover */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        filter: "blur(8px)",
                        background: "rgba(76, 175, 80, 0.1)",
                      }}
                    />
                  </Link>
                )}
              </li>
            ))}
            
            {/* Language Switcher */}
            <li>
              <LanguageSwitcher />
            </li>
          </ul>

          {/* Mobile Menu Button - Expanded touch zone */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-gray-900 hover:text-gray-900 transition-colors p-3 -m-3 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Menu Drawer */}
    <MobileMenu
      isOpen={isMobileMenuOpen}
      onClose={closeMobileMenu}
      locale={locale}
      navItems={navItems}
    />
  </>
  );
}
