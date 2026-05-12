"use client";
import { useRef, useCallback, useState } from "react";

interface DrawOptions {
  color: string;
  thickness: number;
  bgColor: string;
}

export function useDrawCanvas(options: DrawOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = useCallback(
    (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawing.current = true;
      const src = "touches" in e ? e.touches[0] : e.nativeEvent as MouseEvent;
      lastPos.current = getPos(src, canvas);
      setHasDrawn(true);
    },
    [getPos]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const src = "touches" in e ? e.touches[0] : e.nativeEvent as MouseEvent;
      const pos = getPos(src, canvas);

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = options.color;
      ctx.lineWidth = options.thickness * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastPos.current = pos;
    },
    [getPos, options.color, options.thickness]
  );

  const stopDraw = useCallback(() => {
    drawing.current = false;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  const getDataUrl = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return null;

    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tctx = temp.getContext("2d")!;

    if (options.bgColor && options.bgColor !== "transparent") {
      tctx.fillStyle = options.bgColor;
      tctx.fillRect(0, 0, temp.width, temp.height);
    }
    tctx.drawImage(canvas, 0, 0);
    return temp.toDataURL("image/png");
  }, [hasDrawn, options.bgColor]);

  return { canvasRef, hasDrawn, startDraw, draw, stopDraw, clear, getDataUrl };
}
