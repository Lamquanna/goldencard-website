"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  navItems: {
    label: string;
    href: string;
    children?: { label: string; href: string }[];
  }[];
}

/**
 * MobileMenu - Animated Mobile Drawer Menu
 * 
 * Features:
 * - Slide from right animation
 * - Backdrop blur overlay
 * - Staggered menu items animation
 * - Nested accordion for dropdowns
 * - Touch-friendly large tap targets
 */
export default function MobileMenu({
  isOpen,
  onClose,
  locale,
  navItems,
}: MobileMenuProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const itemVariants = {
    closed: { x: 50, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />

          {/* Menu Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[400px] bg-white z-50 shadow-2xl"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-xl font-semibold text-gray-900">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              <ul className="space-y-2">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.href}
                    custom={i}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    {item.children ? (
                      // Accordion Item
                      <div>
                        <button
                          onClick={() =>
                            setOpenSubmenu(
                              openSubmenu === item.href ? null : item.href
                            )
                          }
                          className="flex items-center justify-between w-full py-4 px-4 text-lg text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span>{item.label}</span>
                          <motion.svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            animate={{
                              rotate: openSubmenu === item.href ? 180 : 0,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </motion.svg>
                        </button>

                        <AnimatePresence>
                          {openSubmenu === item.href && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-4 border-l-2 border-[#D4AF37]/30 ml-4"
                            >
                              {item.children.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={`/${locale}${child.href}`}
                                    className="block py-3 px-4 text-gray-600 hover:text-[#D4AF37] hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={onClose}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      // Simple Link
                      <Link
                        href={`/${locale}${item.href}`}
                        className="block py-4 px-4 text-lg text-gray-800 hover:text-[#D4AF37] hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Footer CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white">
              <Link
                href={`/${locale}/contact`}
                className="block w-full py-4 px-6 text-center text-white bg-[#D4AF37] hover:bg-[#C19A2E] rounded-lg font-medium transition-colors min-h-[56px] flex items-center justify-center"
                onClick={onClose}
              >
                {locale === "vi"
                  ? "Liên hệ tư vấn"
                  : locale === "zh"
                  ? "联系咨询"
                  : locale === "id"
                  ? "Hubungi Kami"
                  : "Contact Us"}
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
