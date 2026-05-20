import { HIGHLIGHTS_STORAGE_KEY, PDF_PATH } from '../core/config.js';
import { state } from '../core/state.js';
import { showHighlightToast } from './ui.js';

export function loadHighlightsFromStorage() {
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
    if (!raw) {
      state.savedHighlights = [];
      return;
    }
    const parsed = JSON.parse(raw);
    state.savedHighlights = Array.isArray(parsed.highlights) ? parsed.highlights : [];
  } catch (err) {
    console.warn('Could not load saved highlights:', err);
    state.savedHighlights = [];
  }
}

export function persistHighlightsToStorage() {
  try {
    localStorage.setItem(
      HIGHLIGHTS_STORAGE_KEY,
      JSON.stringify({ version: 1, pdfPath: PDF_PATH, highlights: state.savedHighlights })
    );
  } catch (err) {
    console.warn('Could not save highlights:', err);
    showHighlightToast('Could not save highlight');
  }
}

export function createHighlightId() {
  return `hl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
