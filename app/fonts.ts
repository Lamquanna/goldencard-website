import { Playfair_Display, Montserrat, Inter } from "next/font/google";

// Inter for Vietnamese body text (clean, readable sans-serif)
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap", // FOIT → FOUT optimization
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
  weight: ["400", "500", "600", "700", "800"],
});

// Playfair Display for headings (elegant serif)
export const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap", // FOIT → FOUT optimization
  preload: true,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: true,
  weight: ["400", "500", "600", "700", "800"],
});

// Montserrat for all languages including Vietnamese - primary font
export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap", // FOIT → FOUT optimization
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
  weight: ["400", "500", "600", "700", "800"],
});

// Main fonts for cinematic design
export const bodyFont = montserrat;
export const headingFont = playfairDisplay;
