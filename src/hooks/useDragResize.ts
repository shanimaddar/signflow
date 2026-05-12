"use client";
import { useCallback, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";

export function useDragResize(blockId: string) {
  const { updateBlock, selectBlock } = useEditorStore();
  const dragging = useRef(false);
  const resizing = useRef(false);
  const start = useRef({ x: 0, y: 0, bx: 0, by: 0, bw: 0, bh: 0 });

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const store = useEditorStore.getState();
      const block = store.blocks.find((b) => b.id === blockId);
      if (!block) return;
      dragging.current = true;
      start.current = { x: e.clientX, y: e.clientY, bx: block.x, by: block.y, bw: block.width, bh: block.height };
      selectBlock(blockId);

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        updateBlock(blockId, {
          x: Math.max(0, start.current.bx + (ev.clientX - start.current.x)),
          y: Math.max(0, start.current.by + (ev.clientY - start.current.y)),
        });
      };
      const onUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [blockId, updateBlock, selectBlock]
  );

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const store = useEditorStore.getState();
      const block = store.blocks.find((b) => b.id === blockId);
      if (!block) return;
      resizing.current = true;
      start.current = { x: e.clientX, y: e.clientY, bx: block.x, by: block.y, bw: block.width, bh: block.height };

      const onMove = (ev: MouseEvent) => {
        if (!resizing.current) return;
        updateBlock(blockId, {
          width:  Math.max(20, start.current.bw + (ev.clientX - start.current.x)),
          height: Math.max(20, start.current.bh + (ev.clientY - start.current.y)),
        });
      };
      const onUp = () => {
        resizing.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [blockId, updateBlock]
  );

  return { onDragStart, onResizeStart };
}
