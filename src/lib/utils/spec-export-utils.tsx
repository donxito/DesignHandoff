// * Handles JSON, CSS, and PDF export functionality

import { ColorInfo } from "@/lib/utils/color-utils";
import {
  TypographyProperties,
  generateTypographyCSS,
  typographyToDesignTokens,
  TypographyDesignTokens,
} from "@/lib/utils/typography-utils";

// * HTML escape utility to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface Measurement {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  distance: number;
  angle: number;
}

export interface SpacingMeasurement {
  id: string;
  points: { x: number; y: number }[];
  measurements: {
    horizontal: number;
    vertical: number;
    diagonal: number;
  };
  type: "margin" | "padding" | "spacing";
  label?: string;
}

export interface GridSettings {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
}

export interface GuidelineSettings {
  enabled: boolean;
  showMargins: boolean;
  showPadding: boolean;
  marginColor: string;
  paddingColor: string;
}

export interface DesignSpecification {
  // Metadata
  fileName: string;
  projectName?: string;
  createdAt: string;
  version: string;

  // Design data
  colors: ColorInfo[];
  typography: TypographyProperties[];
  measurements: Measurement[];

  // NEW: Advanced measurements
  spacingMeasurements?: SpacingMeasurement[];
  gridSettings?: GridSettings;
  guidelineSettings?: GuidelineSettings;

  // Image info
  imageUrl: string;
  imageDimensions?: {
    width: number;
    height: number;
  };
}

export interface ExportOptions {
  format: "json" | "css" | "pdf" | "design-tokens";
  includeColors: boolean;
  includeTypography: boolean;
  includeMeasurements: boolean;
  includeMetadata: boolean;
}

interface DesignTokensMetadata {
  tokenSetOrder: string[];
  fileName?: string;
  projectName?: string;
  createdAt?: string;
  version?: string;
}

interface ColorToken {
  $value: string;
  $type: "color";
  $description: string;
}

interface SpacingToken {
  $value: string;
  $type: "dimension";
  $description: string;
}

interface DesignTokens {
  $metadata: DesignTokensMetadata;
  colors: Record<string, ColorToken>;
  typography: TypographyDesignTokens;
  spacing: Record<string, SpacingToken>;
}

// * Generate complete design specification object
export function createDesignSpecification(
  fileName: string,
  colors: ColorInfo[],
  typography: TypographyProperties[],
  measurements: Measurement[],
  imageUrl: string,
  projectName?: string,
  imageDimensions?: { width: number; height: number },
  spacingMeasurements?: SpacingMeasurement[],
  gridSettings?: GridSettings,
  guidelineSettings?: GuidelineSettings
): DesignSpecification {
  return {
    fileName,
    projectName,
    createdAt: new Date().toISOString(),
    version: "1.0.0",
    colors,
    typography,
    measurements,
    spacingMeasurements,
    gridSettings,
    guidelineSettings,
    imageUrl,
    imageDimensions,
  };
}

// * Export specification as JSON
export function exportAsJSON(
  spec: DesignSpecification,
  options: ExportOptions
): string {
  const filteredSpec: Partial<DesignSpecification> = {};

  // Always include metadata if requested
  if (options.includeMetadata) {
    filteredSpec.fileName = spec.fileName;
    filteredSpec.projectName = spec.projectName;
    filteredSpec.createdAt = spec.createdAt;
    filteredSpec.version = spec.version;
    filteredSpec.imageUrl = spec.imageUrl;
    filteredSpec.imageDimensions = spec.imageDimensions;
  }

  // Include specific data types based on options
  if (options.includeColors) {
    filteredSpec.colors = spec.colors;
  }

  if (options.includeTypography) {
    filteredSpec.typography = spec.typography;
  }

  if (options.includeMeasurements) {
    filteredSpec.measurements = spec.measurements;
    filteredSpec.spacingMeasurements = spec.spacingMeasurements;
    filteredSpec.gridSettings = spec.gridSettings;
    filteredSpec.guidelineSettings = spec.guidelineSettings;
  }

  return JSON.stringify(filteredSpec, null, 2);
}

