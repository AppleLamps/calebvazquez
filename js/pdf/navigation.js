import { state } from '../core/state.js';
import { elements } from '../core/dom.js';
import { setupLayoutMode } from './layout.js';
import { updateActiveThumbnail } from './thumbnails.js';
import { updateHighlightsSidebarActiveState } from '../highlights/sidebar.js';

export function navigateToPage(num) {
  if (num < 1 || num > state.totalPages) return;

  state.pageNum = num;
  elements.currentPageInput.value = num;
  updateActiveThumbnail();

  if (state.layoutMode === 'presentation') {
    setupLayoutMode();
  } else {
    const pageWrapper = document.getElementById(`page-wrapper-${num}`);
    if (pageWrapper) {
      pageWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  updateControls();
  updateHighlightsSidebarActiveState();
}

export function updateControls() {
  elements.currentPageInput.value = state.pageNum;

  elements.firstPageBtn.disabled = state.pageNum === 1;
  elements.prevPageBtn.disabled = state.pageNum === 1;
  elements.prevSlideOverlay.disabled = state.pageNum === 1;

  elements.nextPageBtn.disabled = state.pageNum === state.totalPages;
  elements.lastPageBtn.disabled = state.pageNum === state.totalPages;
  elements.nextSlideOverlay.disabled = state.pageNum === state.totalPages;
}

