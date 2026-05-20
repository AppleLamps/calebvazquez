import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { escapeHtml, truncateText } from '../utils.js';
import { navigateToPage } from '../pdf/navigation.js';
import { renderPage } from '../pdf/page.js';
import { highlightPageText } from '../search/index.js';
import { calculateDefaultZoom, triggerZoomChange } from '../pdf/zoom.js';
import { removeHighlightById } from './actions.js';
import { showHighlightToast } from './ui.js';

const EMPTY_HTML =
  '<p class="highlights-empty">Select text on a slide and click <strong>Highlight</strong> to save notes here.</p>';

export function renderHighlightsSidebar() {
  if (!elements.highlightsList) return;

  const count = state.savedHighlights.length;
  if (elements.highlightsSidebarCount) elements.highlightsSidebarCount.textContent = count;
  if (elements.highlightsToggleBadge) {
    elements.highlightsToggleBadge.textContent = count;
    elements.highlightsToggleBadge.classList.toggle('hidden', count === 0);
  }
  if (elements.clearHighlightsBtn) elements.clearHighlightsBtn.disabled = count === 0;

  if (count === 0) {
    elements.highlightsList.innerHTML = EMPTY_HTML;
    return;
  }

  const sorted = [...state.savedHighlights].sort((a, b) => {
    if (a.pageNum !== b.pageNum) return a.pageNum - b.pageNum;
    return a.start - b.start;
  });

  elements.highlightsList.innerHTML = '';
  let lastPage = null;

  sorted.forEach((hl) => {
    if (hl.pageNum !== lastPage) {
      lastPage = hl.pageNum;
      const label = document.createElement('p');
      label.className = 'highlights-group-label';
      label.textContent = `Slide ${hl.pageNum}`;
      elements.highlightsList.appendChild(label);
    }
    elements.highlightsList.appendChild(createHighlightListItem(hl));
  });

  updateHighlightsSidebarActiveState();
}

function createHighlightListItem(hl) {
  const item = document.createElement('div');
  item.className = 'highlight-list-item';
  item.dataset.highlightId = hl.id;
  if (hl.pageNum === state.pageNum) item.classList.add('active');

  item.innerHTML = `
    <span class="highlight-list-excerpt">${escapeHtml(truncateText(hl.text, 140))}</span>
    <span class="highlight-list-meta">Slide ${hl.pageNum}</span>
  `;

  item.addEventListener('click', () => goToHighlight(hl));

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'highlight-list-delete';
  deleteBtn.title = 'Remove highlight';
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (removeHighlightById(hl.id)) {
      if (hl.pageNum) {
        renderPage(hl.pageNum);
        if (state.searchQuery) highlightPageText(hl.pageNum);
      }
      showHighlightToast('Highlight removed');
    }
  });

  item.appendChild(deleteBtn);
  return item;
}

export function goToHighlight(hl) {
  navigateToPage(hl.pageNum);
  setTimeout(() => flashHighlightInViewport(hl.id), 350);
}

function flashHighlightInViewport(highlightId) {
  const mark = document.querySelector(`.user-highlight[data-highlight-id="${highlightId}"]`);
  if (!mark) return;

  mark.classList.add('user-highlight-flash');
  mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => mark.classList.remove('user-highlight-flash'), 2000);

  document.querySelectorAll('.highlight-list-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.highlightId === highlightId);
  });
}

export function updateHighlightsSidebarActiveState() {
  document.querySelectorAll('.highlight-list-item').forEach((el) => {
    const hl = state.savedHighlights.find((h) => h.id === el.dataset.highlightId);
    el.classList.toggle('active', hl?.pageNum === state.pageNum);
  });
}

export function toggleHighlightsSidebar() {
  state.highlightsSidebarCollapsed = !state.highlightsSidebarCollapsed;
  elements.highlightsSidebar?.classList.toggle('collapsed', state.highlightsSidebarCollapsed);
  elements.toggleHighlightsSidebarBtn?.setAttribute(
    'aria-expanded',
    String(!state.highlightsSidebarCollapsed)
  );

  if (!state.highlightsSidebarCollapsed) {
    setTimeout(async () => {
      await calculateDefaultZoom();
      triggerZoomChange();
    }, parseInt(getComputedStyle(document.documentElement).getPropertyValue('--transition-speed')) * 1000);
  }
}

export function openHighlightsSidebar() {
  if (!state.highlightsSidebarCollapsed) return;
  toggleHighlightsSidebar();
}

export function initHighlightsSidebar() {
  elements.highlightsSidebar?.classList.toggle('collapsed', state.highlightsSidebarCollapsed);
  elements.toggleHighlightsSidebarBtn?.setAttribute(
    'aria-expanded',
    String(!state.highlightsSidebarCollapsed)
  );
  renderHighlightsSidebar();
}