// * Export specification as CSS
export function exportAsCSS(
  spec: DesignSpecification,
  options: ExportOptions
): string {
  let css = `/* Design Specification CSS */\n`;
  css += `/* File: ${spec.fileName} */\n`;
  css += `/* Generated: ${new Date().toLocaleString()} */\n\n`;

  // CSS Variables Section
  if (options.includeColors || options.includeTypography) {
    css += `:root {\n`;

    // Color variables
    if (options.includeColors && spec.colors.length > 0) {
      css += `  /* Colors */\n`;
      spec.colors.forEach((color, index) => {
        const colorName = `color-${index + 1}`;
        css += `  --${colorName}: ${color.hex};\n`;
        css += `  --${colorName}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
      });
      css += `\n`;
    }

    // Typography variables
    if (options.includeTypography && spec.typography.length > 0) {
      css += `  /* Typography */\n`;
      spec.typography.forEach((typo) => {
        const name = (typo.label || typo.type)
          .toLowerCase()
          .replace(/\s+/g, "-");
        css += `  --${name}-font-family: "${typo.fontFamily}";\n`;
        css += `  --${name}-font-size: ${typo.fontSize}px;\n`;
        css += `  --${name}-font-weight: ${typo.fontWeight};\n`;
        css += `  --${name}-line-height: ${typo.lineHeight};\n`;
        css += `  --${name}-letter-spacing: ${typo.letterSpacing}px;\n`;
        css += `  --${name}-color: ${typo.color};\n`;
      });
    }

    css += `}\n\n`;
  }

  // Typography classes
  if (options.includeTypography && spec.typography.length > 0) {
    css += generateTypographyCSS(spec.typography);
    css += `\n\n`;
  }

  // Color utility classes
  if (options.includeColors && spec.colors.length > 0) {
    css += `/* Color Utility Classes */\n`;
    spec.colors.forEach((color, index) => {
      const colorName = `color-${index + 1}`;
      css += `.bg-${colorName} { background-color: var(--${colorName}); }\n`;
      css += `.text-${colorName} { color: var(--${colorName}); }\n`;
      css += `.border-${colorName} { border-color: var(--${colorName}); }\n\n`;
    });
  }

  // Measurements as comments
  if (options.includeMeasurements && spec.measurements.length > 0) {
    css += `/* Measurements */\n`;
    spec.measurements.forEach((measurement, index) => {
      css += `/* Measurement ${index + 1}: ${measurement.distance}px `;
      css += `from (${measurement.startPoint.x}, ${measurement.startPoint.y}) `;
      css += `to (${measurement.endPoint.x}, ${measurement.endPoint.y}) */\n`;
    });
    css += `\n`;
  }

  // NEW: Spacing measurements as comments
  if (
    options.includeMeasurements &&
    spec.spacingMeasurements &&
    spec.spacingMeasurements.length > 0
  ) {
    css += `/* Spacing Measurements */\n`;
    spec.spacingMeasurements.forEach((spacing, index) => {
      css += `/* ${spacing.label || `Spacing ${index + 1}`}: `;
      css += `${spacing.measurements.horizontal}×${spacing.measurements.vertical}px `;
      css += `(${spacing.type}) */\n`;
    });
    css += `\n`;
  }

  // NEW: Grid settings as CSS variables
  if (
    options.includeMeasurements &&
    spec.gridSettings &&
    spec.gridSettings.enabled
  ) {
    css += `/* Grid Settings */\n`;
    css += `:root {\n`;
    css += `  --grid-size: ${spec.gridSettings.size}px;\n`;
    css += `  --grid-color: ${spec.gridSettings.color};\n`;
    css += `  --grid-opacity: ${spec.gridSettings.opacity};\n`;
    css += `}\n\n`;
    css += `.grid-overlay {\n`;
    css += `  background-image: linear-gradient(var(--grid-color) 1px, transparent 1px),\n`;
    css += `                    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);\n`;
    css += `  background-size: var(--grid-size) var(--grid-size);\n`;
    css += `  opacity: var(--grid-opacity);\n`;
    css += `}\n\n`;
  }

  return css;
}

// * Export specification as design tokens
export function exportAsDesignTokens(
  spec: DesignSpecification,
  options: ExportOptions
): string {
  const tokens: DesignTokens = {
    $metadata: {
      tokenSetOrder: [] as string[],
    },
    colors: {},
    typography: { typography: {} },
    spacing: {},
  };

  if (options.includeMetadata) {
    tokens.$metadata.fileName = spec.fileName;
    tokens.$metadata.projectName = spec.projectName;
    tokens.$metadata.createdAt = spec.createdAt;
    tokens.$metadata.version = spec.version;
  }

  // Color tokens
  if (options.includeColors && spec.colors.length > 0) {
    tokens.colors = {};
    tokens.$metadata.tokenSetOrder.push("colors");

    spec.colors.forEach((color, index) => {
      const colorName = `color-${index + 1}`;
      tokens.colors[colorName] = {
        $value: color.hex,
        $type: "color",
        $description: `RGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b} | HSL: ${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`,
      };
    });
  }

  // Typography tokens
  if (options.includeTypography && spec.typography.length > 0) {
    const typographyTokens = typographyToDesignTokens(spec.typography);
    tokens.typography = typographyTokens;
    tokens.$metadata.tokenSetOrder.push("typography");
  }

  // Spacing tokens (from measurements)
  if (options.includeMeasurements && spec.measurements.length > 0) {
    tokens.spacing = {};
    tokens.$metadata.tokenSetOrder.push("spacing");

    // Create unique spacing values from measurements
    const uniqueDistances = [
      ...new Set(spec.measurements.map((m) => m.distance)),
    ].sort((a, b) => a - b);

    uniqueDistances.forEach((distance) => {
      const spacingName = `spacing-${distance}`;
      tokens.spacing[spacingName] = {
        $value: `${distance}px`,
        $type: "dimension",
        $description: `Extracted from design measurements`,
      };
    });
  }

  return JSON.stringify(tokens, null, 2);
}

// * Generate downloadable file content
export function generateDownloadableFile(
  spec: DesignSpecification,
  options: ExportOptions
): { content: string; filename: string; mimeType: string } {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
  const baseName = spec.fileName.replace(/\.[^/.]+$/, "");

  switch (options.format) {
    case "json":
      return {
        content: exportAsJSON(spec, options),
        filename: `${baseName}-spec-${timestamp}.json`,
        mimeType: "application/json",
      };

    case "css":
      return {
        content: exportAsCSS(spec, options),
        filename: `${baseName}-styles-${timestamp}.css`,
        mimeType: "text/css",
      };

    case "design-tokens":
      return {
        content: exportAsDesignTokens(spec, options),
        filename: `${baseName}-tokens-${timestamp}.json`,
        mimeType: "application/json",
      };

    case "pdf":
      // PDF export generates HTML that can be printed to PDF via browser
      // or used with react-to-print
      return {
        content: generatePDFContent(spec),
        filename: `${baseName}-spec-${timestamp}.html`,
        mimeType: "text/html",
      };

    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// * Download file to user's computer
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// * Generate comprehensive specification export
export function exportComprehensiveSpec(
  spec: DesignSpecification,
  format: "json" | "css" | "design-tokens" = "json"
): void {
  const options: ExportOptions = {
    format,
    includeColors: true,
    includeTypography: true,
    includeMeasurements: true,
    includeMetadata: true,
  };

  const fileData = generateDownloadableFile(spec, options);
  downloadFile(fileData.content, fileData.filename, fileData.mimeType);
}

// * Generate PDF specification report (HTML content for react-to-print)
export function generatePDFContent(spec: DesignSpecification): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Design Specification - ${escapeHtml(spec.fileName)}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .header {
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: bold;
        }
        
        .metadata {
          color: #666;
          font-size: 14px;
        }
        
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        
        .section h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #eee;
        }
        
        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .color-item {
          border: 2px solid #000;
          padding: 15px;
        }
        
        .color-preview {
          width: 100%;
          height: 60px;
          border: 1px solid #ddd;
          margin-bottom: 10px;
        }
        
        .color-info {
          font-family: monospace;
          font-size: 12px;
        }
        
        .typography-item {
          border: 2px solid #000;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .typography-preview {
          margin-bottom: 15px;
          padding: 10px;
          background: #f9f9f9;
        }
        
        .typography-details {
          font-family: monospace;
          font-size: 12px;
          background: #f5f5f5;
          padding: 10px;
          border-left: 3px solid #000;
        }
        
        .measurements-list {
          list-style: none;
          padding: 0;
        }
        
        .measurement-item {
          background: #f9f9f9;
          padding: 15px;
          margin-bottom: 10px;
          border-left: 3px solid #000;
        }
        
        .code-block {
          background: #f5f5f5;
          padding: 15px;
          font-family: monospace;
          font-size: 12px;
          white-space: pre-wrap;
          border: 1px solid #ddd;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Design Specification</h1>
        <div class="metadata">
          <p><strong>File:</strong> ${escapeHtml(spec.fileName)}</p>
          ${spec.projectName ? `<p><strong>Project:</strong> ${escapeHtml(spec.projectName)}</p>` : ""}
          <p><strong>Generated:</strong> ${escapeHtml(new Date(spec.createdAt).toLocaleString())}</p>
          <p><strong>Version:</strong> ${escapeHtml(spec.version)}</p>
        </div>
      </div>

      ${
        spec.colors.length > 0
          ? `
      <div class="section">
        <h2>Color Palette (${spec.colors.length} colors)</h2>
        <div class="color-grid">
          ${spec.colors
            .map(
              (color) => `
            <div class="color-item">
              <div class="color-preview" style="background-color: ${color.hex};"></div>
              <div class="color-info">
                <div><strong>HEX:</strong> ${color.hex.toUpperCase()}</div>
                <div><strong>RGB:</strong> ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}</div>
                <div><strong>HSL:</strong> ${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%</div>
                <div><strong>Contrast:</strong> ${color.contrast.rating}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      `
          : ""
      }

      ${
        spec.typography.length > 0
          ? `
      <div class="section">
        <h2>Typography (${spec.typography.length} styles)</h2>
        ${spec.typography
          .map(
            (typo) => `
          <div class="typography-item">
            <div class="typography-preview" style="
              font-family: '${escapeHtml(typo.fontFamily)}', sans-serif;
              font-size: ${Math.min(typo.fontSize, 24)}px;
              font-weight: ${typo.fontWeight};
              line-height: ${typo.lineHeight};
              letter-spacing: ${typo.letterSpacing}px;
              color: ${escapeHtml(typo.color)};
            ">
              ${escapeHtml(typo.label || `Sample ${typo.type} text`)}
            </div>
            <div class="typography-details">
              <div><strong>Font Family:</strong> ${escapeHtml(typo.fontFamily)}</div>
              <div><strong>Font Size:</strong> ${typo.fontSize}px</div>
              <div><strong>Font Weight:</strong> ${typo.fontWeight}</div>
              <div><strong>Line Height:</strong> ${typo.lineHeight}</div>
              <div><strong>Letter Spacing:</strong> ${typo.letterSpacing}px</div>
              <div><strong>Color:</strong> ${escapeHtml(typo.color)}</div>
              <div><strong>Type:</strong> ${escapeHtml(typo.type)}</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        spec.measurements.length > 0
          ? `
      <div class="section">
        <h2>Measurements (${spec.measurements.length} items)</h2>
        <ul class="measurements-list">
          ${spec.measurements
            .map(
              (measurement, index) => `
            <li class="measurement-item">
              <div><strong>Measurement ${index + 1}:</strong> ${measurement.distance}px</div>
              <div><strong>From:</strong> (${measurement.startPoint.x}, ${measurement.startPoint.y})</div>
              <div><strong>To:</strong> (${measurement.endPoint.x}, ${measurement.endPoint.y})</div>
              <div><strong>Angle:</strong> ${measurement.angle.toFixed(1)}°</div>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
      `
          : ""
      }

      <div class="section">
        <h2>Summary</h2>
        <ul>
          <li><strong>Colors:</strong> ${spec.colors.length} extracted</li>
          <li><strong>Typography:</strong> ${spec.typography.length} styles</li>
          <li><strong>Measurements:</strong> ${spec.measurements.length} taken</li>
          <li><strong>Generated:</strong> ${new Date(spec.createdAt).toLocaleString()}</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  return html;
}

// * Printable component reference for react-to-print
export const PrintableSpecification = ({
  spec,
}: {
  spec: DesignSpecification;
}) => {
  return (
    <div style={{ padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          borderBottom: "3px solid #000",
          paddingBottom: "20px",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: "bold" }}
        >
          Design Specification
        </h1>
        <div style={{ color: "#666", fontSize: "14px" }}>
          <p>
            <strong>File:</strong> {spec.fileName}
          </p>
          {spec.projectName && (
            <p>
              <strong>Project:</strong> {spec.projectName}
            </p>
          )}
          <p>
            <strong>Generated:</strong>{" "}
            {new Date(spec.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Version:</strong> {spec.version}
          </p>
        </div>
      </div>

      {/* Colors Section */}
      {spec.colors.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "2px solid #eee",
            }}
          >
            Color Palette ({spec.colors.length} colors)
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {spec.colors.map((color, index) => (
              <div
                key={index}
                style={{ border: "2px solid #000", padding: "15px" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "60px",
                    backgroundColor: color.hex,
                    border: "1px solid #ddd",
                    marginBottom: "10px",
                  }}
                />
                <div style={{ fontFamily: "monospace", fontSize: "12px" }}>
                  <div>
                    <strong>HEX:</strong> {color.hex.toUpperCase()}
                  </div>
                  <div>
                    <strong>RGB:</strong> {color.rgb.r}, {color.rgb.g},{" "}
                    {color.rgb.b}
                  </div>
                  <div>
                    <strong>HSL:</strong> {color.hsl.h}°, {color.hsl.s}%,{" "}
                    {color.hsl.l}%
                  </div>
                  <div>
                    <strong>Contrast:</strong> {color.contrast.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typography Section */}
      {spec.typography.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "2px solid #eee",
            }}
          >
            Typography ({spec.typography.length} styles)
          </h2>
          {spec.typography.map((typo, index) => (
            <div
              key={index}
              style={{
                border: "2px solid #000",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  background: "#f9f9f9",
                  fontFamily: typo.fontFamily,
                  fontSize: `${Math.min(typo.fontSize, 24)}px`,
                  fontWeight: typo.fontWeight,
                  lineHeight: typo.lineHeight,
                  letterSpacing: `${typo.letterSpacing}px`,
                  color: typo.color,
                }}
              >
                {typo.label || `Sample ${typo.type} text`}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  background: "#f5f5f5",
                  padding: "10px",
                  borderLeft: "3px solid #000",
                }}
              >
                <div>
                  <strong>Font Family:</strong> {typo.fontFamily}
                </div>
                <div>
                  <strong>Font Size:</strong> {typo.fontSize}px
                </div>
                <div>
                  <strong>Font Weight:</strong> {typo.fontWeight}
                </div>
                <div>
                  <strong>Line Height:</strong> {typo.lineHeight}
                </div>
                <div>
                  <strong>Letter Spacing:</strong> {typo.letterSpacing}px
                </div>
                <div>
                  <strong>Color:</strong> {typo.color}
                </div>
                <div>
                  <strong>Type:</strong> {typo.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Measurements Section */}
      {spec.measurements.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "2px solid #eee",
            }}
          >
            Measurements ({spec.measurements.length} items)
          </h2>
          {spec.measurements.map((measurement, index) => (
            <div
              key={index}
              style={{
                background: "#f9f9f9",
                padding: "15px",
                marginBottom: "10px",
                borderLeft: "3px solid #000",
              }}
            >
              <div>
                <strong>Measurement {index + 1}:</strong> {measurement.distance}
                px
              </div>
              <div>
                <strong>From:</strong> ({measurement.startPoint.x},{" "}
                {measurement.startPoint.y})
              </div>
              <div>
                <strong>To:</strong> ({measurement.endPoint.x},{" "}
                {measurement.endPoint.y})
              </div>
              <div>
                <strong>Angle:</strong> {measurement.angle.toFixed(1)}°
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spacing Measurements Section */}
      {spec.spacingMeasurements && spec.spacingMeasurements.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "2px solid #eee",
            }}
          >
            Spacing Measurements ({spec.spacingMeasurements.length} items)
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
            }}
          >
            {spec.spacingMeasurements.map((spacing, index) => (
              <div
                key={spacing.id}
                style={{
                  border: "2px solid #000",
                  padding: "15px",
                  borderRadius: "4px",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                  {spacing.label || `Spacing ${index + 1}`}
                </h3>
                <div style={{ fontSize: "12px" }}>
                  <div>
                    <strong>Type:</strong>{" "}
                    {spacing.type.charAt(0).toUpperCase() +
                      spacing.type.slice(1)}
                  </div>
                  <div>
                    <strong>Width:</strong> {spacing.measurements.horizontal}px
                  </div>
                  <div>
                    <strong>Height:</strong> {spacing.measurements.vertical}px
                  </div>
                  <div>
                    <strong>Diagonal:</strong> {spacing.measurements.diagonal}px
                  </div>
                  <div>
                    <strong>Points:</strong> {spacing.points.length} selected
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Settings Section */}
      {spec.gridSettings && spec.gridSettings.enabled && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "2px solid #eee",
            }}
          >
            Grid Configuration
          </h2>
          <div
            style={{
              border: "2px solid #000",
              padding: "15px",
              borderRadius: "4px",
            }}
          >
            <div style={{ fontSize: "12px" }}>
              <div>
                <strong>Grid Size:</strong> {spec.gridSettings.size}px
              </div>
              <div>
                <strong>Grid Color:</strong> {spec.gridSettings.color}
              </div>
              <div>
                <strong>Opacity:</strong>{" "}
                {Math.round(spec.gridSettings.opacity * 100)}%
              </div>
              <div>
                <strong>Snap to Grid:</strong>{" "}
                {spec.gridSettings.snapToGrid ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "15px",
            paddingBottom: "10px",
            borderBottom: "2px solid #eee",
          }}
        >
          Summary
        </h2>
        <ul style={{ listStyle: "none", padding: "0" }}>
          <li style={{ marginBottom: "5px" }}>
            <strong>Colors:</strong> {spec.colors.length} extracted
          </li>
          <li style={{ marginBottom: "5px" }}>
            <strong>Typography:</strong> {spec.typography.length} styles
          </li>
          <li style={{ marginBottom: "5px" }}>
            <strong>Measurements:</strong> {spec.measurements.length} taken
          </li>
          {spec.spacingMeasurements && (
            <li style={{ marginBottom: "5px" }}>
              <strong>Spacing Measurements:</strong>{" "}
              {spec.spacingMeasurements.length} areas
            </li>
          )}
          <li style={{ marginBottom: "5px" }}>
            <strong>Generated:</strong>{" "}
            {new Date(spec.createdAt).toLocaleString()}
          </li>
        </ul>
      </div>
    </div>
  );
};
