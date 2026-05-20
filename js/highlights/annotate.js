import { state } from '../core/state.js';

function unwrapRenderedHighlights(textLayer) {
  textLayer.querySelectorAll('.user-highlight').forEach((mark) => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
  textLayer.normalize();
}

function getPageHighlights(pageNum) {
  return state.savedHighlights
    .filter((hl) => hl.pageNum === pageNum && Number.isFinite(hl.start) && Number.isFinite(hl.end))
    .filter((hl) => hl.start < hl.end)
    .sort((a, b) => a.start - b.start);
}

function splitTextNodeForHighlights(node, nodeStart, nodeEnd, highlights) {
  const text = node.textContent;
  const fragment = document.createDocumentFragment();
  let cursor = 0;
  let changed = false;

  highlights.forEach((hl) => {
    const overlapStart = Math.max(hl.start, nodeStart);
    const overlapEnd = Math.min(hl.end, nodeEnd);
    if (overlapStart >= overlapEnd) return;

    const localStart = overlapStart - nodeStart;
    const localEnd = overlapEnd - nodeStart;
    if (localStart > cursor) {
      fragment.appendChild(document.createTextNode(text.slice(cursor, localStart)));
    }

    const mark = document.createElement('mark');
    mark.className = 'user-highlight';
    mark.dataset.highlightId = hl.id;
    mark.title = 'Saved highlight';
    mark.textContent = text.slice(localStart, localEnd);
    fragment.appendChild(mark);

    cursor = localEnd;
    changed = true;
  });

  if (!changed) return;
  if (cursor < text.length) fragment.appendChild(document.createTextNode(text.slice(cursor)));
  node.replaceWith(fragment);
}

export function applySavedHighlights(pageNum) {
  const textLayer = document.getElementById(`page-text-${pageNum}`);
  if (!textLayer) return;

  unwrapRenderedHighlights(textLayer);

  const highlights = getPageHighlights(pageNum);
  if (highlights.length === 0) return;

  const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let offset = 0;
  let node;

  while ((node = walker.nextNode())) {
    const nodeStart = offset;
    const nodeEnd = nodeStart + node.textContent.length;
    textNodes.push({ node, nodeStart, nodeEnd });
    offset = nodeEnd;
  }

  textNodes.forEach(({ node, nodeStart, nodeEnd }) => {
    const overlapping = highlights.filter((hl) => hl.start < nodeEnd && hl.end > nodeStart);
    if (overlapping.length > 0 && node.isConnected) {
      splitTextNodeForHighlights(node, nodeStart, nodeEnd, overlapping);
    }
  });
}
