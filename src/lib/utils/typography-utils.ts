// * Handles typography properties, CSS generation, and format conversion

export interface TypographyProperties {
  id: string;
  // Font properties
  fontFamily: string;
  fontSize: number; // in pixels
  fontWeight: number | string;
  lineHeight: number; // unitless multiplier
  letterSpacing: number; // in pixels

  // Text properties
  textAlign: "left" | "center" | "right" | "justify";
  textDecoration: "none" | "underline" | "line-through" | "overline";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";

  // Color (links to color system)
  color: string; // hex value

  // Position (for context)
  position: {
    x: number;
    y: number;
  };

  // Classification
  type: "heading" | "body" | "caption" | "button" | "label" | "code";
  label?: string; // User-defined label

  // Additional properties
  fontStyle: "normal" | "italic" | "oblique";
  textShadow?: string;
}

export interface FontStackInfo {
  primary: string;
  fallbacks: string[];
  category: "sans-serif" | "serif" | "monospace" | "cursive" | "fantasy";
  webSafe: boolean;
}

// * Common font stacks with web-safe fallbacks
export const FONT_STACKS: Record<string, FontStackInfo> = {
  Inter: {
    primary: "Inter",
    fallbacks: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "sans-serif",
    ],
    category: "sans-serif",
    webSafe: false,
  },
  Roboto: {
    primary: "Roboto",
    fallbacks: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "sans-serif",
    ],
    category: "sans-serif",
    webSafe: false,
  },
  Helvetica: {
    primary: "Helvetica",
    fallbacks: ["Arial", "sans-serif"],
    category: "sans-serif",
    webSafe: true,
  },
  Arial: {
    primary: "Arial",
    fallbacks: ["Helvetica", "sans-serif"],
    category: "sans-serif",
    webSafe: true,
  },
  Georgia: {
    primary: "Georgia",
    fallbacks: ["Times New Roman", "serif"],
    category: "serif",
    webSafe: true,
  },
  "Times New Roman": {
    primary: "Times New Roman",
    fallbacks: ["Times", "serif"],
    category: "serif",
    webSafe: true,
  },
  "Courier New": {
    primary: "Courier New",
    fallbacks: ["Courier", "monospace"],
    category: "monospace",
    webSafe: true,
  },
  Monaco: {
    primary: "Monaco",
    fallbacks: ["Menlo", "Consolas", "Courier New", "monospace"],
    category: "monospace",
    webSafe: false,
  },
};

interface TypographyTokenValue {
  value: string | number | (string | number)[];
  type: string;
}

interface TypographyToken {
  fontFamily: TypographyTokenValue;
  fontSize: TypographyTokenValue;
  fontWeight: TypographyTokenValue;
  lineHeight: TypographyTokenValue;
  letterSpacing: TypographyTokenValue;
  color: TypographyTokenValue;
}

export interface TypographyDesignTokens {
  typography: Record<string, TypographyToken>;
}

