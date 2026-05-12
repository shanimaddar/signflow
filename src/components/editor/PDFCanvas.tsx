"use client";
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { BlockOverlay } from "./BlockOverlay";
import { renderPageToCanvas } from "@/lib/pdfUtils";

export function PDFCanvas() {
  const { pdfDoc, currentPage, zoom, blocks, selectedBlockId, addBlock } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    renderPageToCanvas(pdfDoc.arrayBuffer, currentPage, canvasRef.current, 1.5 * zoom).then(() => {
      if (canvasRef.current) {
        setCanvasDims({ width: canvasRef.current.offsetWidth, height: canvasRef.current.offsetHeight });
      }
    });
  }, [pdfDoc, currentPage, zoom]);

  if (!pdfDoc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p className="text-lg font-medium mb-1">No document open</p>
          <p className="text-sm">Upload a PDF to start signing</p>
        </div>
      </div>
    );
  }

  const pageBlocks = blocks.filter((b) => b.pageIndex === currentPage);

  return (
    <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-6">
      <div className="relative shadow-xl" style={{ display: "inline-block" }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {/* Block overlays */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {pageBlocks.map((block) => (
            <div key={block.id} style={{ pointerEvents: "all" }}>
              <BlockOverlay
                block={block}
                isSelected={selectedBlockId === block.id}
                scale={1}
              />
            </div>
          ))}
        </div>

        {/* Add zone buttons */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {(["signature", "text", "checkbox"] as const).map((type) => (
            <button
              key={type}
              onClick={() => addBlock(type, currentPage)}
              className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-sm"
            >
              + {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
