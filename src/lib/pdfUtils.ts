import { PDFDocument as LibPDFDocument, rgb } from "pdf-lib";
import type { Block } from "@/types";

/**
 * Render a single PDF page to a canvas element using pdf.js
 */
export async function renderPageToCanvas(
  arrayBuffer: ArrayBuffer,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale = 1.5
): Promise<void> {
  // Dynamically import pdf.js to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageIndex + 1);

  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;
}

/**
 * Embed all filled blocks into the PDF and return a Blob ready for download/email
 */
export async function exportSignedPDF(
  originalBuffer: ArrayBuffer,
  blocks: Block[],
  canvasDimensions: { width: number; height: number },
  scale: number
): Promise<Blob> {
  const pdfDoc = await LibPDFDocument.load(originalBuffer);
  const pages = pdfDoc.getPages();

  for (const block of blocks) {
    if (!block.filled || !block.dataUrl) continue;
    const page = pages[block.pageIndex];
    if (!page) continue;

    const { width: pW, height: pH } = page.getSize();
    const scaleX = pW / (canvasDimensions.width / scale);
    const scaleY = pH / (canvasDimensions.height / scale);

    const x = (block.x / scale) * scaleX;
    const y = pH - ((block.y / scale) * scaleY) - (block.height / scale) * scaleY;
    const w = (block.width / scale) * scaleX;
    const h = (block.height / scale) * scaleY;

    if (block.type === "checkbox" && block.checked) {
      page.drawText("✓", {
        x,
        y: y + h * 0.1,
        size: h * 0.8,
        color: rgb(0.1, 0.37, 0.64),
      });
      continue;
    }

    // Embed image (signature or typed)
    const base64 = block.dataUrl.split(",")[1];
    const imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const image = await pdfDoc.embedPng(imageBytes);

    page.drawImage(image, { x, y, width: w, height: h });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * Auto-crop a canvas to its ink bounds, returning a transparent-background data URL
 */
export function cropCanvasToContent(source: HTMLCanvasElement): string {
  const ctx = source.getContext("2d")!;
  const { width, height } = source;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX) return source.toDataURL(); // nothing drawn

  const padding = 8;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width, maxX + padding);
  maxY = Math.min(height, maxY + padding);

  const cropped = document.createElement("canvas");
  cropped.width = maxX - minX;
  cropped.height = maxY - minY;
  cropped.getContext("2d")!.drawImage(source, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
  return cropped.toDataURL("image/png");
}

/**
 * Render typed signature text to a transparent PNG data URL
 */
export function typeToDataUrl(
  text: string,
  font: string,
  color: string,
  bgColor: string
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 100;
  const ctx = canvas.getContext("2d")!;

  if (bgColor && bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 400, 100);
  }

  ctx.font = `italic 52px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 200, 50);
  return canvas.toDataURL("image/png");
}
