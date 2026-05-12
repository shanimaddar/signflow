"use client";
import { clsx } from "clsx";

interface ColorPickerProps {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
  round?: boolean;
}

export function ColorPicker({ colors, selected, onChange, round = true }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={c}
          className={clsx(
            "w-5 h-5 border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1",
            round ? "rounded-full" : "rounded-sm",
            selected === c ? "border-gray-800 scale-110" : "border-transparent",
            c === "transparent" && "border border-gray-300"
          )}
          style={{ background: c === "transparent" ? "white" : c }}
          aria-label={c === "transparent" ? "No background" : c}
        >
          {c === "transparent" && (
            <span className="text-gray-400 text-[8px] leading-none flex items-center justify-center w-full h-full">∅</span>
          )}
        </button>
      ))}
    </div>
  );
}
