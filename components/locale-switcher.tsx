"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, type Locale } from "@/lib/i18n";

interface LocaleSwitcherProps {
  locale: Locale;
}

const localeConfig = {
  vi: { flag: "🇻🇳", label: "Tiếng Việt" },
  en: { flag: "🇬🇧", label: "English" },
  zh: { flag: "🇨🇳", label: "中文" },
  id: { flag: "🇮🇩", label: "Bahasa Indonesia" },
} as const;

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {locales.map((candidate, index) => {
        const isActive = candidate === locale;
        const target = buildSwitchPath(pathname, locale, candidate);
        const config = localeConfig[candidate];

        return (
          <div key={candidate} className="flex items-center gap-1.5">
            {isActive ? (
              <span 
                className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1.5 text-xl leading-none transition-all duration-200"
                title={config.label}
                aria-label={config.label}
              >
                {config.flag}
              </span>
            ) : (
              <Link 
                href={target} 
                className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xl leading-none text-foreground/60 transition-all duration-200 hover:bg-primary/5 hover:text-primary"
                title={config.label}
                aria-label={config.label}
              >
                {config.flag}
              </Link>
            )}
            {index < locales.length - 1 && (
              <span className="text-sm text-border" aria-hidden="true">/</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildSwitchPath(pathname: string, current: Locale, target: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${target}`;
  }

  if (segments[0] === current) {
    segments[0] = target;
  } else if (locales.includes(segments[0] as Locale)) {
    segments[0] = target;
  } else {
    segments.unshift(target);
  }

  return `/${segments.join("/")}`;
}
