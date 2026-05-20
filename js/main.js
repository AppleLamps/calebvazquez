import './core/pdfjs.js';
import { loadHighlightsFromStorage } from './highlights/storage.js';
import { initHighlightsSidebar } from './highlights/sidebar.js';
import { setupHighlightListeners } from './highlights/listeners.js';
import { loadPDF } from './pdf/loader.js';
import { initTheme } from './theme.js';
import { setupEventListeners } from './ui/events.js';
import { setupFullscreenListener } from './ui/fullscreen.js';

document.addEventListener('DOMContentLoaded', () => {
  loadHighlightsFromStorage();
  initHighlightsSidebar();
  setupEventListeners();
  setupHighlightListeners();
  setupFullscreenListener();
  loadPDF();
  initTheme();
});
