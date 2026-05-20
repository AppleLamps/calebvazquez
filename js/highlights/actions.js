import { state } from '../core/state.js';
import { renderPage } from '../pdf/page.js';
import { highlightPageText } from '../search/index.js';
import { triggerZoomChange } from '../pdf/zoom.js';
import { applySavedHighlights } from './annotate.js';
import { persistHighlightsToStorage, createHighlightId } from './storage.js';
import { getSelectionContext, hideHighlightToolbar } from './selection.js';
import { showHighlightToast } from './ui.js';
import { renderHighlightsSidebar } from './sidebar.js';

function overlapsExisting(pageNum, start, end) {
  return state.savedHighlights.some(
    (hl) => hl.pageNum === pageNum && start < hl.end && end > hl.start
  );
}

export function saveHighlightFromSelection() {
  const context = state.pendingSelection || getSelectionContext();
  if (!context) return;

  if (overlapsExisting(context.pageNum, context.start, context.end)) {
    showHighlightToast('This text is already highlighted');
    hideHighlightToolbar();
    window.getSelection()?.removeAllRanges();
    return;
  }

  state.savedHighlights.push({
    id: createHighlightId(),
    pageNum: context.pageNum,
    start: context.start,
    end: context.end,
    text: context.text,
    createdAt: Date.now()
  });

  persistHighlightsToStorage();
  renderHighlightsSidebar();
  hideHighlightToolbar();
  window.getSelection()?.removeAllRanges();

  if (document.getElementById(`page-wrapper-${context.pageNum}`)) {
    if (state.searchQuery) {
      renderPage(context.pageNum);
    } else {
      applySavedHighlights(context.pageNum);
    }
  }

  showHighlightToast('Highlight saved');
}

export function removeHighlightById(id) {
  const before = state.savedHighlights.length;
  state.savedHighlights = state.savedHighlights.filter((hl) => hl.id !== id);
  if (state.savedHighlights.length === before) return false;
  persistHighlightsToStorage();
  renderHighlightsSidebar();
  return true;
}

export function clearAllHighlights() {
  if (state.savedHighlights.length === 0) return;
  if (!confirm('Remove all saved highlights?')) return;

  state.savedHighlights = [];
  persistHighlightsToStorage();
  renderHighlightsSidebar();
  triggerZoomChange();
  showHighlightToast('All highlights cleared');
}

export function removeHighlightFromPage(id, pageNum) {
  if (!removeHighlightById(id)) return;
  if (pageNum) {
    renderPage(pageNum);
    if (state.searchQuery) highlightPageText(pageNum);
  }
  showHighlightToast('Highlight removed');
}
