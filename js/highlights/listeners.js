import { elements } from '../core/dom.js';
import { saveHighlightFromSelection } from './actions.js';
import { handleTextSelectionEnd, hideHighlightToolbar } from './selection.js';

let selectionChangeTimeout = null;

export function setupHighlightListeners() {
  elements.viewerViewport?.addEventListener('mouseup', handleTextSelectionEnd);
  elements.viewerViewport?.addEventListener('keyup', handleTextSelectionEnd);
  elements.viewerViewport?.addEventListener('touchend', handleTextSelectionEnd);

  document.addEventListener('selectionchange', () => {
    clearTimeout(selectionChangeTimeout);
    selectionChangeTimeout = setTimeout(handleTextSelectionEnd, 80);
  });

  elements.highlightSaveBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveHighlightFromSelection();
  });

  document.addEventListener('mousedown', (e) => {
    if (elements.highlightToolbar?.contains(e.target)) return;
    hideHighlightToolbar();
  });

  document.addEventListener('scroll', hideHighlightToolbar, true);
}
