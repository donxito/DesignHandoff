export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface ColorInfo {
  hex: string;
  rgb: RGBColor;
  hsl: HSLColor;
  brightness: number;
  contrast: {
    white: number;
    black: number;
    rating: "AAA" | "AA" | "A" | "Fail";
  };
}

// * Convert RGB values to hex string
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// * Convert hex string to RGB object
export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error("Invalid hex color");
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// * Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// * Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// * Calculate relative luminance for contrast calculations
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// * Calculate contrast ratio between two colors
export function getContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// * Get accessibility rating for contrast ratio
function getContrastRating(ratio: number): "AAA" | "AA" | "A" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "A";
  return "Fail";
}

// * Calculate color brightness (perceived brightness)
function getColorBrightness(r: number, g: number, b: number): number {
  // Using the relative luminance formula but simplified for perceived brightness
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// * Get comprehensive color information from RGB values
export function getColorInfo(r: number, g: number, b: number): ColorInfo {
  const rgb = { r, g, b };
  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const brightness = getColorBrightness(r, g, b);

  // Calculate contrast ratios with white and black
  const whiteContrast = getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const blackContrast = getContrastRatio(rgb, { r: 0, g: 0, b: 0 });

  // Determine the best contrast rating
  const bestContrast = Math.max(whiteContrast, blackContrast);
  const rating = getContrastRating(bestContrast);

  return {
    hex,
    rgb,
    hsl,
    brightness,
    contrast: {
      white: Math.round(whiteContrast * 100) / 100,
      black: Math.round(blackContrast * 100) / 100,
      rating,
    },
  };
}

// * Extract color from canvas at specific coordinates
export function extractColorFromCanvas(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): ColorInfo | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    return getColorInfo(r, g, b);
  } catch (error) {
    console.error("Error extracting color from canvas:", error);
    return null;
  }
}

// * Format color in different formats for copying
export function formatColor(
  colorInfo: ColorInfo,
  format: "hex" | "rgb" | "hsl" | "css"
): string {
  switch (format) {
    case "hex":
      return colorInfo.hex.toUpperCase();

    case "rgb":
      return `rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`;

    case "hsl":
      return `hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`;

    case "css":
      return `/* Color: ${colorInfo.hex.toUpperCase()} */
background-color: ${colorInfo.hex};
color: ${colorInfo.contrast.white > colorInfo.contrast.black ? "#ffffff" : "#000000"};

/* RGB: ${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b} */
/* HSL: ${colorInfo.hsl.h}°, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}% */
/* Contrast with white: ${colorInfo.contrast.white}:1 */
/* Contrast with black: ${colorInfo.contrast.black}:1 */
/* Accessibility: ${colorInfo.contrast.rating} */`;

    default:
      return colorInfo.hex;
  }
}

// * Generate a palette of similar colors
export function generateColorVariations(baseColor: ColorInfo): ColorInfo[] {
  const variations: ColorInfo[] = [];
  const { h, s, l } = baseColor.hsl;

  // Generate lightness variations
  const lightnessSteps = [-40, -20, -10, 0, 10, 20, 40];

  lightnessSteps.forEach((step) => {
    const newL = Math.max(0, Math.min(100, l + step));
    if (newL !== l) {
      // Don't include the original color
      const newRgb = hslToRgb(h, s, newL);
      variations.push(getColorInfo(newRgb.r, newRgb.g, newRgb.b));
    }
  });

  return variations;
}

// * Check if two colors are similar (for deduplication)
export function areColorsSimilar(
  color1: ColorInfo,
  color2: ColorInfo,
  threshold: number = 10
): boolean {
  const rDiff = Math.abs(color1.rgb.r - color2.rgb.r);
  const gDiff = Math.abs(color1.rgb.g - color2.rgb.g);
  const bDiff = Math.abs(color1.rgb.b - color2.rgb.b);

  return rDiff <= threshold && gDiff <= threshold && bDiff <= threshold;
}

// * Sort colors by brightness
export function sortColorsByBrightness(colors: ColorInfo[]): ColorInfo[] {
  return [...colors].sort((a, b) => b.brightness - a.brightness);
}

// * Sort colors by hue
export function sortColorsByHue(colors: ColorInfo[]): ColorInfo[] {
  return [...colors].sort((a, b) => a.hsl.h - b.hsl.h);
}
