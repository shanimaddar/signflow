"use client";
import { useEditorStore } from "@/store/editorStore";
import { Layers } from "lucide-react";
import type { Block } from "@/types";

const PIP: Record<Block["type"], string> = {
  signature: "#185FA5",
  text:      "#854F0B",
  checkbox:  "#3B6D11",
};

export function LayersPanel() {
  const { blocks, selectedBlockId, selectBlock, removeBlock } = useEditorStore();

  return (
    <div className="flex flex-col border-t border-gray-100" style={{ height: 170 }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          <Layers size={12} />
          Layers
        </span>
        <span className="text-[11px] text-gray-400">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {blocks.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">No blocks yet</p>
        ) : (
          [...blocks].reverse().map((block) => (
            <div
              key={block.id}
              onClick={() => selectBlock(block.id)}
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                selectedBlockId === block.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: PIP[block.type] }}
              />
              <span className="flex-1 truncate">{block.name}</span>
              {block.filled && (
                <span className="text-[9px] text-green-600 bg-green-50 px-1 rounded">filled</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                aria-label={`Remove ${block.name}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
