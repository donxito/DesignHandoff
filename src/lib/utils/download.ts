// ? Download utilities for handling file downloads

// * Triggers a download for a given URL or blob

export function downloadFile(url: string, filename: string): void {
  if (typeof window === "undefined") {
    console.warn("downloadFile called on server side");
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// * Downloads a blob as a file

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") {
    console.warn("downloadBlob called on server side");
    return;
  }

  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);

  // Clean up the blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// * Downloads data as a JSON file

export function downloadJSON(
  data: Record<string, unknown> | Array<unknown>,
  filename: string
): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  downloadBlob(
    blob,
    filename.endsWith(".json") ? filename : `${filename}.json`
  );
}

// * Downloads text content as a file

export function downloadText(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

// * Fetches a URL and triggers download

export async function downloadFromUrl(
  url: string,
  filename?: string
): Promise<void> {
  if (typeof window === "undefined") {
    console.warn("downloadFromUrl called on server side");
    return;
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // Extract filename from URL if not provided
    const downloadFilename = filename || url.split("/").pop() || "download";

    downloadBlob(blob, downloadFilename);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error("Failed to download file");
  }
}
