"use client";
import { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { exportSignedPDF } from "@/lib/pdfUtils";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Upload } from "lucide-react";

export function Toolbar({ onToast }: { onToast: (msg: string) => void }) {
  const { pdfDoc, setPdf, currentPage, setCurrentPage, zoom, setZoom, blocks, reset } = useEditorStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") { onToast("Please select a PDF file"); return; }
    const buffer = await file.arrayBuffer();

    // Get page count
    const { getDocument, GlobalWorkerOptions, version } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    const doc = await getDocument({ data: buffer.slice(0) }).promise;

    setPdf({ id: Date.now().toString(), name: file.name, arrayBuffer: buffer, pageCount: doc.numPages });
    onToast(`"${file.name}" loaded — ${doc.numPages} page${doc.numPages !== 1 ? "s" : ""}`);
    e.target.value = "";
  };

  const handleExport = async () => {
    if (!pdfDoc) { onToast("Upload a PDF first"); return; }
    try {
      const blob = await exportSignedPDF(pdfDoc.arrayBuffer, blocks, { width: 800, height: 1100 }, zoom);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `signed_${pdfDoc.name}`;
      a.click();
      URL.revokeObjectURL(url);
      onToast("PDF downloaded!");
    } catch {
      onToast("Export failed — try again");
    }
  };

  return (
    <div className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0">
      {/* File name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-gray-800 truncate max-w-48">
          {pdfDoc ? pdfDoc.name : "No document"}
        </span>
        {pdfDoc && (
          <span className="text-xs text-gray-400">· {pdfDoc.pageCount} page{pdfDoc.pageCount !== 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="flex-1" />

      {/* Page navigation */}
      {pdfDoc && pdfDoc.pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors" aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-gray-600 w-16 text-center">
            {currentPage + 1} / {pdfDoc.pageCount}
          </span>
          <button onClick={() => setCurrentPage(Math.min(pdfDoc.pageCount - 1, currentPage + 1))} disabled={currentPage === pdfDoc.pageCount - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors" aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Zoom out"><ZoomOut size={15} /></button>
        <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(2.5, zoom + 0.25))} className="p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Zoom in"><ZoomIn size={15} /></button>
      </div>

      {/* Trial badge */}
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">Trial · 28 days</span>

      {/* Upload */}
      <button onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
        <Upload size={13} /> Open PDF
      </button>
      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />

      {/* Export */}
      <button onClick={handleExport}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
        <Download size={13} /> Export
      </button>
    </div>
  );
}
