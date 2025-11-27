"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { Locale } from "@/lib/i18n";

const LOCALES = [
  { code: "vi", label: "VIE", flag: "🇻🇳" },
  { code: "en", label: "ENG", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "id", label: "IND", flag: "🇮🇩" },
] as const;

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current locale from pathname
  const currentLocale = pathname.split("/")[1] as Locale || "vi";
  const currentLang = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-gray-10 hover:bg-white/10 hover:border-gray-30 transition-all duration-300 rounded"
        aria-label="Switch language"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-xs text-white/90 font-light tracking-wide">
          {currentLang.label}
        </span>
        <svg
          className={`w-3 h-3 text-white/60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 py-1 bg-white border-2 border-gray-300 rounded shadow-2xl z-50 min-w-[120px]">
          {LOCALES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all duration-200 ${
                currentLocale === lang.code
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-xs tracking-wide">{lang.label}</span>
              {currentLocale === lang.code && (
                <svg className="w-3 h-3 ml-auto text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
