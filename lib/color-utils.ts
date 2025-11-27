/**
 * Color Utility Functions for Automatic Text Color Adjustment
 * 
 * Phục vụ yêu cầu Frontend Lead: Tự động điều chỉnh màu chữ dựa trên background
 * - Background sáng (trắng, xám nhạt) → chữ đen (#000000)
 * - Background tối → chữ trắng (#FFFFFF)
 */

/**
 * Calculate relative luminance theo chuẩn WCAG 2.0
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Map Tailwind background classes to luminance values
 * Các background class phổ biến trong CRM
 */
const TAILWIND_BG_LUMINANCE: Record<string, number> = {
  // White/Light backgrounds - Luminance cao (>0.5) → dùng text đen
  'bg-white': 1.0,
  'bg-gray-50': 0.95,
  'bg-gray-100': 0.85,
  'bg-gray-200': 0.75,
  'bg-blue-50': 0.9,
  'bg-green-50': 0.9,
  'bg-yellow-50': 0.9,
  'bg-purple-50': 0.9,
  'bg-orange-50': 0.9,

  // Medium backgrounds - Luminance trung bình (0.3-0.5) → cân nhắc contrast
  'bg-gray-300': 0.55,
  'bg-gray-400': 0.45,
  'bg-blue-100': 0.7,
  'bg-green-100': 0.7,
  'bg-yellow-100': 0.75,

  // Dark backgrounds - Luminance thấp (<0.3) → dùng text trắng
  'bg-gray-500': 0.35,
  'bg-gray-600': 0.25,
  'bg-gray-700': 0.18,
  'bg-gray-800': 0.12,
  'bg-gray-900': 0.05,
  'bg-black': 0.0,

  // Gradient backgrounds (tối) - dùng text trắng
  'from-blue-500': 0.25,
  'from-blue-600': 0.2,
  'to-blue-600': 0.2,
  'to-blue-700': 0.15,
  'from-green-500': 0.3,
  'from-green-600': 0.25,
  'to-green-600': 0.25,
  'from-orange-500': 0.4,
  'from-orange-600': 0.35,
  'to-orange-600': 0.35,
  'from-purple-500': 0.25,
  'from-purple-600': 0.2,
  'to-purple-600': 0.2,
  'from-yellow-500': 0.6,
  'from-yellow-600': 0.5,
  'to-yellow-600': 0.5,

  // Status colors
  'bg-red-500': 0.28,
  'bg-red-600': 0.22,
  'bg-blue-500': 0.25,
  'bg-blue-600': 0.2,
  'bg-green-500': 0.3,
  'bg-green-600': 0.25,
  'bg-purple-500': 0.25,
  'bg-purple-600': 0.2,
};

/**
 * Xác định màu text tối ưu (đen/trắng) dựa vào background
 * 
 * @param bgColor - Hex color (#FFFFFF) hoặc Tailwind class (bg-gray-900)
 * @returns Tailwind text color class: 'text-black' hoặc 'text-white'
 * 
 * @example
 * getTextColorForBg('#FFFFFF') // => 'text-black'
 * getTextColorForBg('#000000') // => 'text-white'
 * getTextColorForBg('bg-gray-900') // => 'text-white'
 * getTextColorForBg('bg-white') // => 'text-black'
 */
export function getTextColorForBg(bgColor: string): 'text-black' | 'text-white' {
  let luminance = 0.5; // Default to medium

  // Nếu là Tailwind class
  if (bgColor.startsWith('bg-') || bgColor.startsWith('from-') || bgColor.startsWith('to-')) {
    luminance = TAILWIND_BG_LUMINANCE[bgColor] ?? 0.5;
  }
  // Nếu là hex color
  else if (bgColor.startsWith('#')) {
    const rgb = hexToRgb(bgColor);
    if (rgb) {
      luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    }
  }

  // WCAG threshold: Luminance > 0.5 → background sáng → dùng text đen
  return luminance > 0.5 ? 'text-black' : 'text-white';
}

/**
 * Xác định màu text tối ưu cho gradient background
 * Kiểm tra cả 2 màu gradient và chọn màu text phù hợp nhất
 * 
 * @param fromColor - Tailwind gradient from- class
 * @param toColor - Tailwind gradient to- class
 * @returns Tailwind text color class
 * 
 * @example
 * getTextColorForGradient('from-blue-500', 'to-blue-600') // => 'text-white'
 * getTextColorForGradient('from-gray-100', 'to-gray-200') // => 'text-black'
 */
export function getTextColorForGradient(
  fromColor: string,
  toColor: string
): 'text-black' | 'text-white' {
  const fromLuminance = TAILWIND_BG_LUMINANCE[fromColor] ?? 0.5;
  const toLuminance = TAILWIND_BG_LUMINANCE[toColor] ?? 0.5;

  // Dùng luminance trung bình của gradient
  const avgLuminance = (fromLuminance + toLuminance) / 2;

  return avgLuminance > 0.5 ? 'text-black' : 'text-white';
}

/**
 * Tính contrast ratio giữa 2 màu theo WCAG 2.0
 * Minimum contrast ratio:
 * - Normal text: 4.5:1 (AA)
 * - Large text: 3:1 (AA)
 * 
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1Hex: string, color2Hex: string): number {
  const rgb1 = hexToRgb(color1Hex);
  const rgb2 = hexToRgb(color2Hex);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Kiểm tra xem text color có đủ contrast với background không
 * 
 * @param textColor - Text color hex
 * @param bgColor - Background color hex
 * @param isLargeText - Text có phải large text không (>= 18px hoặc bold >= 14px)
 * @returns true nếu đạt chuẩn WCAG AA
 */
export function hasGoodContrast(
  textColor: string,
  bgColor: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(textColor, bgColor);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Helper để dùng trong className với conditional logic
 * 
 * @example
 * <div className={`${getTextColorForBg('bg-gray-900')} font-bold`}>
 *   Text sẽ tự động trắng vì bg tối
 * </div>
 */
export function getTextColorClass(bgColorClass: string): string {
  return getTextColorForBg(bgColorClass);
}
