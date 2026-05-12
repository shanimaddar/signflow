export type BlockType = "signature" | "text" | "checkbox";

export interface Block {
  id: string;
  type: BlockType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  filled: boolean;
  dataUrl?: string;
  checked?: boolean; // for checkbox blocks
  pageIndex: number;
}

export interface SavedSignature {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
}

export interface PDFDocument {
  id: string;
  name: string;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
}

export type TabName = "draw" | "type" | "saved";

export type Language = "en" | "he";
