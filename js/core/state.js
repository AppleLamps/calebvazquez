import { DEFAULT_SCALE } from './config.js';

export const state = {
  pdfDoc: null,
  pageNum: 1,
  totalPages: 1,
  zoomScale: DEFAULT_SCALE,
  zoomMode: 'fit',
  layoutMode: 'presentation',
  theme: 'dark',
  sidebarCollapsed: true,
  highlightsSidebarCollapsed: true,

  textIndex: [],
  searchQuery: '',
  searchResults: [],
  activeSearchMatchIdx: -1,

  renderingQueue: new Map(),
  textQueue: new Map(),
  observer: null,
  resizeTimeout: null,

  savedHighlights: [],
  pendingSelection: null,
  highlightToastTimeout: null
};

