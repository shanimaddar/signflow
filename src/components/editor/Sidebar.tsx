"use client";
import { LayoutDashboard, FileText, PenLine, Settings, User } from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FileText,        label: "Documents"  },
];

const BOTTOM = [
  { icon: Settings, label: "Settings" },
  { icon: User,     label: "Account"  },
];

export function Sidebar({ active = 1 }: { active?: number }) {
  return (
    <div className="w-12 bg-white border-r border-gray-100 flex flex-col items-center py-3 gap-1 flex-shrink-0">
      {NAV.map(({ icon: Icon, label }, i) => (
        <button
          key={label}
          title={label}
          className={clsx(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
            i === active ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          )}
          aria-label={label}
        >
          <Icon size={17} />
        </button>
      ))}

      <div className="w-6 h-px bg-gray-100 my-1" />

      <button title="Signature Library" aria-label="Signature Library"
        className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600 text-white">
        <PenLine size={17} />
      </button>

      <div className="flex-1" />

      {BOTTOM.map(({ icon: Icon, label }) => (
        <button
          key={label}
          title={label}
          aria-label={label}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <Icon size={17} />
        </button>
      ))}
    </div>
  );
}