// * Generate sample typography properties for simulation
export function generateSampleTypography(
  x: number,
  y: number
): TypographyProperties {
  const samples = [
    {
      fontFamily: "Inter",
      fontSize: 32,
      fontWeight: 700,
      lineHeight: 1.2,
      type: "heading" as const,
      label: "Main Heading",
    },
    {
      fontFamily: "Inter",
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.3,
      type: "heading" as const,
      label: "Section Heading",
    },
    {
      fontFamily: "Inter",
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
      type: "body" as const,
      label: "Body Text",
    },
    {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.4,
      type: "button" as const,
      label: "Button Text",
    },
    {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.4,
      type: "caption" as const,
      label: "Caption Text",
    },
    {
      fontFamily: "Monaco",
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.6,
      type: "code" as const,
      label: "Code Text",
    },
  ];

  const sample = samples[Math.floor(Math.random() * samples.length)];

  return {
    id: `typography-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...sample,
    letterSpacing: sample.type === "heading" ? -0.5 : 0,
    textAlign: "left",
    textDecoration: "none",
    textTransform: "none",
    color: "#000000",
    position: { x, y },
    fontStyle: "normal",
  };
}

// * Format typography properties as CSS
export function formatTypographyAsCSS(
  typography: TypographyProperties
): string {
  const fontStack = FONT_STACKS[typography.fontFamily];
  const fontFamily = fontStack
    ? `"${fontStack.primary}", ${fontStack.fallbacks.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ")}`
    : typography.fontFamily;

  return `/* ${typography.label || typography.type} */
font-family: ${fontFamily};
font-size: ${typography.fontSize}px;
font-weight: ${typography.fontWeight};
line-height: ${typography.lineHeight};
letter-spacing: ${typography.letterSpacing}px;
color: ${typography.color};
text-align: ${typography.textAlign};
text-decoration: ${typography.textDecoration};
text-transform: ${typography.textTransform};
font-style: ${typography.fontStyle};${typography.textShadow ? `\ntext-shadow: ${typography.textShadow};` : ""}`;
}

// * Format typography properties as Tailwind CSS classes
export function formatTypographyAsTailwind(
  typography: TypographyProperties
): string {
  const tailwindClasses: string[] = [];

  // Font family (simplified mapping)
  if (typography.fontFamily.toLowerCase().includes("mono")) {
    tailwindClasses.push("font-mono");
  } else if (typography.fontFamily.toLowerCase().includes("serif")) {
    tailwindClasses.push("font-serif");
  } else {
    tailwindClasses.push("font-sans");
  }

  // Font size (common Tailwind sizes)
  const sizeMap: Record<number, string> = {
    12: "text-xs",
    14: "text-sm",
    16: "text-base",
    18: "text-lg",
    20: "text-xl",
    24: "text-2xl",
    30: "text-3xl",
    32: "text-3xl",
    36: "text-4xl",
    48: "text-5xl",
  };

  const closestSize = Object.keys(sizeMap)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - typography.fontSize) <
      Math.abs(prev - typography.fontSize)
        ? curr
        : prev
    );
  tailwindClasses.push(sizeMap[closestSize] || "text-base");

  // Font weight
  const weightMap: Record<number | string, string> = {
    100: "font-thin",
    200: "font-extralight",
    300: "font-light",
    400: "font-normal",
    500: "font-medium",
    600: "font-semibold",
    700: "font-bold",
    800: "font-extrabold",
    900: "font-black",
    normal: "font-normal",
    bold: "font-bold",
  };
  tailwindClasses.push(weightMap[typography.fontWeight] || "font-normal");

  // Line height (approximate)
  if (typography.lineHeight <= 1.2) tailwindClasses.push("leading-tight");
  else if (typography.lineHeight <= 1.4) tailwindClasses.push("leading-snug");
  else if (typography.lineHeight <= 1.6) tailwindClasses.push("leading-normal");
  else tailwindClasses.push("leading-relaxed");

  // Text alignment
  if (typography.textAlign !== "left") {
    tailwindClasses.push(`text-${typography.textAlign}`);
  }

  // Text decoration
  if (typography.textDecoration !== "none") {
    tailwindClasses.push(
      `${typography.textDecoration === "line-through" ? "line-through" : "underline"}`
    );
  }

  // Text transform
  if (typography.textTransform !== "none") {
    tailwindClasses.push(typography.textTransform);
  }

  // Font style
  if (typography.fontStyle === "italic") {
    tailwindClasses.push("italic");
  }

  return `/* ${typography.label || typography.type} */
className="${tailwindClasses.join(" ")}"

<!-- Note: Color and letter-spacing may need custom values -->
${typography.color !== "#000000" ? `<!-- color: ${typography.color} -->` : ""}
${typography.letterSpacing !== 0 ? `<!-- letter-spacing: ${typography.letterSpacing}px -->` : ""}`;
}

// * Format typography properties as CSS custom properties
export function formatTypographyAsCustomProperties(
  typography: TypographyProperties
): string {
  const kebabLabel = (typography.label || typography.type)
    .toLowerCase()
    .replace(/\s+/g, "-");
  const fontStack = FONT_STACKS[typography.fontFamily];
  const fontFamily = fontStack
    ? `"${fontStack.primary}", ${fontStack.fallbacks.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ")}`
    : typography.fontFamily;

  return `/* ${typography.label || typography.type} CSS Custom Properties */
--${kebabLabel}-font-family: ${fontFamily};
--${kebabLabel}-font-size: ${typography.fontSize}px;
--${kebabLabel}-font-weight: ${typography.fontWeight};
--${kebabLabel}-line-height: ${typography.lineHeight};
--${kebabLabel}-letter-spacing: ${typography.letterSpacing}px;
--${kebabLabel}-color: ${typography.color};
--${kebabLabel}-text-align: ${typography.textAlign};

/* Usage example */
.${kebabLabel} {
  font-family: var(--${kebabLabel}-font-family);
  font-size: var(--${kebabLabel}-font-size);
  font-weight: var(--${kebabLabel}-font-weight);
  line-height: var(--${kebabLabel}-line-height);
  letter-spacing: var(--${kebabLabel}-letter-spacing);
  color: var(--${kebabLabel}-color);
  text-align: var(--${kebabLabel}-text-align);
}`;
}

