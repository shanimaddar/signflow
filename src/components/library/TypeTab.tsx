"use client";
import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { typeToDataUrl } from "@/lib/pdfUtils";
import { clsx } from "clsx";

const INK_COLORS = ["#2C2C2A", "#185FA5", "#1D9E75", "#993C1D", "#7F77DD", "#D4537E", "#BA7517", "#378ADD"];
const BG_COLORS  = ["transparent", "#FFFEF0", "#E6F1FB", "#EAF3DE", "#F1EFE8", "#FFF0F5"];
const FONTS = [
  { label: "Script",  value: "cursive",        style: "italic" },
  { label: "Serif",   value: "Georgia,serif",  style: "italic" },
  { label: "Modern",  value: "Arial,sans-serif", style: "normal" },
];

export function TypeTab({ onToast }: { onToast: (msg: string) => void }) {
  const [text, setText]       = useState("John Smith");
  const [inkColor, setInk]    = useState("#2C2C2A");
  const [bgColor, setBg]      = useState("transparent");
  const [font, setFont]       = useState(FONTS[0].value);
  const [sigName, setSigName] = useState("My signature");
  const [saveToLib, setSave]  = useState(true);

  const { saveSignature, blocks, fillBlock, addBlock, currentPage } = useEditorStore();

  const getDataUrl = () => typeToDataUrl(text, font, inkColor, bgColor);
  const getEmpty   = () => blocks.find((b) => b.type === "text" && b.pageIndex === currentPage && !b.filled);
  const currentFont = FONTS.find((f) => f.value === font)!;

  const handlePlace = () => {
    if (!text.trim()) { onToast("Type your name first"); return; }
    const dataUrl = getDataUrl();
    if (saveToLib) saveSignature(sigName || text, dataUrl);
    const zone = getEmpty();
    if (zone) {
      fillBlock(zone.id, dataUrl);
      onToast("Placed in text zone");
    } else {
      addBlock("text", currentPage);
      setTimeout(() => {
        const z = useEditorStore.getState().blocks.find((b) => b.type === "text" && !b.filled);
        if (z) fillBlock(z.id, dataUrl);
      }, 50);
      onToast("New text zone created and filled");
    }
  };

  const handleSave = () => {
    if (!text.trim()) { onToast("Type your name first"); return; }
    saveSignature(sigName || text, getDataUrl());
    onToast(`"${sigName}" saved`);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Type</p>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your name…"
        className="w-full text-base px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300"
      />

      <div className="flex items-start gap-2">
        <span className="text-[11px] text-gray-500 w-16 pt-0.5">Color</span>
        <ColorPicker colors={INK_COLORS} selected={inkColor} onChange={setInk} />
      </div>
      <div className="flex items-start gap-2">
        <span className="text-[11px] text-gray-500 w-16 pt-0.5">Background</span>
        <ColorPicker colors={BG_COLORS} selected={bgColor} onChange={setBg} round={false} />
      </div>

      {/* Font selector */}
      <div className="flex gap-1.5">
        {FONTS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFont(f.value)}
            className={clsx(
              "flex-1 text-[11px] py-1 rounded-full border transition-colors",
              font === f.value
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            )}
            style={{ fontFamily: f.value, fontStyle: f.style }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div
        className="border border-gray-200 rounded-lg h-14 flex items-center justify-center overflow-hidden px-3"
        style={{
          fontFamily: font,
          fontStyle: currentFont.style,
          color: inkColor,
          background: bgColor === "transparent" ? "#FAFAFA" : bgColor,
          fontSize: 28,
        }}
      >
        {text || <span className="text-gray-300 text-sm">Your name</span>}
      </div>

      {/* Save name */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="typeSave" checked={saveToLib} onChange={(e) => setSave(e.target.checked)} className="accent-blue-600" />
        <label htmlFor="typeSave" className="text-[11px] text-gray-500">Save as</label>
        <input
          value={sigName}
          onChange={(e) => setSigName(e.target.value)}
          className="flex-1 text-[11px] px-2 py-1 border border-gray-200 rounded bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300"
          placeholder="Name…"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 text-[11px] py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium">Save</button>
        <button onClick={handlePlace} className="flex-1 text-[11px] py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">Place</button>
      </div>
    </div>
  );
}
