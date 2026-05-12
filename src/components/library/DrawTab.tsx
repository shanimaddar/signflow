"use client";
import { useState } from "react";
import { useDrawCanvas } from "@/hooks/useDrawCanvas";
import { useEditorStore } from "@/store/editorStore";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { useToast } from "@/components/ui/Toast";
import { cropCanvasToContent } from "@/lib/pdfUtils";

const INK_COLORS = ["#2C2C2A", "#185FA5", "#1D9E75", "#993C1D", "#7F77DD", "#D4537E", "#BA7517", "#378ADD"];
const BG_COLORS  = ["transparent", "#FFFEF0", "#E6F1FB", "#EAF3DE", "#F1EFE8", "#FFF0F5"];

export function DrawTab({ onToast }: { onToast: (msg: string) => void }) {
  const [inkColor, setInkColor] = useState("#2C2C2A");
  const [bgColor, setBgColor]   = useState("transparent");
  const [thickness, setThickness] = useState(2);
  const [sigName, setSigName]   = useState("My signature");
  const [saveToLib, setSaveToLib] = useState(true);

  const { saveSignature, blocks, fillBlock, addBlock, currentPage } = useEditorStore();
  const { canvasRef, hasDrawn, startDraw, draw, stopDraw, clear, getDataUrl } = useDrawCanvas({ color: inkColor, thickness, bgColor });

  const getNextEmptyBlock = () => blocks.find((b) => b.type === "signature" && b.pageIndex === currentPage && !b.filled);

  const handlePlace = () => {
    const dataUrl = getDataUrl();
    if (!dataUrl) { onToast("Draw your signature first"); return; }
    const cropped = cropCanvasToContent(canvasRef.current!);
    if (saveToLib) saveSignature(sigName || "Signature", cropped);
    const zone = getNextEmptyBlock();
    if (zone) {
      fillBlock(zone.id, cropped);
      onToast("Signature placed in zone");
    } else {
      addBlock("signature", currentPage);
      setTimeout(() => {
        const z = useEditorStore.getState().blocks.find((b) => b.type === "signature" && !b.filled);
        if (z) fillBlock(z.id, cropped);
      }, 50);
      onToast("New zone created and filled");
    }
  };

  const handleSave = () => {
    const dataUrl = getDataUrl();
    if (!dataUrl) { onToast("Draw something first"); return; }
    saveSignature(sigName || "Signature", cropCanvasToContent(canvasRef.current!));
    onToast(`"${sigName}" saved to library`);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Draw</p>

      {/* Canvas */}
      <div className="relative border border-gray-200 rounded-lg overflow-hidden" style={{ background: bgColor === "transparent" ? "white" : bgColor }}>
        <canvas
          ref={canvasRef}
          width={460}
          height={200}
          className="block w-full"
          style={{ height: 110, touchAction: "none", cursor: "crosshair" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={(e) => { e.preventDefault(); startDraw(e); }}
          onTouchMove={(e) => { e.preventDefault(); draw(e); }}
          onTouchEnd={stopDraw}
        />
        {!hasDrawn && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none text-center leading-relaxed">
            Sign here<br /><span className="text-[10px]">mouse · touch · stylus</span>
          </p>
        )}
      </div>

      {/* Thickness */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500 w-16">Thickness</span>
        <input type="range" min={1} max={8} step={1} value={thickness} onChange={(e) => setThickness(+e.target.value)} className="flex-1 h-1" />
        <span className="text-[11px] text-gray-500 w-4">{thickness}</span>
      </div>

      {/* Colors */}
      <div className="flex items-start gap-2">
        <span className="text-[11px] text-gray-500 w-16 pt-0.5">Ink</span>
        <ColorPicker colors={INK_COLORS} selected={inkColor} onChange={setInkColor} />
      </div>
      <div className="flex items-start gap-2">
        <span className="text-[11px] text-gray-500 w-16 pt-0.5">Background</span>
        <ColorPicker colors={BG_COLORS} selected={bgColor} onChange={setBgColor} round={false} />
      </div>

      {/* Save name */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="drawSave" checked={saveToLib} onChange={(e) => setSaveToLib(e.target.checked)} className="accent-blue-600" />
        <label htmlFor="drawSave" className="text-[11px] text-gray-500">Save as</label>
        <input
          value={sigName}
          onChange={(e) => setSigName(e.target.value)}
          className="flex-1 text-[11px] px-2 py-1 border border-gray-200 rounded bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300"
          placeholder="Name…"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={clear} className="flex-1 text-[11px] py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors">Clear</button>
        <button onClick={handleSave} className="flex-1 text-[11px] py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium">Save</button>
        <button onClick={handlePlace} className="flex-1 text-[11px] py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">Place</button>
      </div>
    </div>
  );
}
