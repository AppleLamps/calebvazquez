import { state } from '../core/state.js';
import { elements } from '../core/dom.js';

function findTextLayerAncestor(node) {
  let current = node;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE && current.classList?.contains('textLayer')) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

function getTextOffsetInLayer(textLayer, container, offset) {
  const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT);
  let position = 0;
  let node;

  while ((node = walker.nextNode())) {
    if (node === container) return position + offset;
    position += node.textContent.length;
  }
  return null;
}

export function getSelectionContext() {
  const selection = window.getSelection();
  if (!selection?.rangeCount || selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  const textLayer = findTextLayerAncestor(range.commonAncestorContainer);
  if (!textLayer) return null;

  const pageNum = parseInt(textLayer.closest('.page-wrapper')?.getAttribute('data-page-num'), 10);
  if (!pageNum) return null;

  const fullText = textLayer.textContent;
  const start = getTextOffsetInLayer(textLayer, range.startContainer, range.startOffset);
  const end = getTextOffsetInLayer(textLayer, range.endContainer, range.endOffset);

  if (start === null || end === null || start >= end) return null;

  const text = fullText.slice(start, end);
  if (!text.trim()) return null;

  return { pageNum, start, end, text, rangeRect: range.getBoundingClientRect() };
}

export function showHighlightToolbar(context) {
  if (!elements.highlightToolbar || !context?.rangeRect) return;

  state.pendingSelection = context;
  const rect = context.rangeRect;
  const toolbar = elements.highlightToolbar;
  const margin = 8;

  toolbar.classList.remove('hidden');
  const toolbarRect = toolbar.getBoundingClientRect();
  let top = rect.top - toolbarRect.height - margin;
  let left = rect.left + rect.width / 2 - toolbarRect.width / 2;

  if (top < margin) top = rect.bottom + margin;
  left = Math.max(margin, Math.min(left, window.innerWidth - toolbarRect.width - margin));

  toolbar.style.top = `${top}px`;
  toolbar.style.left = `${left}px`;
}

export function hideHighlightToolbar() {
  state.pendingSelection = null;
  elements.highlightToolbar?.classList.add('hidden');
}

export function handleTextSelectionEnd() {
  setTimeout(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) {
      hideHighlightToolbar();
      return;
    }
    const context = getSelectionContext();
    if (!context) hideHighlightToolbar();
    else showHighlightToolbar(context);
  }, 10);
}
