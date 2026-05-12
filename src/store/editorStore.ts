import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { Block, BlockType, SavedSignature, PDFDocument, TabName } from "@/types";

interface EditorState {
  // PDF
  pdfDoc: PDFDocument | null;
  currentPage: number;
  zoom: number;

  // Blocks on canvas
  blocks: Block[];
  selectedBlockId: string | null;

  // Library
  savedSignatures: SavedSignature[];
  activeTab: TabName;

  // Actions
  setPdf: (doc: PDFDocument) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;

  addBlock: (type: BlockType, pageIndex: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  fillBlock: (id: string, dataUrl: string) => void;

  saveSignature: (name: string, dataUrl: string) => void;
  deleteSignature: (id: string) => void;

  setActiveTab: (tab: TabName) => void;
  reset: () => void;
}

const BLOCK_DEFAULTS: Record<BlockType, { width: number; height: number }> = {
  signature: { width: 160, height: 60 },
  text:      { width: 160, height: 48 },
  checkbox:  { width: 28,  height: 28 },
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      pdfDoc: null,
      currentPage: 0,
      zoom: 1,
      blocks: [],
      selectedBlockId: null,
      savedSignatures: [],
      activeTab: "draw",

      setPdf: (doc) => set({ pdfDoc: doc, blocks: [], currentPage: 0 }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setZoom: (zoom) => set({ zoom }),

      addBlock: (type, pageIndex) => {
        const id = uuid();
        const defaults = BLOCK_DEFAULTS[type];
        const block: Block = {
          id,
          type,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${get().blocks.length + 1}`,
          x: 80,
          y: 120,
          width: defaults.width,
          height: defaults.height,
          filled: false,
          pageIndex,
        };
        set((s) => ({ blocks: [...s.blocks, block], selectedBlockId: id }));
      },

      updateBlock: (id, updates) =>
        set((s) => ({
          blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      removeBlock: (id) =>
        set((s) => ({
          blocks: s.blocks.filter((b) => b.id !== id),
          selectedBlockId: s.selectedBlockId === id ? null : s.selectedBlockId,
        })),

      selectBlock: (id) => set({ selectedBlockId: id }),

      fillBlock: (id, dataUrl) =>
        set((s) => ({
          blocks: s.blocks.map((b) =>
            b.id === id ? { ...b, filled: true, dataUrl } : b
          ),
        })),

      saveSignature: (name, dataUrl) => {
        const existing = get().savedSignatures;
        if (existing.find((s) => s.name === name && s.dataUrl === dataUrl)) return;
        set((s) => ({
          savedSignatures: [
            ...s.savedSignatures,
            { id: uuid(), name, dataUrl, createdAt: Date.now() },
          ],
        }));
      },

      deleteSignature: (id) =>
        set((s) => ({
          savedSignatures: s.savedSignatures.filter((s) => s.id !== id),
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      reset: () =>
        set({ pdfDoc: null, blocks: [], selectedBlockId: null, currentPage: 0 }),
    }),
    {
      name: "signflow-storage",
      partialize: (s) => ({ savedSignatures: s.savedSignatures }),
    }
  )
);
