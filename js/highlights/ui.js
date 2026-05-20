import { state } from '../core/state.js';
import { elements } from '../core/dom.js';

export function showHighlightToast(message) {
  if (!elements.highlightToast) return;

  elements.highlightToast.textContent = message;
  elements.highlightToast.classList.remove('hidden');

  clearTimeout(state.highlightToastTimeout);
  state.highlightToastTimeout = setTimeout(() => {
    elements.highlightToast.classList.add('hidden');
  }, 2200);
}
