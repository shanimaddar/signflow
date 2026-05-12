"use client";
import { useDragResize } from "@/hooks/useDragResize";
import { useEditorStore } from "@/store/editorStore";
import type { Block } from "@/types";
import { clsx } from "clsx";

const BORDER_COLOR: Record<Block["type"], string> = {
  signature: "#185FA5",
  text:      "#854F0B",
  checkbox:  "#3B6D11",
};

interface BlockOverlayProps {
  block: Block;
  isSelected: boolean;
  scale: number;
}

export function BlockOverlay({ block, isSelected, scale }: BlockOverlayProps) {
  const { removeBlock, selectBlock, updateBlock } = useEditorStore();
  const { onDragStart, onResizeStart } = useDragResize(block.id);

  const color = BORDER_COLOR[block.type];

  const handleCheckboxToggle = () => {
    if (block.type !== "checkbox") return;
    updateBlock(block.id, { checked: !block.checked, filled: true });
  };

  return (
    <div
      onMouseDown={block.type === "checkbox" ? undefined : onDragStart}
      onClick={block.type === "checkbox" ? handleCheckboxToggle : () => selectBlock(block.id)}
      style={{
        position:    "absolute",
        left:        block.x * scale,
        top:         block.y * scale,
        width:       block.width * scale,
        height:      block.height * scale,
        border:      `${isSelected ? 2 : 1.5}px ${block.filled ? "solid" : "dashed"} ${color}`,
        borderRadius: 4,
        cursor:      block.type === "checkbox" ? "pointer" : "move",
        overflow:    "visible",
        background:  block.filled ? "transparent" : `${color}18`,
        outline:     isSelected ? `2px solid ${color}` : "none",
        outlineOffset: 2,
        display:     "flex",
        alignItems:  "center",
        justifyContent: "center",
        userSelect:  "none",
        zIndex:      isSelected ? 20 : 10,
      }}
    >
      {/* Content */}
      {block.filled && block.dataUrl && (
        <img
          src={block.dataUrl}
          alt="signature"
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
          draggable={false}
        />
      )}
      {block.type === "checkbox" && !block.dataUrl && (
        <span style={{ fontSize: block.height * scale * 0.7, color, lineHeight: 1, pointerEvents: "none" }}>
          {block.checked ? "☑" : "☐"}
        </span>
      )}
      {!block.filled && block.type !== "checkbox" && (
        <span style={{ fontSize: 9, color, textAlign: "center", pointerEvents: "none", lineHeight: 1.4 }}>
          {block.type === "signature" ? "✍ Signature" : "T Text"}
        </span>
      )}

      {/* Delete button */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
        style={{
          position: "absolute", top: -9, right: -9,
          width: 18, height: 18, borderRadius: "50%",
          background: "#E24B4A", color: "#fff", border: "none",
          fontSize: 11, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 30, lineHeight: 1,
        }}
        aria-label="Remove block"
      >
        ×
      </button>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        style={{
          position: "absolute", bottom: -5, right: -5,
          width: 10, height: 10, borderRadius: 2,
          background: color, cursor: "se-resize", zIndex: 30,
        }}
      />
    </div>
  );
}
