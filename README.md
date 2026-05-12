# SignFlow

PDF signing app — Next.js 14 · TypeScript · Tailwind CSS · pdf-lib · pdf.js · Zustand

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

## Project structure

```
signflow/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main editor page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── editor/
│   │   │   ├── Toolbar.tsx       # Top bar — upload, export, zoom, page nav
│   │   │   ├── Sidebar.tsx       # Left nav
│   │   │   ├── PDFCanvas.tsx     # PDF render + block overlays
│   │   │   ├── BlockOverlay.tsx  # Draggable/resizable block (sig/text/checkbox)
│   │   │   └── LayersPanel.tsx   # Layer manager — list, select, delete blocks
│   │   ├── library/
│   │   │   ├── LibraryPanel.tsx  # Tab container
│   │   │   ├── DrawTab.tsx       # Draw signature on canvas
│   │   │   ├── TypeTab.tsx       # Type signature with font/color options
│   │   │   └── SavedTab.tsx      # Saved signatures + upload JPEG/PNG
│   │   └── ui/
│   │       ├── ColorPicker.tsx   # Reusable color dot picker
│   │       └── Toast.tsx         # Toast notifications + hook
│   ├── hooks/
│   │   ├── useDrawCanvas.ts      # Canvas drawing logic (mouse + touch + stylus)
│   │   └── useDragResize.ts      # Block drag and resize logic
│   ├── lib/
│   │   └── pdfUtils.ts           # PDF render (pdf.js), export (pdf-lib), cropCanvas, typeToDataUrl
│   ├── store/
│   │   └── editorStore.ts        # Zustand store — all editor state
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## Key libraries

| Library | Purpose |
|---|---|
| `pdf-lib` | Embed signatures into PDF binary on export |
| `pdfjs-dist` | Render PDF pages to canvas for display |
| `zustand` | Global state — blocks, saved signatures, PDF doc |
| `lucide-react` | Icons |
| `next-intl` | i18n — English + Hebrew (RTL) ready |
| `@radix-ui/*` | Accessible UI primitives (dialogs, tabs, sliders) |

## Features implemented

- Upload PDF from device
- Draw signature (mouse, touch, stylus) with ink color, background color, thickness
- Type signature with font style, ink color, background color
- Upload JPEG/PNG as signature
- Save signatures to library (persisted in localStorage)
- Delete saved signatures
- Place signature/text/checkbox blocks on PDF — draggable, resizable, all types
- Layers panel — see all blocks, select, delete
- Auto-crop drawn signatures to ink bounds before saving
- Export signed PDF (download)
- 30-day trial banner

## Next steps

- [ ] Connect Supabase (auth + cloud storage)
- [ ] Stripe billing integration
- [ ] Hebrew RTL layout (next-intl already installed)
- [ ] Multi-page PDF navigation UI
- [ ] Email export via Resend
- [ ] Cloud integrations (Google Drive, Dropbox, OneDrive)
