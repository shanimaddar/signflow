"use client";
import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { DrawTab }  from "./DrawTab";
import { TypeTab }  from "./TypeTab";
import { SavedTab } from "./SavedTab";
import { clsx } from "clsx";
import type { TabName } from "@/types";

const TABS: { id: TabName; label: string }[] = [
  { id: "draw",  label: "Draw"  },
  { id: "type",  label: "Type"  },
  { id: "saved", label: "Saved" },
];

export function LibraryPanel({ onToast }: { onToast: (msg: string) => void }) {
  const { activeTab, setActiveTab } = useEditorStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100">
        <p className="font-medium text-sm text-gray-800 mb-2">Signature library</p>
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex-1 text-[11px] py-1 rounded-md transition-all",
                activeTab === tab.id
                  ? "bg-white text-gray-800 font-medium shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === "draw"  && <DrawTab  onToast={onToast} />}
        {activeTab === "type"  && <TypeTab  onToast={onToast} />}
        {activeTab === "saved" && <SavedTab onToast={onToast} onSwitchDraw={() => setActiveTab("draw")} />}
      </div>
    </div>
  );
}
