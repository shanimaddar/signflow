"use client";
import { Sidebar }      from "@/components/editor/Sidebar";
import { Toolbar }      from "@/components/editor/Toolbar";
import { PDFCanvas }    from "@/components/editor/PDFCanvas";
import { LayersPanel }  from "@/components/editor/LayersPanel";
import { LibraryPanel } from "@/components/library/LibraryPanel";
import { Toast, useToast } from "@/components/ui/Toast";

export default function EditorPage() {
  const { toast, show, clear } = useToast();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Toolbar onToast={show} />

        <div className="flex flex-1 overflow-hidden">
          {/* PDF canvas area */}
          <PDFCanvas />

          {/* Right column: library + layers */}
          <div className="w-64 flex flex-col border-l border-gray-100 bg-white flex-shrink-0 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              <LibraryPanel onToast={show} />
            </div>
            <LayersPanel />
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={clear} />}
    </div>
  );
}
