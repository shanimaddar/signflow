"use client";
import { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Plus, Trash2, Upload } from "lucide-react";

export function SavedTab({ onToast, onSwitchDraw }: { onToast: (msg: string) => void; onSwitchDraw: () => void }) {
  const { savedSignatures, deleteSignature, saveSignature, blocks, fillBlock, addBlock, currentPage } = useEditorStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const placeFromLib = (dataUrl: string, name: string) => {
    const zone = blocks.find((b) => b.type === "signature" && b.pageIndex === currentPage && !b.filled);
    if (zone) {
      fillBlock(zone.id, dataUrl);
      onToast(`"${name}" placed`);
    } else {
      addBlock("signature", currentPage);
      setTimeout(() => {
        const z = useEditorStore.getState().blocks.find((b) => b.type === "signature" && !b.filled);
        if (z) fillBlock(z.id, dataUrl);
      }, 50);
      onToast("New zone created and filled");
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      saveSignature(file.name.replace(/\.[^.]+$/, ""), ev.target!.result as string);
      onToast(`"${file.name}" uploaded to library`);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Saved signatures</p>

      <div className="grid grid-cols-2 gap-2">
        {/* New button */}
        <button
          onClick={onSwitchDraw}
          className="border border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center gap-1 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Plus size={18} />
          <span className="text-[10px]">New</span>
        </button>

        {savedSignatures.map((sig) => (
          <div
            key={sig.id}
            className="relative border border-gray-200 rounded-lg p-1.5 flex flex-col items-center gap-1 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            onClick={() => placeFromLib(sig.dataUrl, sig.name)}
          >
            <div className="w-full h-9 flex items-center justify-center overflow-hidden">
              <img src={sig.dataUrl} alt={sig.name} className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-[10px] text-gray-500 truncate w-full text-center">{sig.name}</span>

            {/* Delete on hover */}
            <button
              onClick={(e) => { e.stopPropagation(); deleteSignature(sig.id); onToast("Signature removed"); }}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white items-center justify-center hidden group-hover:flex"
              aria-label="Delete signature"
            >
              <Trash2 size={8} />
            </button>
          </div>
        ))}
      </div>

      {/* Upload */}
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
      >
        <Upload size={15} />
        Upload JPEG or PNG
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}