// * Generate complete CSS file content with all typography
export function generateTypographyCSS(
  typographyList: TypographyProperties[]
): string {
  const header = `/* Generated Typography Styles */
/* Created: ${new Date().toLocaleString()} */

`;

  const styles = typographyList
    .map((typography, index) => {
      const className = (typography.label || `${typography.type}-${index + 1}`)
        .toLowerCase()
        .replace(/\s+/g, "-");

      const fontStack = FONT_STACKS[typography.fontFamily];
      const fontFamily = fontStack
        ? `"${fontStack.primary}", ${fontStack.fallbacks.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ")}`
        : typography.fontFamily;

      return `.${className} {
  font-family: ${fontFamily};
  font-size: ${typography.fontSize}px;
  font-weight: ${typography.fontWeight};
  line-height: ${typography.lineHeight};
  letter-spacing: ${typography.letterSpacing}px;
  color: ${typography.color};
  text-align: ${typography.textAlign};
  text-decoration: ${typography.textDecoration};
  text-transform: ${typography.textTransform};
  font-style: ${typography.fontStyle};${typography.textShadow ? `\n  text-shadow: ${typography.textShadow};` : ""}
}`;
    })
    .join("\n\n");

  return header + styles;
}

// * Convert typography to design tokens format
export function typographyToDesignTokens(
  typographyList: TypographyProperties[]
): TypographyDesignTokens {
  const tokens: TypographyDesignTokens = {
    typography: {},
  };

  typographyList.forEach((typography) => {
    const tokenName = (typography.label || typography.type)
      .toLowerCase()
      .replace(/\s+/g, "-");

    const fontStack = FONT_STACKS[typography.fontFamily];

    tokens.typography[tokenName] = {
      fontFamily: {
        value: fontStack
          ? [fontStack.primary, ...fontStack.fallbacks]
          : [typography.fontFamily],
        type: "fontFamily",
      },
      fontSize: {
        value: `${typography.fontSize}px`,
        type: "fontSize",
      },
      fontWeight: {
        value: typography.fontWeight,
        type: "fontWeight",
      },
      lineHeight: {
        value: typography.lineHeight,
        type: "lineHeight",
      },
      letterSpacing: {
        value: `${typography.letterSpacing}px`,
        type: "letterSpacing",
      },
      color: {
        value: typography.color,
        type: "color",
      },
    };
  });

  return tokens;
}

// * Calculate text metrics and recommendations
export function analyzeTypography(typography: TypographyProperties) {
  const analysis = {
    readability: "good" as "excellent" | "good" | "fair" | "poor",
    recommendations: [] as string[],
    metrics: {
      lineHeightPx: typography.fontSize * typography.lineHeight,
      characterWidth: typography.fontSize * 0.6, // approximate
      recommendedLineLength: "45-75 characters",
    },
  };

  // Line height analysis
  if (typography.lineHeight < 1.2) {
    analysis.readability = "poor";
    analysis.recommendations.push(
      "Increase line height for better readability (minimum 1.2)"
    );
  } else if (typography.lineHeight < 1.4 && typography.type === "body") {
    analysis.readability = "fair";
    analysis.recommendations.push(
      "Consider increasing line height for body text (1.4-1.6 recommended)"
    );
  }

  // Font size analysis
  if (typography.fontSize < 14 && typography.type === "body") {
    analysis.readability = "fair";
    analysis.recommendations.push(
      "Consider larger font size for body text (16px+ recommended)"
    );
  }

  // Letter spacing analysis
  if (typography.letterSpacing > 2) {
    analysis.recommendations.push(
      "Letter spacing might be too loose for optimal readability"
    );
  } else if (typography.letterSpacing < -2) {
    analysis.recommendations.push(
      "Letter spacing might be too tight for optimal readability"
    );
  }

  // Font weight analysis
  if (
    typeof typography.fontWeight === "number" &&
    typography.fontWeight < 300 &&
    typography.fontSize < 16
  ) {
    analysis.readability = "fair";
    analysis.recommendations.push(
      "Light font weights may be hard to read at small sizes"
    );
  }

  return analysis;
}
