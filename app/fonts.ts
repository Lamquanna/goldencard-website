// Temporarily using system fonts for build environment
// TODO: Re-enable Google Fonts when deploying to production with network access

// Mock font objects for build environment
const createMockFont = (name: string, fallback: string[]) => ({
  variable: `--font-${name.toLowerCase()}`,
  className: '',
  style: {
    fontFamily: fallback.join(', ')
  }
});

// Inter for Vietnamese body text (clean, readable sans-serif)
export const inter = createMockFont('inter', ['system-ui', '-apple-system', 'sans-serif']);

// Playfair Display for headings (elegant serif)
export const playfairDisplay = createMockFont('playfair', ['Georgia', 'serif']);

// Montserrat for all languages including Vietnamese - primary font
export const montserrat = createMockFont('montserrat', ['system-ui', '-apple-system', 'sans-serif']);

// Main fonts for cinematic design
export const bodyFont = montserrat;
export const headingFont = playfairDisplay;
